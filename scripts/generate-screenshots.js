const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { renderDocument } = require("../custom-editor");

const root = path.join(__dirname, "..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!fs.existsSync(chrome)) {
  throw new Error(`Google Chrome was not found at ${chrome}`);
}

const asDataUrl = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;

const arabicFont = asDataUrl(path.join(root, "fonts", "noto-sans-arabic-arabic-wght-normal.woff2"), "font/woff2");
const latinFont = asDataUrl(path.join(root, "fonts", "noto-sans-arabic-latin-wght-normal.woff2"), "font/woff2");
const mathFont = asDataUrl(path.join(root, "node_modules", "temml", "dist", "Temml.woff2"), "font/woff2");
const editorCss = fs.readFileSync(path.join(root, "webview", "editor.css"), "utf8");
const temmlCss = fs.readFileSync(path.join(root, "node_modules", "temml", "dist", "Temml-Local.css"), "utf8")
  .replaceAll("Temml.woff2", mathFont);
const mermaid = fs.readFileSync(path.join(root, "node_modules", "mermaid", "dist", "mermaid.min.js"), "utf8");

const hero = renderDocument("markdown", `# نوشتن فارسی، ساده و دقیق

ویرایش و پیش‌نمایش Markdown فارسی با پشتیبانی درست از متن دوزبانه، فرمول و نمودار.`);
const features = renderDocument("markdown", `## همه‌چیز در یک ویرایشگر

- [x] جهت هوشمند فارسی و English
- [x] ویرایش، پیش‌نمایش و حالت دوبخشی
- [x] ابزارهای فارسی، زیرنویس و خروجی HTML/PDF

متن انگلیسی و \`inline code\` همیشه چپ‌به‌راست می‌مانند.`);
const math = renderDocument("markdown", `## فرمول‌های دقیق و متنی

قضیهٔ فیثاغورس $a^2 + b^2 = c^2$

$$
\\frac{x_1+x_2}{2}=\\bar{x}
$$`);
const diagram = renderDocument("markdown", `## گردش کار دیداری

\`\`\`mermaid
flowchart LR
  A[متن فارسی] --> B[ویرایش]
  B --> C[پیش‌نمایش RTL]
  C --> D[HTML یا PDF]
\`\`\``);

const themes = {
  light: {
    editor: "#ffffff", foreground: "#24292f", surface: "#f6f8fa", border: "#d0d7de",
    muted: "#57606a", link: "#0969da", button: "#0969da", buttonText: "#ffffff", code: "#f6f8fa"
  },
  dark: {
    editor: "#0d1117", foreground: "#e6edf3", surface: "#161b22", border: "#30363d",
    muted: "#8b949e", link: "#58a6ff", button: "#238636", buttonText: "#ffffff", code: "#161b22"
  }
};

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "persian-preview-shots-"));

try {
  for (const [name, colors] of Object.entries(themes)) {
    const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:PersianEditor;src:url('${arabicFont}') format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:PersianEditor;src:url('${latinFont}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
${temmlCss}
${editorCss}
:root{color-scheme:${name};--vscode-editor-background:${colors.editor};--vscode-editor-foreground:${colors.foreground};--vscode-foreground:${colors.foreground};--vscode-sideBar-background:${colors.surface};--vscode-panel-border:${colors.border};--vscode-editorWidget-border:${colors.border};--vscode-descriptionForeground:${colors.muted};--vscode-textLink-foreground:${colors.link};--vscode-button-background:${colors.button};--vscode-button-foreground:${colors.buttonText};--vscode-toolbar-hoverBackground:${colors.border};--vscode-textCodeBlock-background:${colors.code};--vscode-textPreformat-background:${colors.code};--vscode-textBlockQuote-border:${colors.border};--vscode-textBlockQuote-foreground:${colors.muted};--vscode-font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--vscode-editor-font-family:"SFMono-Regular",Consolas,monospace;--content-width:1000px}
html,body{width:1060px;height:567px}.toolbar{height:48px;padding:7px 20px}.toolbar-brand{font-weight:750;letter-spacing:-.01em}.workspace{display:block}.preview-pane{height:519px}.preview-content{max-width:1000px;padding:22px 34px 28px;font-size:14px;line-height:1.65}.showcase-hero{text-align:center;margin-bottom:15px}.showcase-hero h1{text-align:center;margin:.05em 0 .2em;font-size:28px}.showcase-hero p{text-align:center;margin:0;color:var(--muted)}.showcase-grid{direction:rtl;display:grid;grid-template-columns:1.03fr .97fr;gap:14px}.showcase-card{min-width:0;padding:13px 17px;border:1px solid var(--border);border-radius:10px;background:var(--surface)}.showcase-card h2{margin:0 0 8px;font-size:18px}.showcase-card p{margin:6px 0}.showcase-card ul{margin:4px 0;padding-right:1.8em}.showcase-card .math-block-isolate{margin-top:4px}.showcase-card .mermaid{height:122px;display:flex;align-items:center;justify-content:center}.showcase-card .mermaid svg{max-height:122px!important;max-width:100%!important}.wide{grid-column:1/-1;display:grid;grid-template-columns:1.08fr .92fr;gap:18px;align-items:center}.wide h2{margin-bottom:4px}.wide .mermaid{height:112px}.header-anchor{display:none}
</style></head><body>
<header class="toolbar"><strong class="toolbar-brand">Persian RTL Editor</strong><div class="actions"><button>ویرایش</button><button>دو بخشی</button><button class="active">پیش‌نمایش</button><button>اصلاح فارسی</button><button>نیم‌فاصله</button><button>HTML</button><button>چاپ/PDF</button></div><span id="status">فارسی · English · RTL/LTR</span></header>
<main class="workspace mode-preview"><section class="preview-pane"><div class="preview-content markdown">
<div class="showcase-hero">${hero}</div><div class="showcase-grid"><section class="showcase-card">${features}</section><section class="showcase-card">${math}</section><section class="showcase-card wide">${diagram}</section></div>
</div></section></main><script>${mermaid}</script><script>mermaid.initialize({startOnLoad:false,theme:${JSON.stringify(name === "dark" ? "dark" : "default")},securityLevel:"strict",fontFamily:"PersianEditor, sans-serif",themeVariables:{fontSize:"17px"}});mermaid.run({querySelector:".mermaid"}).then(()=>document.body.dataset.ready="true");</script></body></html>`;
    const htmlPath = path.join(tempDirectory, `${name}.html`);
    const outputPath = path.join(root, "images", `preview-${name}.png`);
    fs.writeFileSync(htmlPath, html);
    const result = spawnSync(chrome, [
      "--headless=new", "--hide-scrollbars", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
      "--disable-background-networking", "--disable-component-update", "--disable-sync", "--metrics-recording-only",
      `--user-data-dir=${path.join(tempDirectory, `chrome-${name}`)}`,
      "--window-size=1060,567", "--force-device-scale-factor=1", "--virtual-time-budget=4000",
      `--screenshot=${outputPath}`, pathToFileURL(htmlPath).href
    ], { encoding: "utf8", timeout: 15000 });
    if (!fs.existsSync(outputPath)) {
      throw new Error(result.stderr || result.error?.message || `Failed to generate ${outputPath}`);
    }
  }
} finally {
  fs.rmSync(tempDirectory, { recursive: true, force: true });
}
