import { useEffect, useMemo, useState } from 'react'
import { AlphabetGrid } from './components/AlphabetGrid'
import { GameOverModal } from './components/GameOverModal'
import { HangmanDrawing } from './components/HangmanDrawing'
import { SecretWordForm } from './components/SecretWordForm'
import { WordDisplay } from './components/WordDisplay'
import { useHangmanGame } from './hooks/useHangmanGame'
import { toLetterOrNull } from './lib/hangman'

function App() {
  const [secretWord, setSecretWord] = useState('')
  const {
    guessLetter,
    guessedLetterSet,
    guessedLetters,
    incorrectGuesses,
    remainingGuesses,
    resetGame,
    revealedCharacters,
    status,
  } = useHangmanGame(secretWord)

  const roundStarted = secretWord.length > 0
  const gameOver = roundStarted && status !== 'playing'
  const latestGuessedLetter = guessedLetters[guessedLetters.length - 1] ?? null

  const statusMessage = useMemo(() => {
    if (!roundStarted) {
      return 'Enter a secret word to begin.'
    }

    if (status === 'won') {
      return 'Round complete. The guesser won.'
    }

    if (status === 'lost') {
      return 'Round complete. The guesser lost.'
    }

    return `Round active. ${remainingGuesses} misses remaining.`
  }, [remainingGuesses, roundStarted, status])

  useEffect(() => {
    if (!roundStarted || gameOver) {
      return
    }

    function handleKeyboardGuess(event: KeyboardEvent) {
      const letter = toLetterOrNull(event.key)
      if (!letter) {
        return
      }

      event.preventDefault()
      guessLetter(letter)
    }

    window.addEventListener('keydown', handleKeyboardGuess)
    return () => {
      window.removeEventListener('keydown', handleKeyboardGuess)
    }
  }, [gameOver, guessLetter, roundStarted])

  function handleStartRound(nextSecretWord: string) {
    resetGame()
    setSecretWord(nextSecretWord)
  }

  function handlePlayAgain() {
    resetGame()
    setSecretWord('')
  }

  return (
    <main className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />

      {!roundStarted ? (
        <SecretWordForm onStart={handleStartRound} />
      ) : (
        <section className="game-layout">
          <header className="game-header">
            <h1 className="title">Neon Gallows</h1>
            <p className="subtitle">Guess the hidden letters before six misses.</p>
          </header>

          <div className="stats-strip" aria-live="polite">
            <p className="stat-pill">Letters used: {guessedLetters.length}</p>
            <p className="stat-pill">Incorrect guesses: {incorrectGuesses}/6</p>
            <p className="stat-pill">Misses remaining: {remainingGuesses}</p>
          </div>

          <WordDisplay characters={revealedCharacters} latestGuessedLetter={latestGuessedLetter} />

          <div className="board-grid">
            <HangmanDrawing misses={incorrectGuesses} />
            <AlphabetGrid
              guessedLetters={guessedLetterSet}
              latestGuessedLetter={latestGuessedLetter}
              onGuess={guessLetter}
              disabled={gameOver}
            />
          </div>

          <p className="sr-only" aria-live="polite">
            {statusMessage}
          </p>
        </section>
      )}

      {gameOver && (
        <GameOverModal
          status={status}
          secretWord={secretWord}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </main>
  )
}

export default App
