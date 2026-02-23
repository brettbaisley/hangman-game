# Architecture Decisions

## ADR-001: Frontend Framework
- Decision: Use React 19.2 for the web frontend.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Modern ecosystem support and alignment with product requirement.

## ADR-002: Hosting Platform
- Decision: Host frontend on Azure Static Web Apps.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Native Azure workflow, integrated frontend/API deployment model.

## ADR-003: Backend Runtime
- Decision: Implement required backend APIs as Azure Functions within SWA.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Serverless scaling and direct alignment with product constraint.

## ADR-004: Multiplayer Real-Time Transport
- Decision: Use Azure SignalR Service for real-time multiplayer events.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Purpose-built for low-latency state fanout and reconnect support.

## ADR-005: Data Store
- Decision: Persist operational game data in Azure Cosmos DB (serverless).
- Status: Accepted
- Date: 2026-02-23
- Rationale: Flexible document model, serverless consumption model, global-ready architecture.

## ADR-006: Authentication
- Decision: Use Azure Static Web Apps social auth providers.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Built-in auth integration with SWA and function-side identity claims.

## ADR-007: Multiplayer Winner Logic
- Decision: Resolve winner by strict order: solved status, fewer wrong guesses, faster solve time.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Balances competitiveness, fairness, and deterministic server resolution.

## ADR-008: Server Authority
- Decision: Backend is authoritative for game state, validation, and round outcomes.
- Status: Accepted
- Date: 2026-02-23
- Rationale: Reduces cheating vectors and resolves client-state conflicts predictably.
