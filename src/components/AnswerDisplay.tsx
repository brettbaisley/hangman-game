import { revealedCharacters } from '../game/hangmanGame'
import styles from './AnswerDisplay.module.css'
type Props = { answer: string; guessedLetters: readonly string[]; revealAll: boolean }
export function AnswerDisplay({ answer, guessedLetters, revealAll }: Props) {
  const characters = revealedCharacters(answer, guessedLetters, revealAll)
  const words: typeof characters[] = [[]]
  characters.forEach((character) => { if (character.char === ' ') words.push([]); else words.at(-1)?.push(character) })
  return <section className={styles.answer} aria-label="Word to guess"><p className={styles.label}>Find the word</p><div className={styles.words}>{words.map((word, index) => <span className={styles.word} key={index}>{word.map((character, characterIndex) => character.isLetter ? <span className={styles.slot} key={characterIndex}><span>{character.isRevealed ? character.char.toUpperCase() : ''}</span></span> : <span className={styles.punctuation} key={characterIndex}>{character.char}</span>)}</span>)}</div></section>
}
