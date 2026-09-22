(function () {
  const vscode = acquireVsCodeApi();
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");
  const workspace = document.querySelector(".workspace");
  const previousState = vscode.getState() || {};
  let timer;
  let currentFormat = document.body.dataset.format;

  function flushEdit() { clearTimeout(timer); vscode.postMessage({ type: "edit", text: editor.value }); }
  function updateStatus() {
    const lines = editor.value ? editor.value.split(/\r?\n/).length : 0;
    const words = (editor.value.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    status.textContent = `${editor.value.length.toLocaleString("fa-IR")} نویسه · ${words.toLocaleString("fa-IR")} واژه · ${lines.toLocaleString("fa-IR")} خط · ${minutes.toLocaleString("fa-IR")} دقیقه`;
  }
  function setMode(mode, persist = true) {
    document.querySelectorAll("[data-mode]").forEach((item) => item.classList.toggle("active", item.dataset.mode === mode));
    workspace.className = `workspace mode-${mode}`;
    if (persist) vscode.setState({ ...vscode.getState(), mode });
    if (mode !== "preview") editor.focus();
  }
  function replaceText(text) { editor.value = text; updateStatus(); flushEdit(); }
  function insertAtSelection(text) {
    editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, "end");
    editor.focus(); updateStatus(); flushEdit();
  }
  function themeColor(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      || getComputedStyle(document.body).getPropertyValue(name).trim()
      || fallback;
  }
  function mermaidAccent(background) {
    const hex = background.match(/^#([\da-f]{6})$/i)?.[1];
    const components = hex
      ? [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((part) => parseInt(part, 16))
      : (background.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    if (components.length < 3) return "#4daafc";
    const [red, green, blue] = components;
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    return luminance < 0.5 ? "#4daafc" : "#006ab1";
  }
  function mermaidTheme() {
    const background = themeColor("--vscode-editor-background", "#ffffff");
    const foreground = themeColor("--vscode-editor-foreground", "#24292f");
    const surface = themeColor("--vscode-sideBar-background", background);
    const border = themeColor("--vscode-contrastBorder", themeColor("--vscode-panel-border", foreground));
    const accent = mermaidAccent(background);
    return {
      background,
      primaryColor: surface,
      primaryTextColor: foreground,
      primaryBorderColor: accent,
      secondaryColor: surface,
      secondaryTextColor: foreground,
      secondaryBorderColor: border,
      tertiaryColor: background,
      tertiaryTextColor: foreground,
      tertiaryBorderColor: border,
      lineColor: accent,
      textColor: foreground,
      mainBkg: surface,
      nodeBorder: accent,
      clusterBkg: surface,
      clusterBorder: border,
      edgeLabelBackground: background,
      fontFamily: "PersianEditor, sans-serif"
    };
  }
  function fixMermaidLabels() {
    const foreground = themeColor("--vscode-editor-foreground", "#24292f");
    const background = themeColor("--vscode-editor-background", "#ffffff");
    const surface = themeColor("--vscode-editorWidget-background", themeColor("--vscode-sideBar-background", background));
    const accent = mermaidAccent(background);

    preview.querySelectorAll(".mermaid .flowchart-link, .mermaid .edge-thickness-normal, .mermaid .edge-thickness-thick").forEach((edge) => {
      edge.style.setProperty("stroke", accent, "important");
      edge.style.setProperty("stroke-width", "2px", "important");
    });
    preview.querySelectorAll(".mermaid marker path, .mermaid .arrowheadPath").forEach((arrow) => {
      arrow.style.setProperty("fill", accent, "important");
      arrow.style.setProperty("stroke", accent, "important");
    });
    preview.querySelectorAll(".mermaid .node rect, .mermaid .node circle, .mermaid .node ellipse, .mermaid .node polygon, .mermaid .node path").forEach((shape) => {
      shape.style.setProperty("fill", surface, "important");
      shape.style.setProperty("stroke", accent, "important");
      shape.style.setProperty("stroke-width", "1.5px", "important");
    });
    preview.querySelectorAll(".mermaid .nodeLabel, .mermaid .edgeLabel, .mermaid foreignObject div, .mermaid text").forEach((label) => {
      const rtl = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(label.textContent || "");
      label.setAttribute("dir", rtl ? "rtl" : "ltr");
      label.style.direction = rtl ? "rtl" : "ltr";
      label.style.unicodeBidi = "plaintext";
      label.style.textAlign = "center";
      label.style.setProperty("color", foreground, "important");
      label.style.setProperty("fill", foreground, "important");
    });
  }
  async function renderMermaid() {
    if (!window.mermaid) return;
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: mermaidTheme(),
      flowchart: { htmlLabels: true }
    });
    try {
      await window.mermaid.run({ nodes: preview.querySelectorAll(".mermaid") });
      fixMermaidLabels();
    } catch { /* invalid source stays visible */ }
  }
  function exportHtml(printAfterOpen = false) {
    const styles = Array.from(document.styleSheets).map((sheet) => {
      try { return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n"); } catch { return ""; }
    }).join("\n");
    const exportedPreview = preview.cloneNode(true);
    if (printAfterOpen) {
      exportedPreview.style.setProperty("background", "#ffffff", "important");
      exportedPreview.style.setProperty("color", "#1f2328", "important");
      exportedPreview.querySelectorAll(".mermaid .flowchart-link, .mermaid .edge-thickness-normal, .mermaid .edge-thickness-thick").forEach((edge) => {
        edge.style.setProperty("stroke", "#0969da", "important");
      });
      exportedPreview.querySelectorAll(".mermaid marker path, .mermaid .arrowheadPath").forEach((arrow) => {
        arrow.style.setProperty("fill", "#0969da", "important");
        arrow.style.setProperty("stroke", "#0969da", "important");
      });
      exportedPreview.querySelectorAll(".mermaid .node rect, .mermaid .node circle, .mermaid .node ellipse, .mermaid .node polygon, .mermaid .node path").forEach((shape) => {
        shape.style.setProperty("fill", "#f6f8fa", "important");
        shape.style.setProperty("stroke", "#0969da", "important");
      });
      exportedPreview.querySelectorAll(".mermaid .nodeLabel, .mermaid .edgeLabel, .mermaid foreignObject div, .mermaid text").forEach((label) => {
        label.style.setProperty("color", "#1f2328", "important");
        label.style.setProperty("fill", "#1f2328", "important");
      });
    }
    const printScript = printAfterOpen ? '<script>addEventListener("load",()=>setTimeout(()=>window.print(),250))<\/script>' : "";
    const printStyles = printAfterOpen ? "html,body{background:#fff!important;color:#1f2328!important} .preview-content{background:#fff!important;color:#1f2328!important}" : "";
    const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Persian RTL Preview</title><style>${styles}\n${printStyles}\n@media print{html,body{overflow:visible!important;height:auto!important;background:#fff!important;color:#1f2328!important}.preview-content{max-width:none!important;padding:0!important;background:#fff!important;color:#1f2328!important}}</style></head><body><main class="preview-content ${currentFormat}">${exportedPreview.innerHTML}</main>${printScript}</body></html>`;
    vscode.postMessage({ type: "exportHtml", html, printAfterOpen });
  }
  function handleImage(file) {
    if (!file || !file.type.startsWith("image/")) return false;
    const reader = new FileReader();
    reader.onload = () => vscode.postMessage({ type: "saveImage", data: reader.result, mime: file.type });
    reader.readAsDataURL(file); return true;
  }

  editor.addEventListener("input", () => { updateStatus(); clearTimeout(timer); timer = setTimeout(flushEdit, 180); });
  editor.addEventListener("change", flushEdit);
  editor.addEventListener("paste", (event) => {
    const image = Array.from(event.clipboardData?.files || []).find((file) => file.type.startsWith("image/"));
    if (handleImage(image)) event.preventDefault();
  });
  editor.addEventListener("drop", (event) => {
    const image = Array.from(event.dataTransfer?.files || []).find((file) => file.type.startsWith("image/"));
    if (handleImage(image)) event.preventDefault();
  });
  editor.addEventListener("dragover", (event) => event.preventDefault());
  document.addEventListener("visibilitychange", () => { if (document.hidden) flushEdit(); });
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (["normalizePersian", "normalizeHalfSpaces", "toPersianDigits", "toLatinDigits"].includes(action)) vscode.postMessage({ type: "transform", action });
    else if (action === "convert") vscode.postMessage({ type: "convertSubtitle", target: currentFormat === "vtt" ? "srt" : "vtt" });
    else if (action === "export") exportHtml();
    else if (action === "print") exportHtml(true);
  }));
  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || !event.shiftKey || !["1", "2", "3"].includes(event.key)) return;
    event.preventDefault(); setMode({ "1": "edit", "2": "split", "3": "preview" }[event.key]);
  });
  preview.addEventListener("dblclick", (event) => {
    const cue = event.target.closest("[data-cue]");
    if (!cue) return;
    const index = (`\n${editor.value}`).indexOf(`\n${cue.dataset.cue}\n`);
    if (index >= 0) { setMode("split"); editor.focus(); editor.setSelectionRange(index, index); }
  });
  preview.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const rawHref = link.getAttribute("href") || "";
    if (rawHref.startsWith("#") && !link.dataset.localHref) return;
    event.preventDefault();
    if (link.dataset.localHref) vscode.postMessage({ type: "openDocument", path: link.dataset.localHref });
    else vscode.postMessage({ type: "openLink", href: link.href });
  });

  let syncing = false;
  editor.addEventListener("scroll", () => {
    if (syncing || workspace.classList.contains("mode-edit")) return;
    syncing = true;
    const ratio = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight);
    preview.parentElement.scrollTop = ratio * (preview.parentElement.scrollHeight - preview.parentElement.clientHeight);
    requestAnimationFrame(() => { syncing = false; });
  });
  preview.parentElement.addEventListener("scroll", () => {
    if (syncing || workspace.classList.contains("mode-preview")) return;
    syncing = true;
    const pane = preview.parentElement;
    const ratio = pane.scrollTop / Math.max(1, pane.scrollHeight - pane.clientHeight);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => { syncing = false; });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "replaceText") { replaceText(message.text); return; }
    if (message.type === "imageSaved") { insertAtSelection(message.markdown); return; }
    if (message.type !== "update") return;
    currentFormat = message.format;
    document.body.dataset.format = currentFormat;
    document.querySelectorAll(".subtitle-only").forEach((item) => { item.hidden = !["srt", "vtt"].includes(currentFormat); });
    if (editor.value !== message.text) {
      const start = editor.selectionStart; const end = editor.selectionEnd;
      editor.value = message.text;
      editor.setSelectionRange(Math.min(start, editor.value.length), Math.min(end, editor.value.length));
    }
    preview.innerHTML = message.previewHtml;
    const settings = message.settings || {};
    document.documentElement.style.setProperty("--user-font", settings.fontFamily || "PersianEditor");
    document.documentElement.style.setProperty("--persian-scale", `${settings.persianFontSize || 100}%`);
    document.documentElement.style.setProperty("--latin-scale", `${settings.latinFontSize || 100}%`);
    document.documentElement.style.setProperty("--line-height", settings.lineHeight || 1.9);
    document.documentElement.style.setProperty("--content-width", `${settings.contentWidth || 880}px`);
    preview.dataset.direction = settings.direction || "auto";
    if (!previousState.mode && !vscode.getState()?.mode) setMode(settings.defaultMode || "split", false);
    updateStatus(); renderMermaid();
  });
  setMode(previousState.mode || "split", false);
  vscode.postMessage({ type: "ready" });
})();
