const RTL_RE = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;

/**
 * A block containing Persian/Arabic characters remains RTL even if an
 * English identifier is its first token. Blocks without RTL text stay LTR.
 */
function directionFor(text) {
  return RTL_RE.test(text || "") ? "rtl" : "ltr";
}

module.exports = { directionFor };
