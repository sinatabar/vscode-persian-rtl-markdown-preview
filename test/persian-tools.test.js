const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePersian, normalizeHalfSpaces, toLatinDigits, toPersianDigits } = require("../persian-tools");

test("Persian normalization fixes Arabic variants and punctuation spacing", () => {
  assert.equal(normalizePersian("كتاب يكي ،خوب؟بله"), "کتاب یکی، خوب؟ بله");
});

test("half spaces and digit conversions are opt-in transformations", () => {
  assert.equal(normalizeHalfSpaces("می رود خانه ها"), "می‌رود خانه‌ها");
  assert.equal(toPersianDigits("123"), "۱۲۳");
  assert.equal(toLatinDigits("۱۲۳"), "123");
});
