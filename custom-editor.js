const path = require("node:path");
const os = require("node:os");
const MarkdownIt = require("markdown-it");
const sanitizeHtml = require("sanitize-html");
const anchor = require("markdown-it-anchor");
const footnote = require("markdown-it-footnote");
const taskLists = require("markdown-it-task-lists");
const toc = require("markdown-it-toc-done-right");
const texmath = require("markdown-it-texmath");
const temml = require("temml");
const { directionFor } = require("./direction");
const { addBlockDirections } = require("./markdown-direction");
const { parseSubtitles, parseAss, toSrt, toVtt } = require("./subtitles");
const { normalizePersian, normalizeHalfSpaces, toLatinDigits, toPersianDigits } = require("./persian-tools");

const markdown = new MarkdownIt({ html: true, linkify: true, typographer: false })
  .enable("table")
  .use(anchor, { permalink: anchor.permalink.linkInsideHeader({ symbol: "#", placement: "before" }) })
  .use(footnote)
  .use(taskLists, { enabled: false, label: true })
  .use(toc, { containerClass: "table-of-contents" })
  .use(texmath, { engine: temml, delimiters: "dollars", katexOptions: { throwOnError: false } });
const renderInlineMath = markdown.renderer.rules.math_inline;
const renderBlockMath = markdown.renderer.rules.math_block;
markdown.renderer.rules.math_inline = (tokens, index, options, env, renderer) =>
  `<bdi class="math-isolate" dir="ltr">${renderInlineMath(tokens, index, options, env, renderer)}</bdi>`;
markdown.renderer.rules.math_block = (tokens, index, options, env, renderer) =>
  `<div class="math-block-isolate" dir="ltr">${renderBlockMath(tokens, index, options, env, renderer)}</div>`;
addBlockDirections(markdown);
const originalFence = markdown.renderer.rules.fence || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options));
markdown.renderer.rules.fence = (tokens, index, options, env, renderer) => {
  if (tokens[index].info.trim() === "mermaid") {
    return `<div class="mermaid" dir="ltr">${escapeHtml(tokens[index].content)}</div>`;
  }
  return originalFence(tokens, index, options, env, renderer);
};

const SAFE_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "details", "summary", "kbd", "mark", "sub", "sup", "img", "math", "semantics",
  "annotation", "annotation-xml", "maction", "menclose", "merror", "mfenced", "mfrac",
  "mglyph", "mi", "mlabeledtr", "mlongdiv", "mmultiscripts", "mn", "mo", "mover",
  "mpadded", "mphantom", "mprescripts", "mroot", "mrow", "ms", "mscarries", "mscarry",
  "msgroup", "msline", "mspace", "msqrt", "msrow", "mstack", "mstyle", "msub",
  "msubsup", "msup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover",
  "none", "input", "eq", "eqn", "bdi"
];

const SAFE_ATTRIBUTES = {
  "*": ["class", "dir", "align", "title", "id", "aria-hidden"],
  a: ["href", "name", "target", "rel", "data-local-href"],
  img: ["src", "alt", "width", "height", "loading"],
  span: ["class", "aria-hidden", "style"],
  ol: ["start"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
  input: ["type", "checked", "disabled"],
  annotation: ["encoding"],
  math: ["xmlns", "display", "class"],
  mo: ["accent", "fence", "form", "largeop", "movablelimits", "separator", "stretchy", "symmetric"],
  mtable: ["columnalign", "columnlines", "columnspacing", "displaystyle", "rowalign", "rowlines", "rowspacing", "side"],
  mtd: ["columnalign", "columnspan", "rowalign", "rowspan", "style"],
  mspace: ["depth", "height", "width"],
  mstyle: ["displaystyle", "mathbackground", "mathcolor", "mathsize", "scriptlevel"],
  menclose: ["notation"],
  mpadded: ["depth", "height", "lspace", "voffset", "width"]
};

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
  if (extension === ".vtt") return "vtt";
  if (extension === ".ass" || extension === ".ssa") return "ass";
  if ([".md", ".markdown", ".mdown", ".mkd"].includes(extension)) return "markdown";
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

function parseSrt(text) { return parseSubtitles(text, "srt"); }

function renderSubtitles(text, format) {
  if (!text.trim()) return '<p class="empty">زیرنویسی برای نمایش وجود ندارد.</p>';
  const cues = format === "ass" ? parseAss(text) : parseSubtitles(text, format);
  return cues
    .map((cue) => {
      const direction = directionFor(cue.text);
      const body = escapeHtml(cue.text).replaceAll("\n", "<br>");
      const issues = cue.issues.length ? `<div class="cue-issues">⚠ ${cue.issues.map(escapeHtml).join(" · ")}</div>` : "";
      const duration = cue.startMs !== null && cue.endMs !== null ? `${((cue.endMs - cue.startMs) / 1000).toFixed(1)}s` : "";
      return `<article class="cue" data-cue="${escapeHtml(cue.number)}"><header><span>${escapeHtml(cue.number)}</span><time dir="ltr">${escapeHtml(cue.timing)}</time><small>${duration}</small></header><div class="cue-text ${direction}" dir="${direction}">${body}</div>${issues}</article>`;
    })
    .join("");
}

function safeUrl(value, resolveRelativeUri) {
  const source = String(value || "").trim();
  if (!source || source.startsWith("#")) return source;
  if (/^(?:https?:|mailto:|data:image\/)/i.test(source)) return source;
  if (/^[a-z][a-z\d+.-]*:/i.test(source)) return "";
  return resolveRelativeUri ? resolveRelativeUri(source) : source;
}

function sanitizeMarkdown(rendered, resolveRelativeUri) {
  return sanitizeHtml(rendered, {
    allowedTags: SAFE_TAGS,
    allowedAttributes: SAFE_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "data", "vscode-webview"],
    allowedSchemesByTag: {
      img: ["http", "https", "data", "vscode-webview"],
      a: ["http", "https", "mailto", "vscode-webview"]
    },
    allowedStyles: {
      span: {
        height: [/^-?\d*\.?\d+(?:em|ex|px|%)$/],
        width: [/^-?\d*\.?\d+(?:em|ex|px|%)$/],
        top: [/^-?\d*\.?\d+(?:em|ex|px|%)$/],
        "vertical-align": [/^-?\d*\.?\d+(?:em|ex|px|%)$/],
        "margin-right": [/^-?\d*\.?\d+(?:em|ex|px|%)$/],
        "border-bottom-width": [/^\d*\.?\d+(?:em|px)$/]
      },
      mtd: {
        "padding-left": [/^\d*\.?\d+(?:em|ex|px|pt|%)$/],
        "padding-right": [/^\d*\.?\d+(?:em|ex|px|pt|%)$/]
      }
    },
    transformTags: {
      a: (tagName, attributes) => {
        const href = String(attributes.href || "").trim();
        const isLocal = href && !href.startsWith("#") && !/^[a-z][a-z\d+.-]*:/i.test(href);
        return {
          tagName,
          attribs: {
            ...attributes,
            href: isLocal ? "#" : safeUrl(href, resolveRelativeUri),
            ...(isLocal ? { "data-local-href": href } : {}),
            rel: "noopener noreferrer"
          }
        };
      },
      img: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          src: safeUrl(attributes.src, resolveRelativeUri),
          loading: "lazy"
        }
      })
    }
  });
}

function renderDocument(format, text, options = {}) {
  if (format === "markdown") {
    return sanitizeMarkdown(markdown.render(text), options.resolveRelativeUri);
  }
  if (["srt", "vtt", "ass"].includes(format)) return renderSubtitles(text, format);
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
    const documentDirectory = this.vscode.Uri.joinPath(document.uri, "..");

    const resolveRelativeUri = (source) => {
      const [pathname, suffix = ""] = source.split(/(?=[?#])/u, 2);
      const resource = this.vscode.Uri.joinPath(documentDirectory, pathname);
      return `${webview.asWebviewUri(resource)}${suffix}`;
    };

    webview.options = {
      enableScripts: true,
      localResourceRoots: [context.extensionUri, documentDirectory,
        this.vscode.Uri.joinPath(context.extensionUri, "webview", "vendor")]
    };
    webview.html = this.getHtml(webview, format);

    const sendDocument = () => {
      const text = document.getText();
      const configuration = vscode.workspace.getConfiguration("persianRtl");
      webview.postMessage({
        type: "update",
        text,
        format,
        previewHtml: renderDocument(format, text, { resolveRelativeUri }),
        settings: {
          direction: configuration.get("direction", "auto"),
          fontFamily: configuration.get("fontFamily", "PersianEditor"),
          persianFontSize: configuration.get("persianFontSize", 100),
          latinFontSize: configuration.get("latinFontSize", 100),
          lineHeight: configuration.get("lineHeight", 1.9),
          contentWidth: configuration.get("contentWidth", 880),
          defaultMode: configuration.get("defaultMode", "split")
        }
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

      if (message.type === "openDocument" && typeof message.path === "string") {
        const [pathname] = message.path.split(/[?#]/u, 1);
        const target = vscode.Uri.joinPath(document.uri, "..", pathname);
        vscode.commands.executeCommand("vscode.open", target);
      }

      if (message.type === "saveImage" && typeof message.data === "string") {
        const extension = String(message.mime || "image/png").split("/")[1]?.replace("jpeg", "jpg") || "png";
        const name = `image-${Date.now()}.${extension}`;
        const assetsDirectory = vscode.Uri.joinPath(documentDirectory, "images");
        const target = vscode.Uri.joinPath(assetsDirectory, name);
        const bytes = Buffer.from(message.data.split(",").pop(), "base64");
        vscode.workspace.fs.createDirectory(assetsDirectory).then(() => vscode.workspace.fs.writeFile(target, bytes)).then(() => {
          webview.postMessage({ type: "imageSaved", markdown: `![تصویر](images/${name})` });
        });
      }

      if (message.type === "transform" && typeof message.action === "string") {
        const transforms = { normalizePersian, normalizeHalfSpaces, toLatinDigits, toPersianDigits };
        if (transforms[message.action]) webview.postMessage({ type: "replaceText", text: transforms[message.action](document.getText()) });
      }

      if (message.type === "convertSubtitle") {
        const targetFormat = message.target === "vtt" ? "vtt" : "srt";
        const converted = targetFormat === "vtt" ? toVtt(document.getText(), format) : toSrt(document.getText(), format);
        webview.postMessage({ type: "replaceText", text: converted });
      }

      if (message.type === "exportHtml" && typeof message.html === "string") {
        if (message.printAfterOpen) {
          const target = vscode.Uri.file(path.join(os.tmpdir(), "persian-rtl-print-preview.html"));
          vscode.workspace.fs.writeFile(target, Buffer.from(message.html, "utf8"))
            .then(() => vscode.env.openExternal(target))
            .catch((error) => vscode.window.showErrorMessage(`Print/PDF failed: ${error.message}`));
          return;
        }
        vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.joinPath(documentDirectory, `${path.basename(document.fileName, path.extname(document.fileName))}.html`),
          filters: { HTML: ["html"] }
        }).then((target) => target && vscode.workspace.fs.writeFile(target, Buffer.from(message.html, "utf8")));
      }
    });

    const settingsListener = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("persianRtl")) sendDocument();
    });

    webviewPanel.onDidDispose(() => {
      documentListener.dispose();
      messageListener.dispose();
      settingsListener.dispose();
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
    const temmlStyleUri = webview.asWebviewUri(this.vscode.Uri.joinPath(this.context.extensionUri, "webview", "vendor", "temml.css"));
    const mermaidUri = webview.asWebviewUri(this.vscode.Uri.joinPath(this.context.extensionUri, "webview", "vendor", "mermaid.min.js"));

    return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https: data: blob:; style-src ${webview.cspSource} 'nonce-${token}' 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${token}';">
  <link rel="stylesheet" href="${temmlStyleUri}">
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
    <div class="actions">
      <button type="button" data-action="normalizePersian" title="اصلاح حروف و علائم فارسی">اصلاح فارسی</button>
      <button type="button" data-action="normalizeHalfSpaces" title="اصلاح نیم‌فاصله">نیم‌فاصله</button>
      <button type="button" data-action="toPersianDigits">۱۲۳</button>
      <button type="button" data-action="toLatinDigits">123</button>
      <button type="button" data-action="convert" class="subtitle-only">تبدیل SRT/VTT</button>
      <button type="button" data-action="export">HTML</button>
      <button type="button" data-action="print">چاپ/PDF</button>
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
  <script nonce="${token}" src="${mermaidUri}"></script>
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
  renderDocument,
  safeUrl,
  sanitizeMarkdown
};
