import { defineEval } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "capture",
      description: "A stated commitment is saved once under the given id.",
      async test(t) {
        await t.send(
          "Track this commitment: send the radon QA checklist to the Austin site. Owner is Jordan. Due 2026-10-10. Use id austin-qa.",
        );
        t.succeeded();
        t.calledTool("record_item", {
          count: 1,
          input: {
            id: "austin-qa",
            kind: "commitment",
            due: "2026-10-10",
          },
        });
      },
    },
    {
      id: "status",
      description: "A status question reads the board and does not write.",
      async test(t) {
        await t.send("What is open on my board right now?");
        t.succeeded();
        t.calledTool("list_items");
        t.notCalledTool("record_item");
      },
    },
    {
      id: "memo",
      description: "A decision memo is drafted without saving.",
      async test(t) {
        await t.send(
          "Draft a decision memo on expanding radon testing into Florida this quarter. Do not save anything.",
        );
        t.succeeded();
        t.notCalledTool("record_item");
      },
    },
  ],
});
