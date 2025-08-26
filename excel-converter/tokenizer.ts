
function isAlphanumeric(c: string) {
  const code = c.charCodeAt(0);
  return (
    (code > 47 && code <  58) || // numeric (0-9)
    (code > 64 && code <  91) || // upper alpha (A-Z)
    (code > 96 && code < 123) || // lower alpha (a-z)
    (code == 46) || // '.' used in numbers
    (code == 36) // '$' used for pinned non-relative positions
  );
}
function isWhitespace(c: string) {
  return c[0] == ' ';
}

export interface TokenIter {
  ignoreWhitespace(): void
  peek(): string
  consume(): string
}

export function tokenIter(src: string): TokenIter {
  // Character iterator (used to generate tokens)
  let ciIdx = 0;
  const ci = {
    ignoreWhitespace: () => { while (src[ciIdx] == ' ') ciIdx++; },
    peek: () => src[ciIdx] ?? '',
    consume: () => src[ciIdx++] ?? ''
  };

  let currToken = '';
  function ignoreWhitespace() {
    if (currToken == '') queueToken();
    while (currToken.length > 0 && currToken.trim().length == 0) queueToken();
  }
  function peek() {
    return currToken || queueToken();
  }
  function consume() {
    const t = currToken || queueToken();
    currToken = '';
    return t;
  }
  function queueToken() {
    currToken = '';
    const peekedChar = ci.peek();
    if (peekedChar == '') return currToken;

    if (isAlphanumeric(peekedChar)) {
      // Identifiers / numbers
      while (isAlphanumeric(ci.peek())) currToken += ci.consume();
    } else if (isWhitespace(peekedChar)) {
      // Whitespace
      while (isWhitespace(ci.peek())) currToken += ci.consume();
    } else if (peekedChar == '"' || peekedChar == "'") {
      // Strings
      currToken += ci.consume();
      while (true) {
        const c = ci.consume();
        if (c.length == 0 || c == currToken[0]) break;
        currToken += c;
      }
      currToken += currToken[0];
    } else {
      // Symbols
      currToken = ci.consume();
      if ((currToken == '<' || currToken == '>') && ci.peek() == '=' || ci.peek() == '>') {
        currToken += ci.consume();
      }
    }
    return currToken;
  }

  return { ignoreWhitespace, peek, consume }
}
