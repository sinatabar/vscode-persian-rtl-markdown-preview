const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSubtitles, parseAss, toSrt, toVtt } = require("../subtitles");

test("subtitle validation reports overlaps and long dialogue", () => {
  const cues = parseSubtitles(`1\n00:00:01,000 --> 00:00:03,000\nسلام\n\n2\n00:00:02,500 --> 00:00:04,000\n${"متن ".repeat(30)}`);
  assert.match(cues[1].issues.join(" "), /هم‌پوشانی/);
  assert.match(cues[1].issues.join(" "), /طولانی/);
});

test("SRT and WebVTT convert in both directions", () => {
  const vtt = toVtt("1\n00:00:01,000 --> 00:00:03,000\nسلام");
  assert.match(vtt, /^WEBVTT/);
  assert.match(vtt, /00:00:01\.000 --> 00:00:03\.000/);
  assert.match(toSrt(vtt), /00:00:01,000 --> 00:00:03,000/);
});

test("ASS dialogue lines are readable", () => {
  const cues = parseAss("Dialogue: 0,0:00:01.00,0:00:03.00,Default,,0,0,0,,سلام\\Nدنیا");
  assert.equal(cues[0].text, "سلام\nدنیا");
});
