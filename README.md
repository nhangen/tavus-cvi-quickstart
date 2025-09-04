# Tavus CVI Quickstart (90s to first success)

## Run
1) `cp .env.local.example .env.local` and set:
   - TAVUS_API_KEY
   - TAVUS_PERSONA_ID
   - TAVUS_REPLICA_ID
2) `npm i && npm run dev`
3) Open http://localhost:3000 → **Start Conversation** → chat in the embed.

## What this proves
- Time-to-first-success: clone → env → talk to a replica in ~90s.
- No meetings or manual setup; clean error messages.
- Hand-off ready: this README can go straight to customers.

## Troubleshooting
- 401/403: check `TAVUS_API_KEY`
- 404/422: verify `TAVUS_PERSONA_ID` / `TAVUS_REPLICA_ID`
