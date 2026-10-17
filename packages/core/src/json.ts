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

const childPtr = (ptr: string, key: string) => `${ptr}/${escape(key)}`;

function makeNode(v: Json, label: string, ptr: string, parent: TreeNode | null): TreeNode {
  const node: TreeNode = {
    ptr, label, value: v, kind: kindOf(v), children: [], parent, depth: parent ? parent.depth + 1 : 0,
  };
  node.children = entries(v).map(([k, c]) => makeNode(c, k, childPtr(ptr, k), node));
  return node;
}

/** A container's entries as [key, value] (array indices as strings); none for a scalar. */
function entries(v: Json): [string, Json][] {
  if (Array.isArray(v)) return v.map((c, i) => [String(i), c]);
  if (v !== null && typeof v === 'object') return Object.entries(v);
  return [];
}

/** Builds the tree. `rootLabel` is the file name, or defaults to the root's type. */
export function buildTree(value: Json, rootLabel?: string): TreeNode {
  return makeNode(value, rootLabel ?? kindOf(value), '', null);
}

/**
 * Replaces the value at `ptr` with `value`, in place. Nodes whose content is
 * unchanged are kept (with whatever is cached for them), and `changed` is
 * called for every node whose content did change: inside the subtree, the
 * node itself, and its ancestors. The caller's JSON is never mutated: the
 * ancestors get copies of their values with the new part in place.
 * Returns false (changing nothing) if there is no node at `ptr`.
 */
export function replaceAt(root: TreeNode, ptr: string, value: Json, changed: (node: TreeNode) => void): boolean {
  const node = find(root, ptr);
  if (!node) return false;
  if (node === root && node.label === node.kind) node.label = kindOf(value); // a default label follows the type
  if (!reconcile(node, value, changed)) return true;
  for (let child = node, p = node.parent; p; child = p, p = p.parent) {
    if (Array.isArray(p.value)) {
      const copy = p.value.slice();
      copy[Number(child.label)] = child.value;
      p.value = copy;
    } else {
      p.value = { ...(p.value as Record<string, Json>), [child.label]: child.value };
    }
    changed(p);
  }
  return true;
}

/** Makes `node` hold `v`, reusing the children whose content is unchanged; returns whether anything changed. */
function reconcile(node: TreeNode, v: Json, changed: (node: TreeNode) => void): boolean {
  if (node.value === v) return false; // the same value (or object)
  const kind = kindOf(v);
  let dirty = kind !== node.kind || (kind !== 'object' && kind !== 'array'); // a different scalar
  const old = new Map(kind === node.kind ? node.children.map((c) => [c.label, c]) : []);
  const children = entries(v).map(([k, c]) => {
    const prev = old.get(k);
    if (!prev) {
      dirty = true;
      return makeNode(c, k, childPtr(node.ptr, k), node);
    }
    if (reconcile(prev, c, changed)) dirty = true;
    return prev;
  });
  // Keys removed or reordered change the node too.
  if (children.length !== node.children.length || children.some((c, i) => c !== node.children[i])) dirty = true;
  node.children = children;
  node.value = v;
  node.kind = kind;
  if (dirty) changed(node);
  return dirty;
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
