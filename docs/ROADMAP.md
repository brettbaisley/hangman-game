# Hangman Game — Roadmap

## V1 objective
Ship a polished, reliable Single Player Hangman experience before adding additional game modes.

## Milestone 1 — Project foundation
- Create Vite + React 19.2 + TypeScript 7 project using Node.js 24 LTS.
- Establish CSS Modules and shared CSS design tokens.
- Add Vitest, React Testing Library, and Playwright.
- Establish linting/formatting conventions appropriate to the project.
- Create the basic Home and Game screen shells.
- Confirm responsive/no-scroll strategy on representative phone and desktop viewports.

**Exit criteria:** project builds, tests run, basic navigation works, and viewport foundation is validated.

## Milestone 2 — Core Hangman engine
- Implement pure game state/rules.
- Implement answer normalization and revealed-answer logic.
- Implement six-incorrect-guess loss behavior.
- Implement win behavior.
- Implement curated `words.json` data source.
- Implement random selection with immediate-repeat avoidance.
- Add comprehensive unit tests.

**Exit criteria:** all Hangman rules can be exercised and validated without the visual game UI.

## Milestone 3 — Gameplay UI
- Build reusable `LetterKey` component.
- Build `GameKeyboard` with QWERTY layout.
- Connect on-screen guesses to game engine.
- Add desktop physical keyboard support using the same guess action.
- Build individual-letter answer display with word-safe phrase wrapping.
- Build incorrect-guess counter.
- Build responsive SVG Hangman drawing.

**Exit criteria:** a complete game can be played from start to win/loss on supported viewport sizes without scrolling.

## Milestone 4 — Navigation and end states
- Implement Home behavior that ends the active game.
- Implement New Game confirmation with `Start new game?` and Yes/No actions.
- Implement Play Again.
- Add brief win confetti.
- Add loss answer reveal and transparent red Game Over overlay.
- Respect reduced-motion preferences.

**Exit criteria:** all V1 game and navigation flows match the product specification.

## Milestone 5 — E2E hardening and responsive polish
- Complete Playwright gameplay suite.
- Validate representative mobile, tablet, and desktop viewports.
- Validate current Safari/iOS/iPadOS behavior.
- Validate modern Chrome/Android and major desktop browsers.
- Check keyboard accessibility and focus states.
- Fix layout edge cases involving longer curated phrases.
- Run complete test suite before release.

**Exit criteria:** automated tests validate the complete gameplay flow and the UI is usable across target devices without gameplay scrolling.

## Milestone 6 — Hosting / delivery
- Configure production Vite build.
- Configure Firebase Hosting.
- Prefer GitHub/Firebase preview deployments for feature/PR review.
- Configure production deployment from the approved main branch.

**Exit criteria:** changes can be previewed before merge and approved main-branch builds can deploy reliably.

# Post-V1 possibilities
These are intentionally not part of V1 and require separate planning/specification.

## Pass & Play
Two players use the same device. One enters a secret word/phrase and potentially other future metadata before handing the device to the guessing player.

## Remote multiplayer
Two players use different devices. Likely requires shared remote state, identity/session handling, and careful handling of the secret answer. Firebase services are a possible fit but should be selected only after multiplayer behavior is specified.

## Other potential additions
- Sound/haptics
- Themes
- Player profiles
- Stats/streaks
- Categories
- Additional curated content

None should be added to V1 opportunistically without updating the product plan.
