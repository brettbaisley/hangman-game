# Hangman Game — V1 Architecture

## Technology stack
- Node.js 24 LTS for development/build tooling
- Latest stable Vite
- React 19.2
- TypeScript 7
- CSS Modules
- Vitest
- React Testing Library
- Playwright for end-to-end tests
- Firebase Hosting may be used to host the static production build and preview deployments

## Runtime architecture
V1 is entirely client-side.

No application server, database, authentication service, or server-side Node.js process is required for gameplay.

Firebase Hosting, when used, serves the static Vite production output.

## Architectural principle
The core Hangman rules must be independent from:
- React
- UI layout
- Firebase
- Browser storage
- Word-source implementation
- Future multiplayer transport

This allows future game modes to reuse the same underlying game rules.

## Suggested source organization
Exact names may evolve during implementation, but prefer a structure along these lines:

```text
src/
  components/
    GameKeyboard/
      GameKeyboard.tsx
      GameKeyboard.module.css
    LetterKey/
      LetterKey.tsx
      LetterKey.module.css
    HangmanDrawing/
      HangmanDrawing.tsx
      HangmanDrawing.module.css
    AnswerDisplay/
    GameOverlay/
    TopBar/

  data/
    words.json

  game/
    hangmanGame.ts
    hangmanGame.test.ts
    wordSelection.ts
    wordSelection.test.ts

  screens/
    HomeScreen/
    GameScreen/

  styles/
    globals.css
    tokens.css

  App.tsx
  main.tsx
```

Avoid excessive abstraction for V1.

## Core game model
The game domain should represent concepts such as:

```ts
export type GameStatus = 'playing' | 'won' | 'lost'

export interface HangmanGameState {
  answer: string
  guessedLetters: Set<string> // serialization may use an array
  incorrectGuesses: number
  status: GameStatus
}
```

Pure functions should handle behaviors such as:
- Normalizing a guessed letter.
- Determining whether an answer contains a letter.
- Applying a guess.
- Preventing duplicate guesses from affecting state.
- Calculating revealed/masked characters.
- Determining win state.
- Determining loss state after six incorrect guesses.

The exact representation may change if a cleaner TypeScript design emerges, but the domain logic must remain independently testable.

## Word selection
`words.json` contains an `entries` array.

A word-selection module should:
- Select an entry randomly.
- Avoid the immediately previous answer where alternatives exist.
- Not maintain a complete used-word history.

The game engine should not know whether an answer came from JSON, a future pass-and-play entry, or a remote player.

## Keyboard architecture
`GameKeyboard` owns the QWERTY layout and maps letters to key state.

`LetterKey` is a presentation-focused reusable component. It receives information such as:
- Letter
- Visual/status state
- Disabled state
- Press callback

`LetterKey` must not implement Hangman game rules.

Physical keyboard input should call the same guess action used by the on-screen keyboard rather than implementing a second gameplay path.

## Hangman SVG
Implement the drawing as React-rendered SVG.

The component receives the number of incorrect guesses and conditionally renders body parts according to the six-step sequence.

Keep drawing concerns separate from game-rule concerns: the drawing should not determine whether a player has lost.

## State lifecycle
The current game exists only while the user remains in the active game experience.

Although browser storage may be used for small non-game preferences later, V1 should not resume an abandoned game after the user intentionally returns Home/leaves the game.

If localStorage is used internally for resilience to an accidental browser refresh, it must be cleared when the user intentionally leaves/ends the game, so it does not conflict with the product rule that leaving ends the current game.

## Styling
Use CSS Modules for component-specific styles and CSS custom properties for shared design tokens such as:
- Spacing
- Typography
- Border radii
- Key sizing
- Surface/background colors
- Positive/correct state
- Negative/incorrect state

Do not introduce Tailwind for V1.

Use responsive CSS rather than JavaScript viewport branching whenever practical.

## Viewport strategy
The gameplay shell should use the modern dynamic viewport (`dvh`) appropriately so mobile browser chrome does not create unnecessary scrolling.

The layout should prioritize vertical space approximately as:
1. Compact navigation/status
2. Scalable Hangman drawing
3. Answer area
4. Keyboard with protected minimum tap-target sizing

The drawing is the first major element allowed to shrink when vertical space becomes constrained.

## Accessibility
At minimum:
- Use semantic `<button>` elements for interactive keys and controls.
- Provide visible keyboard focus states.
- Make the app playable by physical keyboard on desktop.
- Ensure disabled keys are programmatically disabled.
- Do not communicate correct/incorrect state using color alone.
- Respect `prefers-reduced-motion` for confetti/animations.
- Provide accessible labels where visual content alone is insufficient.

## Testing strategy
### Unit tests — Vitest
Thoroughly test pure gameplay behavior including:
- Correct guess
- Incorrect guess
- Duplicate correct guess
- Duplicate incorrect guess
- Case-insensitive input
- Multiple occurrences of a letter
- Spaces
- Apostrophes
- Hyphens
- Punctuation
- Win detection
- Loss exactly on sixth incorrect guess
- Drawing-stage derivation
- Random word selection behavior
- Immediate-repeat avoidance

### Component tests — React Testing Library
Test important UI behavior such as:
- Keyboard rendering
- Correct/incorrect/disabled key states
- Answer masking/revealing
- New Game confirmation behavior
- Win/loss presentation where appropriate

### End-to-end — Playwright
Maintain an end-to-end suite that can be run at any time after development changes to validate real gameplay.

Cover at least:
- Home → Play → active game
- Complete winning game
- Complete losing game with six incorrect guesses
- Correct key becomes positive and disabled
- Incorrect key becomes negative and disabled
- Repeated letters reveal all matching positions
- Spaces/punctuation are automatically shown
- New Game → No preserves current game
- New Game → Yes starts a fresh game
- Home ends current game
- Play Again starts another game
- Desktop physical keyboard input
- Win confetti state (behavioral assertion, not fragile pixel matching)
- Loss overlay and answer reveal

Tests should be deterministic. Provide a test seam/injection mechanism for choosing known answers rather than relying on production randomness during E2E tests.

## Future multiplayer compatibility
Do not build multiplayer in V1, but avoid coupling the game engine to local random word selection.

Future modes may provide answers/state from:
- Pass-and-play secret-word entry
- Firebase/remote game session

The pure Hangman engine should remain reusable in all modes.
