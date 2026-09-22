(function () {
  const vscode = acquireVsCodeApi();
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");
  const workspace = document.querySelector(".workspace");
  let timer;

  function flushEdit() {
    clearTimeout(timer);
    vscode.postMessage({ type: "edit", text: editor.value });
  }

  function updateStatus() {
    const lines = editor.value ? editor.value.split(/\r?\n/).length : 0;
    status.textContent = `${editor.value.length.toLocaleString("fa-IR")} نویسه · ${lines.toLocaleString("fa-IR")} خط`;
  }

  editor.addEventListener("input", () => {
    updateStatus();
    clearTimeout(timer);
    timer = setTimeout(flushEdit, 180);
  });

  editor.addEventListener("change", flushEdit);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) flushEdit();
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      workspace.className = `workspace mode-${button.dataset.mode}`;
      if (button.dataset.mode !== "preview") editor.focus();
    });
  });

  preview.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    event.preventDefault();
    vscode.postMessage({ type: "openLink", href: link.href });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type !== "update") return;

    if (editor.value !== message.text) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = message.text;
      editor.setSelectionRange(Math.min(start, editor.value.length), Math.min(end, editor.value.length));
    }
    preview.innerHTML = message.previewHtml;
    updateStatus();
  });

  vscode.postMessage({ type: "ready" });
})();
