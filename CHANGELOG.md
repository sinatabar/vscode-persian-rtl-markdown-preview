# Changelog

## 1.0.1

- Bundle the variable Noto Sans Arabic font for consistent Persian and mixed-language rendering.
- Include Arabic and Latin WOFF2 subsets so the preview works offline without a system font installation.
- Include the SIL Open Font License 1.1 with the packaged font files.

## 1.0.0

- Add block-aware Persian and Arabic RTL rendering.
- Keep mixed Persian-English blocks RTL even when English appears first.
- Keep pure English text, inline code, and fenced code LTR.
- Add RTL-aware list and blockquote styling.
- Prefer the Noto Sans font family for Persian text when available.
