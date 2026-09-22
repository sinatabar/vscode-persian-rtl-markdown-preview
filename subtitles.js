const SRT_TIME = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
const VTT_TIME = /^(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})$/;

function timeToMs(value) {
  const match = String(value).trim().match(SRT_TIME) || String(value).trim().match(VTT_TIME);
  if (!match) return null;
  const [, hours = "0", minutes, seconds, milliseconds] = match;
  return (((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds)) * 1000) + Number(milliseconds);
}

function parseSubtitles(text, format = "srt") {
  const cleaned = String(text).replace(/^\uFEFF/, "").replace(/^WEBVTT[^\n]*\n+/i, "").trim();
  if (!cleaned) return [];
  return cleaned.split(/\r?\n\s*\r?\n/).filter(Boolean).map((block, index) => {
    const lines = block.split(/\r?\n/);
    let number = "";
    if (/^\d+$/.test(lines[0]?.trim())) number = lines.shift().trim();
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    const timing = timingIndex >= 0 ? lines.splice(timingIndex, 1)[0].trim() : "";
    const [start = "", endWithSettings = ""] = timing.split(/\s*-->\s*/);
    const end = endWithSettings.split(/\s+/)[0] || "";
    const startMs = timeToMs(start);
    const endMs = timeToMs(end);
    const issues = [];
    if (!timing || startMs === null || endMs === null) issues.push("زمان‌بندی نامعتبر");
    if (startMs !== null && endMs !== null && endMs <= startMs) issues.push("پایان باید بعد از شروع باشد");
    return { number: number || String(index + 1), timing, start, end, startMs, endMs, text: lines.join("\n"), issues, format };
  }).map((cue, index, cues) => {
    if (index && cue.startMs !== null && cues[index - 1].endMs !== null && cue.startMs < cues[index - 1].endMs) {
      cue.issues.push("هم‌پوشانی با زیرنویس قبلی");
    }
    if ([...cue.text].length > 84) cue.issues.push("متن طولانی");
    return cue;
  });
}

function toSrt(text, sourceFormat = "vtt") {
  return parseSubtitles(text, sourceFormat).map((cue, index) => {
    const timing = cue.timing.replace(/(\d{2}:\d{2}(?::\d{2})?)\.(\d{3})/g, "$1,$2");
    return `${index + 1}\n${timing}\n${cue.text}`;
  }).join("\n\n");
}

function toVtt(text, sourceFormat = "srt") {
  const body = parseSubtitles(text, sourceFormat).map((cue) => {
    const timing = cue.timing.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
    return `${timing}\n${cue.text}`;
  }).join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

function parseAss(text) {
  return String(text).split(/\r?\n/).filter((line) => /^Dialogue:/i.test(line)).map((line, index) => {
    const fields = line.replace(/^Dialogue:\s*/i, "").split(",");
    const start = fields[1] || "";
    const end = fields[2] || "";
    const body = fields.slice(9).join(",").replace(/\\N/gi, "\n").replace(/\{[^}]*\}/g, "");
    return { number: String(index + 1), timing: `${start} --> ${end}`, text: body, issues: [], startMs: null, endMs: null, format: "ass" };
  });
}

module.exports = { parseSubtitles, parseAss, timeToMs, toSrt, toVtt };
