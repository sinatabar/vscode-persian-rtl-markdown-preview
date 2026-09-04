const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "..", "preview.css"), "utf8");

test("the bundled font is preferred over system fonts", () => {
  assert.match(
    css,
    /--persian-font:\s*"Persian RTL Preview",\s*"Noto Sans Arabic",\s*"Noto Sans"/
  );
});

test("bundled Arabic and Latin variable fonts are declared", () => {
  assert.match(
    css,
    /url\("\.\/fonts\/noto-sans-arabic-arabic-wght-normal\.woff2"\)/
  );
  assert.match(
    css,
    /url\("\.\/fonts\/noto-sans-arabic-latin-wght-normal\.woff2"\)/
  );
  assert.match(css, /font-weight:\s*100 900/);
});

test("bundled font files and their OFL license are present", () => {
  const root = path.join(__dirname, "..");
  const fontFiles = [
    "fonts/noto-sans-arabic-arabic-wght-normal.woff2",
    "fonts/noto-sans-arabic-latin-wght-normal.woff2"
  ];

  for (const relativePath of fontFiles) {
    const font = fs.readFileSync(path.join(root, relativePath));
    assert.equal(font.subarray(0, 4).toString("ascii"), "wOF2");
  }

  const license = fs.readFileSync(path.join(root, "fonts/OFL-1.1.txt"), "utf8");
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
});

test("RTL blocks keep an explicit RTL base direction", () => {
  const rtlRule = css.match(/\.markdown-body \.persian-rtl\s*\{[^}]+\}/s)?.[0] || "";

  assert.match(rtlRule, /direction:\s*rtl\s*!important/);
  assert.match(rtlRule, /unicode-bidi:\s*isolate/);
  assert.doesNotMatch(rtlRule, /unicode-bidi:\s*plaintext/);
});
