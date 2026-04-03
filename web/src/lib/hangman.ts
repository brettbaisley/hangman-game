export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
export const MAX_INCORRECT_GUESSES = 6

const LETTER_REGEX = /[a-z]/i
const SECRET_WORD_ALLOWED_CHARS_REGEX = /[^A-Za-z ]+/g
const SECRET_WORD_VALIDATION_REGEX = /^(?=.*[A-Za-z])[A-Za-z ]+$/

export type GameStatus = 'playing' | 'won' | 'lost'

export type RevealedCharacter = {
  char: string
  isLetter: boolean
  isRevealed: boolean
}

export function toLetterOrNull(value: string): string | null {
  const firstCharacter = value.trim().charAt(0)
  if (!LETTER_REGEX.test(firstCharacter)) {
    return null
  }

  return firstCharacter.toLowerCase()
}

export function extractDistinctLetters(secretWord: string): Set<string> {
  const letters = new Set<string>()
  for (const char of secretWord) {
    const normalized = toLetterOrNull(char)
    if (normalized) {
      letters.add(normalized)
    }
  }

  return letters
}

export function hasGuessableLetters(secretWord: string): boolean {
  return extractDistinctLetters(secretWord).size > 0
}

export function sanitizeSecretWordInput(value: string): string {
  return value.replace(SECRET_WORD_ALLOWED_CHARS_REGEX, '')
}

export function isValidSecretWord(secretWord: string): boolean {
  return SECRET_WORD_VALIDATION_REGEX.test(secretWord)
}

export function buildRevealedCharacters(
  secretWord: string,
  guessedLetters: Set<string>,
): RevealedCharacter[] {
  return [...secretWord].map((char) => {
    const normalized = toLetterOrNull(char)
    if (!normalized) {
      return {
        char,
        isLetter: false,
        isRevealed: true,
      }
    }

    return {
      char,
      isLetter: true,
      isRevealed: guessedLetters.has(normalized),
    }
  })
}
