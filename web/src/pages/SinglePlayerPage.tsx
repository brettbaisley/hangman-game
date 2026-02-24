import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { startSinglePlayer, submitSinglePlayerGuess } from '../api'
import type { RoundState } from '../api'

function SinglePlayerPage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [state, setState] = useState<RoundState | null>(null)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canGuess = Boolean(sessionId && state?.status === 'in_progress' && guess.trim().length === 1)

  const statusLabel = useMemo(() => {
    if (!state) return 'No active round'
    if (state.status === 'won') return 'You won this round.'
    if (state.status === 'lost') return 'You lost this round.'
    return 'Round in progress'
  }, [state])

  async function onStartRound() {
    setIsLoading(true)
    setError(null)
    setFeedback(null)
    setGuess('')

    try {
      const response = await startSinglePlayer(difficulty)
      setSessionId(response.sessionId)
      setState(response.state)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to start round')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmitGuess(event: FormEvent) {
    event.preventDefault()
    if (!sessionId || !canGuess) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await submitSinglePlayerGuess(sessionId, guess)
      setState(response.state)
      setGuess('')
      setFeedback(`Guess '${response.letter}': ${response.code}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to submit guess')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <h1>Single-Player Game</h1>
          <Link to="/" className="nav-link-button">
            Back to Home
          </Link>
        </div>

        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
          disabled={isLoading}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button type="button" onClick={onStartRound} disabled={isLoading}>
          {isLoading ? 'Working...' : 'Start Single-Player Round'}
        </button>
      </section>

      <section className="panel">
        <h2>Round State</h2>
        <p className="word">{state?.maskedWord ?? '_ _ _ _ _'}</p>
        <p>{statusLabel}</p>
        <p>Attempts left: {state?.attemptsLeft ?? '-'}</p>
        <p>Guessed letters: {state?.guessedLetters.join(', ') || '-'}</p>
      </section>

      <section className="panel">
        <h2>Submit Guess</h2>
        <form onSubmit={onSubmitGuess} className="guess-form">
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value.toLowerCase().slice(0, 1))}
            maxLength={1}
            inputMode="text"
            placeholder="a-z"
            disabled={isLoading || !sessionId || state?.status !== 'in_progress'}
          />
          <button type="submit" disabled={!canGuess || isLoading}>
            Guess
          </button>
        </form>
        {feedback ? <p>{feedback}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  )
}

export default SinglePlayerPage
