import { prompt } from "@cursor/bdk";
import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";
import {
  BOARD_KEY,
  ITEM_KINDS,
  ITEM_STATUSES,
  type BoardItem,
  type ItemKind,
  type ItemStatus,
  normalizeDue,
  normalizeId,
  parseBoard,
} from "../lib/board.js";

const RecordResult = z.object({
  action: z.enum(["created", "updated"]),
  item: z.object({
    id: z.string(),
    kind: z.enum(ITEM_KINDS),
    title: z.string(),
    detail: z.string(),
    owner: z.string(),
    due: z.string(),
    status: z.enum(ITEM_STATUSES),
    updatedAt: z.string(),
  }),
});

export default defineTool({
  description: prompt`
    Save one priority, commitment, open loop, or decision on the operator's board.
    Call once per item. Pass the same id to update an existing item.
    Repeating an id replaces that item's title, kind, and any fields you send.
  `,
  effect: "write",
  inputSchema: z.object({
    id: z
      .string()
      .optional()
      .describe("Stable slug. Omit to derive one from the title. Reuse it to update."),
    kind: z.enum(ITEM_KINDS),
    title: z.string().min(1),
    detail: z.string().optional().describe("Omit to keep the stored detail. Empty string clears it."),
    owner: z.string().optional().describe("Omit to keep the stored owner. Empty string clears it."),
    due: z
      .string()
      .optional()
      .describe("YYYY-MM-DD. Omit to keep the stored date. Empty string clears it."),
    status: z.enum(ITEM_STATUSES).optional().describe("Defaults to open on create. Omit to keep status."),
  }),
  outputSchema: RecordResult,
  async execute({ id, kind, title, detail, owner, due, status }, ctx) {
    const now = new Date().toISOString();
    const itemId = normalizeId(id ?? title);
    const nextDue = normalizeDue(due);
    const board = parseBoard(await ctx.host.kv.get(BOARD_KEY));
    const index = board.items.findIndex((item) => item.id === itemId);
    const previous = index >= 0 ? board.items[index] : undefined;
    const item: BoardItem = {
      id: itemId,
      kind: kind as ItemKind,
      title: title.trim(),
      detail: detail !== undefined ? detail.trim() : (previous?.detail ?? ""),
      owner: owner !== undefined ? owner.trim() : (previous?.owner ?? ""),
      due: nextDue !== undefined ? nextDue : (previous?.due ?? ""),
      status: (status ?? previous?.status ?? "open") as ItemStatus,
      updatedAt: now,
    };
    const action = previous === undefined ? "created" : "updated";
    const items = board.items.slice();
    if (index >= 0) items[index] = item;
    else items.push(item);
    await ctx.host.kv.put(BOARD_KEY, { items });
    return { action, item };
  },
});
