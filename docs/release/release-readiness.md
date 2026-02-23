# Release Readiness Checklist

## 1) Product Scope
- [ ] Single-player classic mode complete and stable.
- [ ] Multiplayer head-to-head available with end-to-end flow.
- [ ] Multiplayer winner logic uses strict priority (solved, wrong guesses, solve time).
- [ ] Draw condition implemented for exact-tie outcomes.

## 2) Frontend Readiness (React 19.2)
- [ ] Production build succeeds for React 19.2 app.
- [ ] Responsive behavior validated for major mobile + desktop widths.
- [ ] Accessibility baseline validated (focus order, controls, readable contrast).
- [ ] Error and empty states implemented for all core views.

## 3) Azure Platform Readiness
- [ ] Frontend deployed to Azure Static Web Apps production environment.
- [ ] Azure Functions API deployed within SWA and reachable from frontend.
- [ ] Environment variables and secrets configured securely.
- [ ] Preview/staging environment process defined.

## 4) Multiplayer Infrastructure
- [ ] Azure SignalR Service integrated and stable under expected concurrency.
- [ ] Client reconnect and state resync flow validated.
- [ ] Server-side authoritative scoring and conflict handling validated.
- [ ] Timer expiry and simultaneous-finish edge cases verified.

## 5) Data and Persistence
- [ ] Cosmos DB serverless provisioned with required containers.
- [ ] Match outcome records persisted with server timestamps.
- [ ] Session TTL policy applied to ephemeral data.
- [ ] Data retention and cleanup policy documented.

## 6) Auth and Security
- [ ] SWA social auth provider(s) configured for production.
- [ ] API enforces auth/claims checks where required.
- [ ] Hidden word not leaked in client-visible payloads before reveal.
- [ ] Replay/duplicate guess protections verified.

## 7) Observability and Operations
- [ ] Application Insights telemetry enabled for frontend and API.
- [ ] Dashboard for errors, latency, and match completion health exists.
- [ ] Alerting thresholds defined for critical failures.
- [ ] Runbook for incident triage and rollback prepared.

## 8) Final Go/No-Go
- [ ] Acceptance criteria from PRD met.
- [ ] Top launch risks reviewed and mitigated.
- [ ] Stakeholder sign-off recorded.

## References
- PRD: ../prd/PRD-hangman-web.md
- ADRs: ../architecture/decisions.md
