export const MAX_INCORRECT_GUESSES = 6
export type GameStatus = 'playing' | 'won' | 'lost'
export interface HangmanGameState { answer: string; guessedLetters: string[]; incorrectGuesses: number; status: GameStatus }
export type RevealedCharacter = { char: string; isLetter: boolean; isRevealed: boolean }

export function normalizeLetter(value: string): string | null {
  const letter = value.trim().charAt(0).toLowerCase()
  return /^[a-z]$/.test(letter) ? letter : null
}
export function answerLetters(answer: string) { return new Set([...answer].map(normalizeLetter).filter((letter): letter is string => letter !== null)) }
export function createGame(answer: string): HangmanGameState { return { answer, guessedLetters: [], incorrectGuesses: 0, status: 'playing' } }
export function revealedCharacters(answer: string, guessedLetters: Iterable<string>, revealAll = false): RevealedCharacter[] {
  const used = new Set(guessedLetters)
  return [...answer].map((char) => { const letter = normalizeLetter(char); return { char, isLetter: !!letter, isRevealed: !letter || revealAll || used.has(letter) } })
}
export function guess(state: HangmanGameState, rawLetter: string): HangmanGameState {
  const letter = normalizeLetter(rawLetter)
  if (!letter || state.status !== 'playing' || state.guessedLetters.includes(letter)) return state
  const guessedLetters = [...state.guessedLetters, letter]
  const incorrectGuesses = state.incorrectGuesses + (answerLetters(state.answer).has(letter) ? 0 : 1)
  const letters = answerLetters(state.answer)
  const status: GameStatus = incorrectGuesses >= MAX_INCORRECT_GUESSES ? 'lost' : [...letters].every((item) => guessedLetters.includes(item)) ? 'won' : 'playing'
  return { ...state, guessedLetters, incorrectGuesses, status }
}
