/** The JSON tree, with a stable JSON Pointer for every node. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type Kind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface TreeNode {
  /** JSON Pointer (RFC 6901); '' for the root. */
  ptr: string;
  /** Key in the parent (array index as a string); for the root, a label. */
  label: string;
  value: Json;
  kind: Kind;
  children: TreeNode[];
  parent: TreeNode | null;
  depth: number;
}

export function kindOf(v: Json): Kind {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v as 'object' | 'string' | 'number' | 'boolean';
}

const escape = (key: string) => key.replace(/~/g, '~0').replace(/\//g, '~1');

/** Builds the tree. `rootLabel` is the file name, or defaults to the root's type. */
export function buildTree(value: Json, rootLabel?: string): TreeNode {
  const make = (v: Json, label: string, ptr: string, parent: TreeNode | null): TreeNode => {
    const node: TreeNode = {
      ptr, label, value: v, kind: kindOf(v), children: [], parent, depth: parent ? parent.depth + 1 : 0,
    };
    if (Array.isArray(v)) {
      node.children = v.map((c, i) => make(c, String(i), `${ptr}/${i}`, node));
    } else if (v !== null && typeof v === 'object') {
      node.children = Object.entries(v).map(([k, c]) => make(c, k, `${ptr}/${escape(k)}`, node));
    }
    return node;
  };
  return make(value, rootLabel ?? kindOf(value), '', null);
}

export function* walk(node: TreeNode): Generator<TreeNode> {
  yield node;
  for (const c of node.children) yield* walk(c);
}

/** The node at `ptr`, or undefined. */
export function find(root: TreeNode, ptr: string): TreeNode | undefined {
  if (ptr === '') return root;
  let node: TreeNode | undefined = root;
  for (const part of ptr.slice(1).split('/')) {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    node = node?.children.find((c) => c.label === key);
    if (!node) return undefined;
  }
  return node;
}

/** Ancestors of `node`, from the root down to its parent. */
export function ancestors(node: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  for (let p = node.parent; p; p = p.parent) out.unshift(p);
  return out;
}

/** Scalars, and empty objects and arrays, are drawn as a single value. */
export function isLeaf(node: TreeNode): boolean {
  return node.children.length === 0;
}
