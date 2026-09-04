const { directionFor } = require("./direction");

const DIRECTIONAL_BLOCKS = new Set([
  "paragraph_open",
  "heading_open",
  "blockquote_open",
  "bullet_list_open",
  "ordered_list_open",
  "list_item_open",
  "table_open",
  "th_open",
  "td_open"
]);

function matchingCloseType(openType) {
  return openType.replace(/_open$/, "_close");
}

function textInside(tokens, openIndex) {
  const openType = tokens[openIndex].type;
  const closeType = matchingCloseType(openType);
  let depth = 1;
  let text = "";

  for (let index = openIndex + 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === openType && token.nesting === 1) {
      depth += 1;
    } else if (token.type === closeType && token.nesting === -1) {
      depth -= 1;
      if (depth === 0) break;
    }

    if (token.type === "inline") {
      text += ` ${token.content}`;
    }
  }

  return text;
}

function applyBlockDirections(state) {
  state.tokens.forEach((token, index) => {
    if (!DIRECTIONAL_BLOCKS.has(token.type)) return;

    const direction = directionFor(textInside(state.tokens, index));
    token.attrSet("dir", direction);
    token.attrJoin("class", direction === "rtl" ? "persian-rtl" : "persian-ltr");
  });
}

function activate() {
  return {
    extendMarkdownIt(markdownIt) {
      markdownIt.core.ruler.after("inline", "persian-block-direction", applyBlockDirections);
      return markdownIt;
    }
  };
}

module.exports = { activate, applyBlockDirections };
