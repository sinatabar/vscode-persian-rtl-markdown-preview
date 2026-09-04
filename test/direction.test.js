const test = require("node:test");
const assert = require("node:assert/strict");
const { directionFor } = require("../direction");

test("Persian-only block is RTL", () => {
  assert.equal(directionFor("این یک جملهٔ فارسی است."), "rtl");
});

test("English-leading mixed block is RTL", () => {
  assert.equal(directionFor("preview-block: این بند برای آزمایش افزونه است."), "rtl");
});

test("identifier-leading mixed list item is RTL", () => {
  assert.equal(directionFor("preview-item: بررسی جهت یک گزینهٔ ترکیبی."), "rtl");
});

test("English-only block remains LTR", () => {
  assert.equal(directionFor("This paragraph is entirely in English."), "ltr");
});

test("empty and numeric-only blocks remain LTR", () => {
  assert.equal(directionFor(""), "ltr");
  assert.equal(directionFor("2026-09-04"), "ltr");
});
