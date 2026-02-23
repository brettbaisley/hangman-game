# Product Requirements Document: Hangman Web

## Document Control
- Status: Draft v1
- Owner: Product
- Contributors: Engineering, Design
- Last Updated: 2026-02-23

## 1) Product Overview
Build a polished, modern Hangman game for web browsers. The product includes single-player classic mode and internet head-to-head multiplayer mode.

### Problem Statement
Players need a lightweight, fast-loading word game that works instantly in browser, supports casual solo play, and enables competitive multiplayer rounds.

### Target Audience
- General casual players
- Ages 13+
- Short-session play (2-10 minutes)

## 2) Goals and Non-Goals

### Goals
- Ship a production-ready web Hangman experience.
- Deliver stable single-player gameplay and competitive online multiplayer.
- Ensure responsive UX across desktop and mobile web.
- Use Azure-native hosting and serverless backend architecture.

### Non-Goals (v1)
- Native mobile apps
- Tournament brackets and ladders
- Clan/social graph systems
- User-generated word packs

## 3) Success Metrics

### Primary Metric
- Technical milestone: Production release completed and stable for first public launch.

### Secondary Metrics
- Match completion rate
- Multiplayer reconnect success rate
- API and real-time error rate

## 4) Platform and Technical Constraints (Mandatory)
- Frontend framework: React 19.2
- Hosting: Azure Static Web Apps (SWA)
- Backend: Azure Functions API within SWA
- Real-time multiplayer: Azure SignalR Service
- Persistence: Azure Cosmos DB (serverless)
- Authentication: SWA social auth providers

These constraints are required and not optional for v1.

## 5) Core Gameplay Requirements

### Single-Player Classic
- Player guesses letters to reveal a hidden word.
- Incorrect guesses consume attempts.
- Round is won when all letters are revealed before attempt limit.
- Round is lost when attempt limit is exhausted.

### Shared Rules
- Duplicate guesses do not alter state and return a clear validation response.
- Word list must prevent invalid entries (non-word tokens, prohibited terms).
- Difficulty controls word length/frequency and allowed mistake count.

## 6) Multiplayer Competitive Mode (Head-to-Head)

### Match Setup
- Two players are matched into one room/session.
- Both players receive the same hidden word at round start.
- Both players guess independently and in parallel.

### Round End Conditions
A round ends when any one of the following is true:
1. One player solves the puzzle.
2. Both players fail (attempt limit reached).
3. Round timer expires.

### Winner Resolution (Strict Priority)
1. Solved status: solved beats unsolved.
2. Efficiency: fewer wrong guesses wins.
3. Speed: faster server-validated solve time wins.

### Draw Rule
If both players have identical solved status, identical wrong-guess count, and solve times within tie tolerance, result is a draw.

### Visibility Rules
- Show opponent progress indicators (e.g., attempts used, solved/unsolved status).
- Do not reveal opponent hidden letters or unrevealed puzzle internals.

### Rematch Rule
- Default flow: single-round match outcome.
- Optional rematch prompt appears after result screen.

## 7) Functional Requirements

### Frontend (React 19.2)
- Views: Home, Matchmaking/Lobby, Single-Player Game, Multiplayer Game, Result.
- Responsive UI for mobile and desktop browser widths.
- Keyboard and touch-friendly controls.
- Accessibility baseline: semantic controls, focus order, contrast-compliant UI text.

### API (Azure Functions in SWA)
- Endpoints for matchmaking/session creation, guess submission, state retrieval, and result retrieval.
- Server-authoritative validation for guesses and scoring.
- Deterministic round resolution logic.

### Real-Time Events (SignalR)
- Event types include:
  - match_started
  - guess_submitted
  - state_updated
  - match_ended
- Clients must support reconnect flow and state resync on reconnect.

### Data (Cosmos DB Serverless)
- Persist player profile basics and match outcomes.
- Persist round stats used for result and history.
- Use TTL for ephemeral session records when applicable.

### Auth
- SWA social auth providers for authenticated identity.
- Anonymous browsing permitted; multiplayer and persistent stats may require login.

## 8) Non-Functional Requirements
- P95 API response under target threshold defined in engineering spec.
- Real-time state updates should feel immediate under normal consumer network.
- Graceful degradation for temporary disconnects.
- No exposure of hidden word in client-visible network payload before reveal.

## 9) UX Requirements
- Visual style: polished modern casual game UI.
- Clear state indicators: attempts left, guessed letters, round timer (multiplayer).
- End-of-round screen shows outcome and key resolution factors.
- Error messages are short and actionable.

## 10) Security and Integrity
- Backend is authoritative for game state transitions.
- Reject stale/duplicate/replayed guess submissions.
- Server timestamps are source of truth for tie-break timing.
- Enforce auth claims and role checks at API boundary.

## 11) MVP vs Full-Spec Delivery

### MVP Gate
- Single-player complete and production stable.
- Multiplayer core loop available with deterministic winner logic.
- Basic auth, telemetry, and operational visibility in place.

### Full-Spec Continuation
- Enhanced progression and streak systems.
- Expanded categories/difficulty balancing.
- Broader social and seasonal features.

## 12) Acceptance Criteria (Initial)
- Deployed React 19.2 app on Azure SWA.
- Azure Functions API deployed and callable from SWA frontend.
- Multiplayer rounds resolve using strict winner priority rules.
- Cosmos DB persists round outcomes with server-authored timestamps.
- SignalR real-time updates function through full match lifecycle.
- Authenticated user can start/join multiplayer and receive result.

## 13) Risks and Open Questions
- Real-time disconnect handling quality under unstable mobile networks.
- Cost/performance tuning under concurrent multiplayer load.
- Content moderation policy for custom/display names.
- Final SLO/SLA targets to be ratified by engineering.

## 14) Decision Log Link
See architecture decisions in ../architecture/decisions.md.
