const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml, parseSrt, renderDocument } = require("../custom-editor");

test("plain text preview assigns direction per line and escapes HTML", () => {
  const html = renderDocument("text", "سلام دنیا\nEnglish <script>");
  assert.match(html, /class="text-line rtl" dir="rtl">سلام دنیا/);
  assert.match(html, /class="text-line ltr" dir="ltr">English &lt;script&gt;/);
});

test("SRT parser preserves number, timing and multiline subtitle text", () => {
  const cues = parseSrt("1\n00:00:01,000 --> 00:00:03,000\nسلام\nدنیا");
  assert.deepEqual(cues, [{
    number: "1",
    timing: "00:00:01,000 --> 00:00:03,000",
    text: "سلام\nدنیا"
  }]);
});

test("SRT preview isolates timing as LTR and Persian dialogue as RTL", () => {
  const html = renderDocument("srt", "1\n00:00:01,000 --> 00:00:03,000\nسلام دنیا");
  assert.match(html, /<time dir="ltr">00:00:01,000 --&gt; 00:00:03,000<\/time>/);
  assert.match(html, /class="cue-text rtl" dir="rtl">سلام دنیا/);
});

test("Markdown rendering disables raw HTML", () => {
  const html = renderDocument("markdown", "# سلام\n\n<script>alert(1)</script>");
  assert.match(html, /<h1 dir="rtl" class="persian-rtl">سلام<\/h1>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("Markdown preview assigns direction independently to mixed blocks", () => {
  const html = renderDocument("markdown", "عنوان: Persian text\n\nEnglish only");
  assert.match(html, /<p dir="rtl" class="persian-rtl">عنوان: Persian text<\/p>/);
  assert.match(html, /<p dir="ltr" class="persian-ltr">English only<\/p>/);
});

test("HTML escaping covers content used by text and subtitle previews", () => {
  assert.equal(escapeHtml(`<>&\"'`), "&lt;&gt;&amp;&quot;&#39;");
});
