import { useCallback, useMemo, useState } from 'react'
import {
  MAX_INCORRECT_GUESSES,
  buildRevealedCharacters,
  extractDistinctLetters,
  toLetterOrNull,
  type GameStatus,
} from '../lib/hangman'

export function useHangmanGame(secretWord: string) {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [incorrectGuesses, setIncorrectGuesses] = useState(0)

  const lettersToGuess = useMemo(
    () => extractDistinctLetters(secretWord),
    [secretWord],
  )

  const guessedLetterSet = useMemo(() => {
    return new Set(guessedLetters)
  }, [guessedLetters])

  const status = useMemo<GameStatus>(() => {
    if (incorrectGuesses >= MAX_INCORRECT_GUESSES) {
      return 'lost'
    }

    for (const letter of lettersToGuess) {
      if (!guessedLetterSet.has(letter)) {
        return 'playing'
      }
    }

    return 'won'
  }, [guessedLetterSet, incorrectGuesses, lettersToGuess])

  const revealedCharacters = useMemo(() => {
    return buildRevealedCharacters(secretWord, guessedLetterSet)
  }, [guessedLetterSet, secretWord])

  const remainingGuesses = Math.max(MAX_INCORRECT_GUESSES - incorrectGuesses, 0)

  const guessLetter = useCallback(
    (rawLetter: string) => {
      if (status !== 'playing') {
        return
      }

      const letter = toLetterOrNull(rawLetter)
      if (!letter || guessedLetterSet.has(letter)) {
        return
      }

      setGuessedLetters((previous) => [...previous, letter])
      if (!lettersToGuess.has(letter)) {
        setIncorrectGuesses((previous) => previous + 1)
      }
    },
    [guessedLetterSet, lettersToGuess, status],
  )

  const resetGame = useCallback(() => {
    setGuessedLetters([])
    setIncorrectGuesses(0)
  }, [])

  return {
    guessedLetterSet,
    guessedLetters,
    guessLetter,
    incorrectGuesses,
    remainingGuesses,
    resetGame,
    revealedCharacters,
    status,
  }
}
