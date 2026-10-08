# Chief of Staff

Operator board for priorities, commitments, open loops, and decisions. Briefings and decision memos stay in the model. The board itself is stored in host KV so it survives a new process.

Defaults used for this build: playground and HTTP only, no MCP connectors, model `grok-4.5` with high effort. A weekday brief is scheduled at 13:00 UTC (8:00 AM Central during daylight time). Change the cron in `bot/schedules/morning-brief.md` to move it. Schedules do not auto-fire under `bdk dev`; dispatch one with `POST /v1/dev/schedules/morning-brief`.

```bash
cd chief-of-staff
bdk login
bdk validate --dir .
bdk dev --dir .
```

Playground: `http://127.0.0.1:3000/playground`.
