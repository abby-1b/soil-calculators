
/** Intermediate representation tree */
export type TreeNode = 
  | { type: 'lit_num', value: number } // literal number
  | { type: 'lit_str', value: string } // literal string
  | { type: 'lit_adr', value: string } // literal address (pointer), can also be a range
  | { type: 'lit_adr_otr', sheet: string, value: string } // literal address within another sheet
  | { type: 'lit_bool', value: boolean } // literal boolean
  | { type: 'unr', opr: string, inner: TreeNode } // unary operator
  | { type: 'opr', opr: string, left: TreeNode, right: TreeNode }
  | { type: 'fn', name: string, args: TreeNode[] }
  | { type: 'paren', inner: TreeNode };
