import { toLetterOrNull, type RevealedCharacter } from '../lib/hangman'

type WordDisplayProps = {
  characters: RevealedCharacter[]
  latestGuessedLetter: string | null
}

export function WordDisplay({ characters, latestGuessedLetter }: WordDisplayProps) {
  let revealIndex = 0

  return (
    <section className="word-section" aria-label="Word to guess">
      <h2 className="panel-title">Word to guess</h2>
      <div className="word-display">
        {characters.map((character, index) => {
          if (!character.isLetter) {
            return (
              <span key={`${character.char}-${index}`} className="word-gap" aria-hidden="true">
                {character.char === ' ' ? ' ' : character.char}
              </span>
            )
          }

          const isNewlyRevealed =
            character.isRevealed && latestGuessedLetter !== null && toLetterOrNull(character.char) === latestGuessedLetter
          const revealDelay = revealIndex * 90

          if (isNewlyRevealed) {
            revealIndex += 1
          }

          return (
            <span key={`${character.char}-${index}`} className="letter-slot">
              <span
                className={`${character.isRevealed ? 'letter-visible' : 'letter-hidden'} ${isNewlyRevealed ? 'letter-typed-in' : ''}`}
                style={isNewlyRevealed ? { animationDelay: `${revealDelay}ms` } : undefined}
              >
                {character.isRevealed ? character.char.toUpperCase() : ''}
              </span>
            </span>
          )
        })}
      </div>
    </section>
  )
}
