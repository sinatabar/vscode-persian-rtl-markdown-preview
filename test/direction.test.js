const test = require("node:test");
const assert = require("node:assert/strict");
const { directionFor } = require("../direction");

test("Persian-only block is RTL", () => {
  assert.equal(directionFor("این یک جملهٔ فارسی است."), "rtl");
});

test("English-leading mixed block is RTL", () => {
  assert.equal(directionFor("Evidence ledger: هر ادعا باید منبع داشته باشد."), "rtl");
});

test("identifier-leading mixed list item is RTL", () => {
  assert.equal(directionFor("run-case: اجرای فرایند از ابتدا تا انتها."), "rtl");
});

test("English-only block remains LTR", () => {
  assert.equal(directionFor("This paragraph is entirely in English."), "ltr");
});

test("empty and numeric-only blocks remain LTR", () => {
  assert.equal(directionFor(""), "ltr");
  assert.equal(directionFor("2026-09-04"), "ltr");
});
