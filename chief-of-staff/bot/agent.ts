import { defineAgent } from "@cursor/bdk";

export default defineAgent({
  name: "Chief of Staff",
  description:
    "Tracks priorities, commitments, and open loops, and prepares briefings and decision memos.",
  model: {
    id: "grok-4.5",
    params: [
      { id: "effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
  local: {
    sandbox: true,
  },
});
