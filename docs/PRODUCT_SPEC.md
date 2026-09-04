# Hangman Game — V1 Product Specification

## Product goal
Create a simple, fun, family-friendly Hangman game designed mobile-first for children while remaining responsive and pleasant on tablets and desktop browsers.

V1 focuses exclusively on Single Player. Future versions may add same-device pass-and-play and remote multiplayer, but those features are out of scope for V1.

## V1 game flow
1. User opens the Home screen.
2. User presses **Play**.
3. The game randomly selects a curated word or phrase.
4. User guesses letters with the custom on-screen QWERTY keyboard or, on desktop, a physical keyboard.
5. Correct guesses reveal every matching occurrence of the letter.
6. Incorrect guesses add the next element to the Hangman drawing.
7. The user wins by revealing every letter before six incorrect guesses.
8. The user loses on the sixth incorrect guess.
9. The end state provides a prominent **Play Again** action.

There are no categories, difficulty levels, clues, scores, streaks, profiles, or statistics in V1.

## Home screen
Keep the Home screen intentionally minimal:
- Hangman title/logo
- Large **Play** button

Settings and additional menus are deferred.

## Gameplay screen
The game screen contains:
- Compact top bar
- **Home** control
- **New Game** control
- Responsive 2D SVG Hangman drawing
- Masked word/phrase
- Visible incorrect-guess count such as `3/6`
- Custom QWERTY keyboard fixed visually at the bottom of the gameplay layout

The complete gameplay experience must fit within the viewport without page scrolling on supported devices.

### Leaving a game
Going Home or otherwise leaving the game screen ends the current game. It is not resumed later.

### New Game
If a game is currently in progress, selecting New Game displays a confirmation:

**Start new game?**

Buttons:
- **Yes** — abandon the current game and immediately start another random game.
- **No** — dismiss and continue the current game.

## Answers
Answers come from a curated local JSON list and may contain words or phrases.

Rules:
- Letter guessing is case-insensitive.
- Only alphabetic letters are guessable.
- Spaces are always revealed.
- Apostrophes are always revealed.
- Hyphens are always revealed.
- Other supported punctuation should be treated as non-guessable and displayed rather than masked.
- A correct guess reveals all occurrences of that letter.
- Answers are displayed as individual letter slots.
- Multi-word phrases may wrap only between words; an individual word must never break across lines.
- Curated phrases should have a reasonable maximum length so gameplay remains usable within the no-scroll viewport.

## Word selection
Store curated answers in a JSON file such as `src/data/words.json`:

```json
{
  "entries": [
    "Elephant",
    "Baseball",
    "Roller Coaster",
    "Peanut Butter"
  ]
}
```

For each new game:
- Randomly select an entry.
- Avoid selecting the exact same entry as the immediately preceding game when the list contains alternatives.
- Do not attempt to exhaust/shuffle the entire pool before repeats are allowed.
- Preserve natural capitalization in source data; game comparisons normalize case.

## Gameplay keyboard
Gameplay uses a custom QWERTY alphabet keyboard rather than the operating system's text keyboard.

Layout:

```text
Q W E R T Y U I O P
 A S D F G H J K L
   Z X C V B N M
```

Each letter is implemented through a reusable `LetterKey`/`KeyboardKey` component.

Key states:
- **Available** — normal, enabled state.
- **Correct** — green/positive state and disabled.
- **Incorrect** — red/negative state and disabled.

A guessed key cannot be selected again. Correct/incorrect status must not rely on color alone for accessibility.

The native device keyboard is reserved for future text-entry tasks, not Hangman guesses.

On desktop, physical A–Z key presses trigger the same guess behavior and game logic as tapping an on-screen key.

## Hangman drawing
Use a simple, flat 2D SVG implementation in V1.

The gallows/base may be visible as the static starting state. The person is revealed after incorrect guesses in this sequence:

1. Head
2. Body
3. Left arm
4. Right arm
5. Left leg
6. Right leg

Six incorrect guesses results in the completed hanged figure and a loss.

## Win state
When the answer is completed:
- Mark the game as won.
- Briefly animate confetti falling across the screen.
- Keep the celebration quick and non-blocking.
- Provide a prominent **Play Again** action.

## Loss state
On the sixth incorrect guess:
- Render the final Hangman element.
- Reveal the complete answer in the underlying game board.
- Display a semi-transparent red overlay over the game.
- Prominently display **Game Over** on the overlay.
- Provide a prominent **Play Again** action.

## Visual direction
V1 visual language:
- Mobile-first
- Clean and minimal
- Fun and kid-friendly without becoming visually busy
- White/light base
- Colorful accents
- Light mode only for V1
- Simple 2D/SVG visuals

Complex 3D visuals and advanced illustration/animation are out of scope.

## Responsive requirements
Support modern phones, tablets, and desktops.

Gameplay is a no-scroll experience:
- Use the dynamic viewport height appropriately on mobile.
- Keep the complete QWERTY keyboard visible.
- Maintain comfortable tap targets.
- Allow the Hangman drawing to shrink before making keyboard controls uncomfortably small.
- Keep the top bar compact.
- Allow the answer area to wrap between words when necessary.
- Win/loss UI overlays the game instead of extending page height.
- Desktop may make better use of horizontal space while still fitting within one viewport.

## Supported platforms
Target current versions of:
- Safari on iPhone/iPad
- Chrome on Android
- Chrome desktop
- Edge desktop
- Firefox desktop

Legacy-browser support is not required.

## V1 non-goals
Do not include:
- Categories
- Difficulty levels
- Hints/clues
- Scores
- Streaks
- Player profiles
- Statistics
- Dark mode
- Sound as a required feature
- Pass-and-play multiplayer
- Remote multiplayer
- Server-side application logic
- Authentication
- Database-backed word lists
