# Hangman Game — Codex Instructions

## Source of truth
Before making product or architectural changes, read:
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`

If implementation and documentation disagree, stop and surface the discrepancy rather than silently changing intended behavior.

## Working principles
- Build V1 as a client-side React application.
- Use Node.js 24 LTS, latest stable Vite, React 19.2, and TypeScript 7.
- Use CSS Modules. Do not introduce Tailwind.
- Keep game rules independent of React presentation components.
- Keep components focused and reusable. In particular, `LetterKey` should not contain Hangman rules.
- Do not add server-side infrastructure, authentication, databases, categories, difficulty, clues, scoring, profiles, stats, sound, or remote multiplayer to V1 unless the product specification is changed first.
- Prefer simple solutions over unnecessary abstractions.
- Preserve the mobile-first, no-scroll gameplay requirement.
- Maintain accessibility: semantic controls, keyboard operation, focus states, and feedback that does not rely on color alone.
- Do not add dependencies without a clear reason.

## Quality requirements
- Add/update tests with behavioral changes.
- Use Vitest for pure game logic and appropriate component tests with React Testing Library.
- Maintain Playwright end-to-end coverage of the complete gameplay flow.
- Before considering a task complete, run the relevant tests and report failures.
- For changes that could affect layout, verify representative mobile and desktop viewport sizes.

## Git / implementation workflow
- Make focused changes that are easy to review.
- Do not merge or deploy production changes without explicit approval.
- When asked to implement a milestone, review the relevant roadmap section first.
