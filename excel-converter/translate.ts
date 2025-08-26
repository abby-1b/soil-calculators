import { formulaToTree } from "./parse.ts";
import { TreeNode } from "./tree-node.ts";

/** A map from excel operators to their equivalent JS operators */
const OPERATOR_MAPPINGS = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '^': '**',
  '=': '==',
  '<': '<',
  '>': '>',
  '<=': '<=',
  '>=': '>=',
  '<>': '!=',
};

/** A map of names to functions, their optimizers, and if they should be inlined */
// const EXCEL_FUNCTIONS: Record<string, [Function, (n: TreeNode) => TreeNode, boolean]> = {
//   'VLOOKUP': [
//     () => 0,
//   ]
// };

function addressToColumnAndRow(
  address: string,
  startIdx = 0
): [ number, number, number ] {
  let i = startIdx;
  let column = 0;
  while (address.charCodeAt(i) > 64 && address.charCodeAt(i) < 91) {
    column = column * 26 + (address.charCodeAt(i) - 64);
    i++
  }
  column--; // 'A' is 1, so make it start at zero!

  let row = 0;
  while (address.charCodeAt(i) > 47 && address.charCodeAt(i) < 58) {
    row = row * 10 + (address.charCodeAt(i) - 48);
    i++
  }
  row--; // Rows start at one, make them start at zero
  return [ column, row, i ];
}

function addressToGetter(node: TreeNode, currentSheet: string): string {
  if (node.type != 'lit_adr' && node.type != 'lit_adr_otr') {
    throw new Error('Expected address, found ' + JSON.stringify(node));
  }
  const address = node.value;
  const sheet = ',\'' + (node.type == 'lit_adr_otr' ? node.sheet : currentSheet) + '\'';

  let [ firstColumn, firstRow, endIdx ] = addressToColumnAndRow(address);
  if (endIdx >= address.length) {
    // Single address (not a range)
    return 'getAddress(' + firstColumn + ',' + firstRow + sheet + ')';
  }

  let [ secondColumn, secondRow, _ ] = addressToColumnAndRow(address, endIdx + 1);
  return 'getAddressRange(' + firstColumn + ',' + firstRow + ',' + secondColumn + ',' + secondRow + sheet + ')';
}

export function treeToJS(node: TreeNode, level: number, currentSheet: string): string {
  const indent = '  '.repeat(level);
  let out = '';
  switch (node.type) {
    case 'lit_num': { out = '' + node.value; } break;
    case 'lit_str': { out = node.value; } break;
    case 'lit_adr_otr':
    case 'lit_adr': { out = addressToGetter(node, currentSheet); } break;
    case 'lit_bool': { out = '' + node.value; } break;
    case 'unr': {
      out = node.opr == '%'
        ? '0.01 * ' + treeToJS(node.inner, 0, currentSheet)
        : node.opr + treeToJS(node.inner, 0, currentSheet)
    } break;
    case 'opr': {
      out = treeToJS(node.left, 0, currentSheet) + ' ' + OPERATOR_MAPPINGS[node.opr] + ' ' + treeToJS(node.right, 0, currentSheet);
    } break;
    case 'fn': {
      if (node.name == 'IF') {
        out =
          '(' + treeToJS(node.args[0], 0, currentSheet) +
          ' ? ' + treeToJS(node.args[1], 0, currentSheet) +
          ' : ' + treeToJS(node.args[2], 0, currentSheet) + ')';
      } else {
        out = node.name + '(' + node.args.map(a => treeToJS(a, 0, currentSheet)).join(',') + ')';
      }
    } break;
    case 'paren': {
      out = '(' + treeToJS(node.inner, 0, currentSheet) + ')'
    } break;
  }
  return out;
}

const tree = formulaToTree(`=VLOOKUP(A4,'CT Data'!Y3:AF58,2,FALSE)`);
console.log(tree);
const js = treeToJS(tree, 0, '');
console.log(js);
