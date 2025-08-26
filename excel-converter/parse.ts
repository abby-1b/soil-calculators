import { tokenIter, TokenIter } from "./tokenizer.ts";
import { TreeNode } from "./tree-node.ts";

const OPERATORS = [ '+', '-', '*', '/', '^', ':', '%', '=', '<', '>', '<=', '>=', '<>' ];
const NUMERIC_OPERATORS = [ '+', '-', '*', '/', '^', '%', '<', '>', '<=', '>=', '<>' ];
const OPR_PRECEDENCE = {
  ':': 6,
  '%': 5,
  '^': 4,
  '*': 3, '/': 3,
  '+': 2, '-': 2,
  '=': 1, '<': 1, '>': 1
};

/** Checks if a given string is a valid cell address */
function isValidAddress(str: string): boolean {
  str = str.replace(/\$/g, '');
  if (str.length < 2) return false;
  let i = 0;

  // TODO: multi-letter addresses

  // Check letters
  while (true) {
    const letterCode = str.charCodeAt(i);
    if (letterCode <= 64 || letterCode >= 91) {
      if (i > 0) break;
      else return false;
    }
    i++;
    if (i >= str.length) return false;
  }

  // Check number
  const numberStr = str.slice(i);
  try {
    if (numberStr != parseInt(numberStr) + "") return false;
  } catch {
    return false;
  }

  return true;
}

/** Parses multiple nodes until reaching an ending group (or end of source) */
function parseCommaSeparated(iter: TokenIter, predecence: number): TreeNode[] {
  const out: TreeNode[] = [];
  while (true) {
    if (')]}'.includes(iter.peek())) {
      break;
    }
    out.push( parse(iter, predecence) );
    if (iter.peek() == ',') {
      iter.consume();
      iter.ignoreWhitespace();
    }
  }
  return out;
}

/** Parses a stream of tokens, returning a functional IR tree */
function parse(iter: TokenIter, predecence: number): TreeNode {
  iter.ignoreWhitespace();

  let left = ((iter): TreeNode => {
    const firstToken = iter.consume();
    iter.ignoreWhitespace();
    if (isValidAddress(firstToken)) {
      // Address
      return { type: 'lit_adr', value: firstToken.replace(/\$/, '') };
    } else if (firstToken.length == 1 && OPERATORS.includes(firstToken)) {
      // Unary operator
      return { type: 'unr', opr: firstToken, inner: parse(iter, predecence) };
    } else if (iter.peek() == '(') {
      // Function
      iter.consume(); // skip '('
      const args = parseCommaSeparated(iter, 0);
      iter.consume(); // skip ')'

      // Some functions just refer to constants
      if (firstToken == 'TRUE') { return { type: 'lit_bool', value: true }; }
      else if (firstToken == 'FALSE') { return { type: 'lit_bool', value: false }; }

      return { type: 'fn', name: firstToken, args };

    } else if (firstToken == 'TRUE' || firstToken == 'FALSE') {
      return { type: 'lit_bool', value: firstToken == 'TRUE' };
    } else if ([ '"', "'" ].includes(firstToken[0])) {
      // String
      return { type: 'lit_str', value: firstToken }
    } else if (!Number.isNaN(parseFloat(firstToken))) {
      // Number
      return { type: 'lit_num', value: parseFloat(firstToken) };
    } else if (firstToken == '(') {
      // Parenthesis
      const inner = parse(iter, 0);
      iter.consume(); // skip ')'
      return { type: 'paren', inner };
    }

    // Unknown thing!
    console.log({ firstToken, nextToken: iter.peek() });
    throw new Error("WHAT");
  })(iter);

  while (true) {
    const next = iter.peek();
    if (')]},'.includes(next)) break; // also checks for empty string!

    if (next == '%') {
      // The only postfix unary operator
      const newPrecedence = OPR_PRECEDENCE[next];
      if (newPrecedence < predecence) { break; }
      left = { type: 'unr', opr: iter.consume(), inner: left };
    } else if (OPERATORS.includes(next)) {
      // Other operators
      const newPrecedence = OPR_PRECEDENCE[next];
      if (newPrecedence < predecence) { break; }

      // Get operator and right side
      const opr = iter.consume();
      let right = parse(iter, newPrecedence);

      if (NUMERIC_OPERATORS.includes(opr)) {
        // Cast string to integer
        if (left .type == 'lit_str') left  = { type: 'lit_num', value: parseFloat(left .value.slice(1, -1)) };
        if (right.type == 'lit_str') right = { type: 'lit_num', value: parseFloat(right.value.slice(1, -1)) };
  
        if (left.type == 'lit_num' && right.type == 'lit_num') {
          // Perform operation immediately
          if      (opr ==  '+') { left = { type: 'lit_num' , value: left.value  + right.value }; }
          else if (opr ==  '-') { left = { type: 'lit_num' , value: left.value  - right.value }; }
          else if (opr ==  '*') { left = { type: 'lit_num' , value: left.value  * right.value }; }
          else if (opr ==  '/') { left = { type: 'lit_num' , value: left.value  / right.value }; }
          else if (opr ==  '^') { left = { type: 'lit_num' , value: left.value ** right.value }; }
          else if (opr ==  '=') { left = { type: 'lit_bool', value: left.value == right.value }; }
          else if (opr ==  '<') { left = { type: 'lit_bool', value: left.value  < right.value }; }
          else if (opr ==  '>') { left = { type: 'lit_bool', value: left.value  > right.value }; }
          else if (opr == '<=') { left = { type: 'lit_bool', value: left.value <= right.value }; }
          else if (opr == '>=') { left = { type: 'lit_bool', value: left.value >= right.value }; }
          else if (opr == '<>') { left = { type: 'lit_bool', value: left.value != right.value }; }
          else { throw new Error('Unknown operator ' + opr); }
        } else {
          left = { type: 'opr', opr, left, right };
        }
      } else if (opr == ':') {
        if (left.type != 'lit_adr' || right.type != 'lit_adr') {
          throw new Error('Expected two addresses, found ' + JSON.stringify(left) + ' and ' + JSON.stringify(right));
        }
        left = { type: 'lit_adr', value: left.value + ':' + right.value };
      } else {
        left = { type: 'opr', opr, left, right };
      }
    } else if (next == '!' && left.type == 'lit_str') {
      iter.consume(); // skip operator
      const addr = parse(iter, predecence);
      if (addr.type != 'lit_adr') {
        throw new Error("Expected address, found " + JSON.stringify(addr))
      }
      left = {
        type: 'lit_adr_otr',
        sheet: left.value.slice(1, -1),
        value: addr.value
      }
    } else {
      console.log({ next, left });
      throw new Error("WHAT 2");
    }
  }

  return left;
}

/** Converts a formula to JS code. Leading `=` is ignored! */
export function formulaToTree(formula: string) {
  formula = formula.trim();
  if (formula[0] == '=') formula = formula.slice(1);

  const iter = tokenIter(formula);
  return parse(iter, 0);
}
