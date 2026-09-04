import { normalizeLetter } from '../game/hangmanGame'
import { LetterKey } from './LetterKey'
import styles from './GameKeyboard.module.css'
const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
type Props = { guessedLetters: readonly string[]; answer: string; disabled: boolean; onGuess: (letter: string) => void }
export function GameKeyboard({ guessedLetters, answer, disabled, onGuess }: Props) {
  const answerLetters = new Set([...answer].map(normalizeLetter).filter((letter): letter is string => letter !== null))
  return <section className={styles.keyboard} aria-label="Letter keyboard">{rows.map((row) => <div className={styles.row} key={row}>{[...row].map((letter) => { const used = guessedLetters.includes(letter.toLowerCase()); return <LetterKey key={letter} letter={letter} state={!used ? 'available' : answerLetters.has(letter.toLowerCase()) ? 'correct' : 'incorrect'} disabled={disabled || used} onPress={onGuess} /> })}</div>)}</section>
}
