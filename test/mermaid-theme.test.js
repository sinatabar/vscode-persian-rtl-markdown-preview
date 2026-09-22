const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "webview", "editor.js"), "utf8");
const css = fs.readFileSync(path.join(root, "webview", "editor.css"), "utf8");
const demo = fs.readFileSync(path.join(root, "demo", "all-features.fa-en.md"), "utf8");
const provider = fs.readFileSync(path.join(root, "custom-editor.js"), "utf8");

test("Mermaid uses the active VS Code theme instead of generic light or dark presets", () => {
  assert.match(script, /theme:\s*"base"/);
  assert.match(script, /--vscode-editor-background/);
  assert.match(script, /--vscode-editor-foreground/);
  assert.match(script, /function mermaidAccent/);
  assert.match(script, /#4daafc/);
  assert.match(script, /#006ab1/);
  assert.match(script, /lineColor:\s*accent/);
});

test("Mermaid arrows and nodes retain explicit contrast", () => {
  assert.match(css, /\.flowchart-link/);
  assert.match(css, /marker path/);
  assert.match(css, /stroke:\s*var\(--mermaid-accent\)\s*!important/);
  assert.match(css, /fill:\s*var\(--mermaid-surface\)\s*!important/);
});

test("Mermaid labels get per-label bidi direction for mixed Persian and Latin text", () => {
  assert.match(script, /fixMermaidLabels/);
  assert.match(script, /unicodeBidi\s*=\s*"plaintext"/);
  assert.match(demo, /پیش‌نمایش RTL/);
});

test("Print/PDF opens a generated printable HTML document outside the webview", () => {
  assert.match(script, /exportHtml\(true\)/);
  assert.match(script, /window\.print\(\)/);
  assert.match(script, /#f6f8fa/);
  assert.match(script, /#1f2328/);
  assert.match(script, /background:#fff!important/);
  assert.match(provider, /message\.printAfterOpen/);
  assert.match(provider, /vscode\.env\.openExternal\(target\)/);
});
