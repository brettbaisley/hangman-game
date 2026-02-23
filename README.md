# Hangman Web

Scaffolded project for the Hangman web app with React frontend and Azure Functions API.

## Stack
- React 19.2 frontend in `web/`
- Azure Functions (Node + TypeScript) in `api/`
- Shared game logic package in `shared/`

## Quick start
1. Install dependencies:
   - `npm install`
2. Build all packages:
   - `npm run build`
3. Run frontend only:
   - `npm run dev:web`
   - Open `http://localhost:5173`
4. Run full stack with Static Web Apps emulator (frontend + API):
   - `npm run dev:swa`
   - Open `http://localhost:4280`
   - Verify API is live: `http://localhost:4280/api/health`

## Local prerequisites for full stack
- Node.js 20+
- Azure Functions Core Tools v4 available on your machine

If `npm run dev:swa` cannot start the API host, install Functions Core Tools manually and rerun.

If the frontend loads but API calls fail:
- Check for an `API` process error in the `npm run dev:swa` output.
- Confirm `func` is installed (`func --version`).
- Hit `http://localhost:4280/api/health` directly; it should return JSON with `ok: true`.

## API endpoints (initial scaffold)
- `GET /api/health`
- `POST /api/singleplayer/start`
- `POST /api/singleplayer/guess`
- `GET /api/singleplayer/state/{sessionId}`
- `POST /api/multiplayer/create`
- `POST /api/multiplayer/join`
- `POST /api/multiplayer/guess`
- `GET /api/multiplayer/state/{matchId}/{playerId}`
- `GET /api/multiplayer/result/{matchId}/{playerId}`

## Notes
- API storage is currently in-memory (scaffold phase).
- `api/local.settings.sample.json` is provided as a template for local settings.
