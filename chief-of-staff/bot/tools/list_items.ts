import { prompt } from "@cursor/bdk";
import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";
import {
  BOARD_KEY,
  ITEM_KINDS,
  ITEM_STATUSES,
  countsFor,
  parseBoard,
  sortItems,
} from "../lib/board.js";

export default defineTool({
  description: prompt`
    Read the operator's board.
    Call this before a status answer, a briefing, or any claim about what is open.
    Defaults to open items. Counts cover the whole board, not only the filtered list.
  `,
  effect: "read",
  inputSchema: z.object({
    status: z
      .enum(["open", "done", "dropped", "all"])
      .optional()
      .describe("Which items to return. Defaults to open."),
    kind: z.enum(ITEM_KINDS).optional().describe("Optional kind filter."),
  }),
  outputSchema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        kind: z.enum(ITEM_KINDS),
        title: z.string(),
        detail: z.string(),
        owner: z.string(),
        due: z.string(),
        status: z.enum(ITEM_STATUSES),
        updatedAt: z.string(),
      }),
    ),
    counts: z.object({
      open: z.number(),
      done: z.number(),
      dropped: z.number(),
      total: z.number(),
    }),
  }),
  async execute({ status, kind }, ctx) {
    const board = parseBoard(await ctx.host.kv.get(BOARD_KEY));
    const wanted = status ?? "open";
    const items = sortItems(
      board.items.filter((item) => {
        if (wanted !== "all" && item.status !== wanted) return false;
        if (kind !== undefined && item.kind !== kind) return false;
        return true;
      }),
    );
    return { items, counts: countsFor(board.items) };
  },
});
