import styles from './LetterKey.module.css'
type Props = { letter: string; state: 'available' | 'correct' | 'incorrect'; disabled: boolean; onPress: (letter: string) => void }
export function LetterKey({ letter, state, disabled, onPress }: Props) { return <button className={`${styles.key} ${styles[state]}`} type="button" disabled={disabled} aria-label={state === 'available' ? `Guess ${letter}` : `${letter}: ${state}`} onClick={() => onPress(letter)}>{letter}{state !== 'available' && <span className={styles.status}>{state === 'correct' ? ' correct' : ' incorrect'}</span>}</button> }
