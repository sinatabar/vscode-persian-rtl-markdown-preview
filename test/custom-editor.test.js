const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml, parseSrt, renderDocument, safeUrl } = require("../custom-editor");

test("plain text preview assigns direction per line and escapes HTML", () => {
  const html = renderDocument("text", "سلام دنیا\nEnglish <script>");
  assert.match(html, /class="text-line rtl" dir="rtl">سلام دنیا/);
  assert.match(html, /class="text-line ltr" dir="ltr">English &lt;script&gt;/);
});

test("SRT parser preserves number, timing and multiline subtitle text", () => {
  const cues = parseSrt("1\n00:00:01,000 --> 00:00:03,000\nسلام\nدنیا");
  assert.equal(cues[0].number, "1");
  assert.equal(cues[0].timing, "00:00:01,000 --> 00:00:03,000");
  assert.equal(cues[0].text, "سلام\nدنیا");
  assert.equal(cues[0].startMs, 1000);
  assert.equal(cues[0].endMs, 3000);
  assert.deepEqual(cues[0].issues, []);
});

test("SRT preview isolates timing as LTR and Persian dialogue as RTL", () => {
  const html = renderDocument("srt", "1\n00:00:01,000 --> 00:00:03,000\nسلام دنیا");
  assert.match(html, /<time dir="ltr">00:00:01,000 --&gt; 00:00:03,000<\/time>/);
  assert.match(html, /class="cue-text rtl" dir="rtl">سلام دنیا/);
});

test("Markdown preview renders safe HTML and removes executable content", () => {
  const html = renderDocument(
    "markdown",
    '# سلام\n\n<p align="center"><img src="images/icon.png" width="128"></p><script>alert(1)</script>',
    { resolveRelativeUri: (value) => `vscode-webview://test/${value}` }
  );
  assert.match(html, /<h1 dir="rtl" class="persian-rtl"[^>]*>.*سلام<\/h1>/);
  assert.match(html, /<p align="center"><img src="vscode-webview:\/\/test\/images\/icon\.png" width="128" loading="lazy" \/><\/p>/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /alert\(1\)/);
});

test("Markdown preview keeps presentation HTML used by README files", () => {
  const html = renderDocument(
    "markdown",
    '<details><summary>بیشتر</summary><kbd>⌘</kbd> H<sub>2</sub>O <mark>مهم</mark></details>'
  );
  assert.match(html, /<details>/);
  assert.match(html, /<summary>بیشتر<\/summary>/);
  assert.match(html, /<kbd>⌘<\/kbd>/);
  assert.match(html, /H<sub>2<\/sub>O/);
  assert.match(html, /<mark>مهم<\/mark>/);
});

test("Markdown preview removes event handlers and dangerous URLs", () => {
  const html = renderDocument(
    "markdown",
    '<img src="javascript:alert(1)" onerror="alert(2)"><a href="javascript:alert(3)">bad</a>'
  );
  assert.doesNotMatch(html, /javascript:/);
  assert.doesNotMatch(html, /onerror/);
  assert.doesNotMatch(html, /alert/);
});

test("safeUrl resolves relative resources without rewriting web URLs or anchors", () => {
  const resolve = (value) => `vscode-webview://test/${value}`;
  assert.equal(safeUrl("images/icon.png", resolve), "vscode-webview://test/images/icon.png");
  assert.equal(safeUrl("https://example.com/icon.png", resolve), "https://example.com/icon.png");
  assert.equal(safeUrl("#features", resolve), "#features");
  assert.equal(safeUrl("javascript:alert(1)", resolve), "");
});

test("Markdown preview marks relative links for VS Code document navigation", () => {
  const html = renderDocument("markdown", "[License](LICENSE) [Web](https://example.com) [Features](#features)");
  assert.match(html, /href="#" data-local-href="LICENSE"/);
  assert.match(html, /href="https:\/\/example\.com"/);
  assert.match(html, /href="#features"/);
});

test("Markdown preview assigns direction independently to mixed blocks", () => {
  const html = renderDocument("markdown", "عنوان: Persian text\n\nEnglish only");
  assert.match(html, /<p dir="rtl" class="persian-rtl">عنوان: Persian text<\/p>/);
  assert.match(html, /<p dir="ltr" class="persian-ltr">English only<\/p>/);
});

test("HTML escaping covers content used by text and subtitle previews", () => {
  assert.equal(escapeHtml(`<>&\"'`), "&lt;&gt;&amp;&quot;&#39;");
});

test("Markdown preview renders task lists, footnotes, table of contents, native MathML and Mermaid", () => {
  const html = renderDocument("markdown", "[[toc]]\n\n# عنوان\n\n- [x] انجام شد\n\nفرمول $x^2$[^1]\n\n[^1]: توضیح\n\n```mermaid\ngraph LR; A-->B\n```");
  assert.match(html, /table-of-contents/);
  assert.match(html, /task-list-item/);
  assert.match(html, /<math>(?:<mrow>)?<msup><mi>x<\/mi><mn class="tml-sml-pad">2<\/mn><\/msup>(?:<\/mrow>)?<\/math>/);
  assert.match(html, /<bdi class="math-isolate" dir="ltr">/);
  assert.doesNotMatch(html, /katex-html|<svg/i);
  assert.match(html, /class="mermaid"/);
  assert.match(html, /footnote/);
});

test("MathML keeps RTL prose outside an isolated LTR equation", () => {
  const html = renderDocument("markdown", "فرمول درون‌خطی $x^2 + y^2$ و فرمول مستقل:\n\n$$\n\\frac{a}{b}=c\n$$");
  assert.match(html, /<p dir="rtl" class="persian-rtl">فرمول درون‌خطی <bdi class="math-isolate" dir="ltr"><eq><math>/);
  assert.match(html, /<msup><mi>x<\/mi><mn class="tml-sml-pad">2<\/mn><\/msup><mo>\+<\/mo><msup><mi>y<\/mi><mn class="tml-sml-pad">2<\/mn><\/msup>/);
  assert.match(html, /<div class="math-block-isolate" dir="ltr">.*<eqn><math display="block" class="tml-display"><mrow><mfrac><mi>a<\/mi><mi>b<\/mi><\/mfrac><mo>=<\/mo><mi>c<\/mi>/);
  assert.doesNotMatch(html, /<img|<svg/i);
});

test("MathML preserves matrices, roots, sums, subscripts and Persian labels", () => {
  const source = String.raw`$$
\begin{bmatrix}a&b\\c&d\end{bmatrix}\quad
\sqrt{x_1^2}+\sum_{n=1}^{\infty}\frac{1}{n^2}\quad\text{سرعت}
$$`;
  const html = renderDocument("markdown", source);
  assert.match(html, /<mtable>/);
  assert.match(html, /<mtd style="padding-left:[^"]+;padding-right:[^"]+">/);
  assert.match(html, /<msqrt>/);
  assert.match(html, /<msubsup>|<msub>/);
  assert.match(html, /<munderover>/);
  assert.match(html, /<mfrac>/);
  assert.match(html, /<mtext>سرعت<\/mtext>/);
  assert.doesNotMatch(html, /katex-html|<img|<svg/i);
});

test("invalid TeX remains safe and cannot inject executable HTML", () => {
  const html = renderDocument("markdown", String.raw`$\notACommand{<script>alert(1)</script>}$`);
  assert.doesNotMatch(html, /<script>|alert\(1\)/i);
  assert.doesNotMatch(html, /javascript:/i);
});
