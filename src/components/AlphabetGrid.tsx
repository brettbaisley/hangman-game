import { ALPHABET } from '../lib/hangman'

type AlphabetGridProps = {
  guessedLetters: Set<string>
  latestGuessedLetter: string | null
  onGuess: (letter: string) => void
  disabled: boolean
}

export function AlphabetGrid({ guessedLetters, latestGuessedLetter, onGuess, disabled }: AlphabetGridProps) {
  return (
    <section className="panel" aria-label="Alphabet keypad">
      <h2 className="panel-title">Alphabet</h2>
      <div className="alphabet-grid">
        {ALPHABET.map((letter) => {
          const normalizedLetter = letter.toLowerCase()
          const alreadyUsed = guessedLetters.has(normalizedLetter)
          const isLatestGuess = latestGuessedLetter === normalizedLetter

          return (
            <button
              key={letter}
              className={`letter-key ${alreadyUsed ? 'is-used' : ''} ${isLatestGuess ? 'is-just-used' : ''}`}
              type="button"
              disabled={alreadyUsed || disabled}
              aria-label={`Guess letter ${letter}`}
              onClick={() => onGuess(letter)}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </section>
  )
}
