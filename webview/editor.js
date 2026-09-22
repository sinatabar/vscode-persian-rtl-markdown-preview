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
  async function renderMermaid() {
    if (!window.mermaid) return;
    window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: document.body.classList.contains("vscode-light") ? "default" : "dark" });
    try { await window.mermaid.run({ nodes: preview.querySelectorAll(".mermaid") }); } catch { /* invalid source stays visible */ }
  }
  function exportHtml() {
    const styles = Array.from(document.styleSheets).map((sheet) => {
      try { return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n"); } catch { return ""; }
    }).join("\n");
    const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Export</title><style>${styles}</style></head><body><main class="preview-content ${currentFormat}">${preview.innerHTML}</main></body></html>`;
    vscode.postMessage({ type: "exportHtml", html });
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
    else if (action === "print") window.print();
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
