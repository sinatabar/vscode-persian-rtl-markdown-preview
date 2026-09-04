const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readme = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");

test("Marketplace Persian details contain no Latin-script words", () => {
  const match = readme.match(/^## فارسی\s*$([\s\S]*?)^## English\s*$/m);

  assert.ok(match, "README must keep separate Persian and English sections");
  assert.doesNotMatch(match[1], /[A-Za-z]/);
});

test("public details contain no English-leading mixed-language line", () => {
  const unsafeLine = readme
    .split("\n")
    .find((line) => /^[\s>*#`_-]*[A-Za-z]/.test(line) && /[\u0600-\u06ff]/.test(line));

  assert.equal(unsafeLine, undefined);
});
