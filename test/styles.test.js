const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "..", "preview.css"), "utf8");

test("Noto Sans Arabic is the preferred Persian font", () => {
  assert.match(
    css,
    /--persian-font:\s*"Noto Sans Arabic",\s*"Noto Sans",\s*"Vazirmatn"/
  );
});

test("RTL blocks keep an explicit RTL base direction", () => {
  const rtlRule = css.match(/\.markdown-body \.persian-rtl\s*\{[^}]+\}/s)?.[0] || "";

  assert.match(rtlRule, /direction:\s*rtl\s*!important/);
  assert.match(rtlRule, /unicode-bidi:\s*isolate/);
  assert.doesNotMatch(rtlRule, /unicode-bidi:\s*plaintext/);
});
