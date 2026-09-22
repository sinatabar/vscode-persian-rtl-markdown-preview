const path = require("node:path");
const MarkdownIt = require("markdown-it");
const { directionFor } = require("./direction");
const { addBlockDirections } = require("./markdown-direction");

const markdown = addBlockDirections(
  new MarkdownIt({ html: false, linkify: true, typographer: false }).enable("table")
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatFor(document) {
  const extension = path.extname(document.fileName).toLowerCase();
  if (extension === ".srt") return "srt";
  if (extension === ".md" || extension === ".markdown") return "markdown";
  return "text";
}

function renderText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const direction = directionFor(line);
      return `<div class="text-line ${direction}" dir="${direction}">${escapeHtml(line) || "&nbsp;"}</div>`;
    })
    .join("");
}

function parseSrt(text) {
  return text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      const number = /^\d+$/.test(lines[0]?.trim()) ? lines.shift().trim() : "";
      const timingIndex = lines.findIndex((line) => line.includes("-->"));
      const timing = timingIndex >= 0 ? lines.splice(timingIndex, 1)[0].trim() : "";
      return { number, timing, text: lines.join("\n") };
    });
}

function renderSrt(text) {
  if (!text.trim()) return '<p class="empty">زیرنویسی برای نمایش وجود ندارد.</p>';

  return parseSrt(text)
    .map((cue) => {
      const direction = directionFor(cue.text);
      const body = escapeHtml(cue.text).replaceAll("\n", "<br>");
      return `<article class="cue"><header><span>${escapeHtml(cue.number)}</span><time dir="ltr">${escapeHtml(cue.timing)}</time></header><div class="cue-text ${direction}" dir="${direction}">${body}</div></article>`;
    })
    .join("");
}

function renderDocument(format, text) {
  if (format === "markdown") return markdown.render(text);
  if (format === "srt") return renderSrt(text);
  return renderText(text);
}

function nonce() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

class PersianRtlEditorProvider {
  constructor(vscode, context) {
    this.vscode = vscode;
    this.context = context;
  }

  async resolveCustomTextEditor(document, webviewPanel) {
    const { vscode, context } = this;
    const webview = webviewPanel.webview;
    const format = formatFor(document);

    webview.options = {
      enableScripts: true,
      localResourceRoots: [context.extensionUri]
    };
    webview.html = this.getHtml(webview, format);

    const sendDocument = () => {
      const text = document.getText();
      webview.postMessage({
        type: "update",
        text,
        format,
        previewHtml: renderDocument(format, text)
      });
    };

    const documentListener = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() === document.uri.toString()) sendDocument();
    });

    let editQueue = Promise.resolve();
    const messageListener = webview.onDidReceiveMessage((message) => {
      if (message.type === "ready") {
        sendDocument();
        return;
      }

      if (message.type === "edit" && typeof message.text === "string") {
        editQueue = editQueue.then(async () => {
          if (message.text === document.getText()) return;
          const edit = new vscode.WorkspaceEdit();
          const entireDocument = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          edit.replace(document.uri, entireDocument, message.text);
          await vscode.workspace.applyEdit(edit);
        });
      }

      if (message.type === "openLink" && typeof message.href === "string") {
        let target;
        try {
          target = vscode.Uri.parse(message.href);
        } catch {
          return;
        }
        if (target.scheme === "https" || target.scheme === "http") {
          vscode.env.openExternal(target);
        }
      }
    });

    webviewPanel.onDidDispose(() => {
      documentListener.dispose();
      messageListener.dispose();
    });
  }

  getHtml(webview, format) {
    const token = nonce();
    const scriptUri = webview.asWebviewUri(
      this.vscode.Uri.joinPath(this.context.extensionUri, "webview", "editor.js")
    );
    const styleUri = webview.asWebviewUri(
      this.vscode.Uri.joinPath(this.context.extensionUri, "webview", "editor.css")
    );
    const arabicFontUri = webview.asWebviewUri(
      this.vscode.Uri.joinPath(this.context.extensionUri, "fonts", "noto-sans-arabic-arabic-wght-normal.woff2")
    );
    const latinFontUri = webview.asWebviewUri(
      this.vscode.Uri.joinPath(this.context.extensionUri, "fonts", "noto-sans-arabic-latin-wght-normal.woff2")
    );

    return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'nonce-${token}'; script-src 'nonce-${token}';">
  <link rel="stylesheet" href="${styleUri}">
  <style nonce="${token}">@font-face{font-family:PersianEditor;src:url('${arabicFontUri}') format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF}@font-face{font-family:PersianEditor;src:url('${latinFontUri}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}</style>
  <title>Persian RTL Editor</title>
</head>
<body data-format="${format}">
  <header class="toolbar">
    <div class="tabs" role="tablist" aria-label="حالت نمایش">
      <button type="button" data-mode="edit">ویرایش</button>
      <button type="button" data-mode="split" class="active">دو بخشی</button>
      <button type="button" data-mode="preview">پیش‌نمایش</button>
    </div>
    <span id="status" aria-live="polite"></span>
  </header>
  <main class="workspace mode-split">
    <section class="editor-pane" aria-label="ویرایشگر">
      <textarea id="editor" dir="auto" spellcheck="true" aria-label="متن فایل"></textarea>
    </section>
    <section class="preview-pane" aria-label="پیش‌نمایش">
      <div id="preview" class="preview-content ${format}"></div>
    </section>
  </main>
  <script nonce="${token}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

module.exports = {
  PersianRtlEditorProvider,
  escapeHtml,
  formatFor,
  parseSrt,
  renderDocument
};
