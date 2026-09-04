const test = require("node:test");
const assert = require("node:assert/strict");
const MarkdownIt = require("markdown-it");
const { activate } = require("../extension");

function render(markdown) {
  const markdownIt = activate().extendMarkdownIt(new MarkdownIt().enable("table"));
  return markdownIt.render(markdown);
}

test("English-leading mixed paragraph receives a persistent RTL attribute", () => {
  const html = render("preview-block: این بند باید درست نمایش داده شود.");

  assert.match(html, /<p dir="rtl" class="persian-rtl">preview-block: این بند/);
});

test("English-leading mixed heading receives a persistent RTL attribute", () => {
  const html = render("#### preview-heading: عنوان ترکیبی");

  assert.match(html, /<h4 dir="rtl" class="persian-rtl">preview-heading: عنوان ترکیبی<\/h4>/);
});

test("mixed list and its items receive the expected directions", () => {
  const html = render("- preview-item: بررسی جهت متن.\n- English only item.");

  assert.match(html, /<ul dir="rtl" class="persian-rtl">/);
  assert.match(html, /<li dir="rtl" class="persian-rtl">/);
  assert.match(html, /<li dir="ltr" class="persian-ltr">/);
});

test("table and individual cells keep independent directions", () => {
  const html = render("| عنوان | Value |\n|---|---|\n| Preview status | English only |");

  assert.match(html, /<table dir="rtl" class="persian-rtl">/);
  assert.match(html, /<th dir="rtl" class="persian-rtl">عنوان<\/th>/);
  assert.match(html, /<th dir="ltr" class="persian-ltr">Value<\/th>/);
});
