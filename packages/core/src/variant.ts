/**
 * Display variants: the plugin interface of the layout engine.
 *
 * For each node, the engine asks every registered variant whether it
 * applies (`match` returns a priority, or null). Only the variants with the
 * highest priority are used, and all of their options go into the layout
 * search, which picks between them by size and by how much they show. So a
 * plugin with a higher priority replaces the built-in displays of the nodes
 * it matches, while variants of equal priority compete on layout.
 *
 * A variant that displays a container measures its whole subtree itself, so
 * plugins matching nodes inside it are not consulted unless it delegates a
 * child back to the engine (`m.childOptions`). Conflicts therefore resolve in
 * favour of the outermost matching node, which usually has the richer display.
 */
import { isLeaf, type TreeNode } from './json.js';
import type { Measurer, Option } from './measure.js';

export interface Variant {
  /** Unique id, e.g. 'core/frame' or 'markdown'. Marks of custom variants carry it. */
  id: string;
  /** 'value' variants sit beside a key capsule; 'block' variants take the full row. */
  layout: 'value' | 'block';
  /** How strongly this variant wants to display `node` (higher wins), or null. */
  match(node: TreeNode): number | null;
  /** Display options for `node` at most `maxW` wide (see `Option`). */
  measure(node: TreeNode, maxW: number, m: Measurer): Option[];
}

/** Priority of the built-in variants. Plugins should use more (e.g. 10). */
export const BUILTIN_PRIORITY = 0;

const isContainer = (n: TreeNode, kind: 'object' | 'array') => n.kind === kind && !isLeaf(n);

/** The built-in displays: scalars, bare arrays, array containers, object frames. */
export const builtinVariants: readonly Variant[] = [
  {
    id: 'core/scalar', layout: 'value',
    match: (n) => (isLeaf(n) ? BUILTIN_PRIORITY : null),
    measure: (n, w, m) => m.leafOptions(n, w),
  },
  {
    id: 'core/array', layout: 'value',
    match: (n) => (isContainer(n, 'array') ? BUILTIN_PRIORITY : null),
    measure: (n, w, m) => m.bareArray(n, w),
  },
  {
    id: 'core/container', layout: 'block',
    match: (n) => (isContainer(n, 'array') ? BUILTIN_PRIORITY : null),
    measure: (n, w, m) => m.container(n, w),
  },
  {
    id: 'core/frame', layout: 'block',
    match: (n) => (isContainer(n, 'object') ? BUILTIN_PRIORITY : null),
    measure: (n, w, m) => m.frame(n, w),
  },
];
