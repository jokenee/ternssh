import type { TreeNode } from "@/lib/api";

export interface VisibleTreeRow {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  index: number;
}

export function flattenTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  parentId: string | null = null,
  depth = 0,
): VisibleTreeRow[] {
  const rows: VisibleTreeRow[] = [];

  nodes.forEach((node, index) => {
    rows.push({ node, depth, parentId, index });

    if (node.type === "group" && expanded.has(node.id)) {
      rows.push(...flattenTree(node.children, expanded, node.id, depth + 1));
    }
  });

  return rows;
}

export function countTreeNodes(nodes: TreeNode[]): {
  servers: number;
  groups: number;
} {
  let servers = 0;
  let groups = 0;

  const walk = (items: TreeNode[]) => {
    for (const item of items) {
      if (item.type === "server") servers += 1;
      else {
        groups += 1;
        walk(item.children);
      }
    }
  };

  walk(nodes);
  return { servers, groups };
}

export function countGroupChildren(nodes: TreeNode[], groupId: string): number {
  const walk = (items: TreeNode[]): number | null => {
    for (const item of items) {
      if (item.type === "group") {
        if (item.id === groupId) return item.children.length;
        const nested = walk(item.children);
        if (nested !== null) return nested;
      }
    }
    return null;
  };

  return walk(nodes) ?? 0;
}

export function isGroupDescendant(
  nodes: TreeNode[],
  groupId: string,
  maybeAncestorId: string,
): boolean {
  const walk = (items: TreeNode[], inside: boolean): boolean => {
    for (const item of items) {
      if (item.type !== "group") continue;
      const nextInside = inside || item.id === maybeAncestorId;
      if (nextInside && item.id === groupId) return true;
      if (walk(item.children, nextInside)) return true;
    }
    return false;
  };

  return walk(nodes, false);
}

export type DragItem = { type: "server" | "group"; id: string };

export type DropIntent =
  | { kind: "before"; parentId: string | null; index: number }
  | { kind: "into"; groupId: string };

export const DRAG_MIME = "application/x-ternssh-tree-item";

export function readDragItem(dataTransfer: DataTransfer): DragItem | null {
  const raw = dataTransfer.getData(DRAG_MIME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DragItem;
    if (
      (parsed.type === "server" || parsed.type === "group") &&
      typeof parsed.id === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function writeDragItem(dataTransfer: DataTransfer, item: DragItem) {
  dataTransfer.setData(DRAG_MIME, JSON.stringify(item));
  dataTransfer.effectAllowed = "move";
}
