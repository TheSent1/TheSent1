---
description: Use when the operator asks for a decision memo, options, or a recommendation on a choice.
---

# Decision memo

1. Call `list_items` if the choice might already be on the board. Skip the call when the message is self-contained and says not to use the board.
2. Use only facts from this turn and from `list_items`. Label anything unknown as unknown.
3. Write this shape:
   - Decision: the choice, one sentence
   - Context: the facts that bear on it
   - Options: two or three, each with one upside and one downside
   - Recommendation: one option and the reason
   - Save: the `id`, kind `decision`, and title to pass to `record_item` if the operator accepts it
4. Do not call `record_item` in this turn unless the operator asked you to save the decision.
