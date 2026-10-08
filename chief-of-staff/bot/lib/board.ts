import type { JsonValue } from "@cursor/bdk";

export const BOARD_KEY = "board";

export const ITEM_KINDS = ["priority", "commitment", "decision", "open_loop"] as const;
export const ITEM_STATUSES = ["open", "done", "dropped"] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export type BoardItem = {
  id: string;
  kind: ItemKind;
  title: string;
  detail: string;
  owner: string;
  due: string;
  status: ItemStatus;
  updatedAt: string;
};

export type Board = {
  items: BoardItem[];
};

export type BoardCounts = {
  open: number;
  done: number;
  dropped: number;
  total: number;
};

const KIND_RANK: Record<ItemKind, number> = {
  priority: 0,
  commitment: 1,
  open_loop: 2,
  decision: 3,
};

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeId(raw: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");
  if (!ID_PATTERN.test(slug)) {
    throw new Error("id must contain at least one letter or number");
  }
  return slug;
}

export function normalizeDue(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const due = raw.trim();
  if (due === "") return "";
  if (!DUE_PATTERN.test(due)) {
    throw new Error("due must be YYYY-MM-DD or empty");
  }
  return due;
}

export function emptyBoard(): Board {
  return { items: [] };
}

export function parseBoard(value: JsonValue | undefined): Board {
  if (value === undefined || value === null || typeof value !== "object" || Array.isArray(value)) {
    return emptyBoard();
  }
  const items = value.items;
  if (!Array.isArray(items)) return emptyBoard();
  return { items: items.filter(isBoardItem) };
}

export function countsFor(items: BoardItem[]): BoardCounts {
  const counts: BoardCounts = { open: 0, done: 0, dropped: 0, total: items.length };
  for (const item of items) {
    counts[item.status] += 1;
  }
  return counts;
}

export function sortItems(items: BoardItem[]): BoardItem[] {
  return [...items].sort((a, b) => {
    const byKind = KIND_RANK[a.kind] - KIND_RANK[b.kind];
    if (byKind !== 0) return byKind;
    if (a.due !== b.due) {
      if (a.due === "") return 1;
      if (b.due === "") return -1;
      return a.due < b.due ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
}

function isBoardItem(value: JsonValue): value is BoardItem {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  return (
    typeof value.id === "string" &&
    isItemKind(value.kind) &&
    typeof value.title === "string" &&
    typeof value.detail === "string" &&
    typeof value.owner === "string" &&
    typeof value.due === "string" &&
    isItemStatus(value.status) &&
    typeof value.updatedAt === "string"
  );
}

function isItemKind(value: JsonValue | undefined): value is ItemKind {
  return typeof value === "string" && (ITEM_KINDS as readonly string[]).includes(value);
}

function isItemStatus(value: JsonValue | undefined): value is ItemStatus {
  return typeof value === "string" && (ITEM_STATUSES as readonly string[]).includes(value);
}
