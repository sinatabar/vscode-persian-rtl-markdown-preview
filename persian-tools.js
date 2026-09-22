const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const LATIN_DIGITS = "0123456789";

function normalizePersian(text) {
  return String(text)
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ۀة]/g, "هٔ")
    .replace(/\u0640/g, "")
    .replace(/[ \t]+([،؛؟])/g, "$1")
    .replace(/([،؛؟])(?=\S)/g, "$1 ");
}

function toPersianDigits(text) {
  return String(text).replace(/\d/g, (digit) => PERSIAN_DIGITS[LATIN_DIGITS.indexOf(digit)]);
}

function toLatinDigits(text) {
  return String(text).replace(/[۰-۹]/g, (digit) => LATIN_DIGITS[PERSIAN_DIGITS.indexOf(digit)]);
}

function normalizeHalfSpaces(text) {
  return String(text)
    .replace(/(^|[\s\n])(می|نمی)\s+(?=[\u0600-\u06FF])/g, "$1$2‌")
    .replace(/\s+(ها|های|تر|ترین)(?=\s|[،؛؟.!]|$)/g, "‌$1");
}

module.exports = { normalizePersian, normalizeHalfSpaces, toLatinDigits, toPersianDigits };
