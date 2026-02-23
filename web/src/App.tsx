import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import {
  createMultiplayerMatch,
  getMultiplayerState,
  joinMultiplayerMatch,
  startSinglePlayer,
  submitMultiplayerGuess,
  submitSinglePlayerGuess,
} from './api'
import type { MultiplayerPublicState, RoundState } from './api'

function App() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [state, setState] = useState<RoundState | null>(null)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [multiplayerPlayerId, setMultiplayerPlayerId] = useState('player-1')
  const [multiplayerMatchIdInput, setMultiplayerMatchIdInput] = useState('')
  const [multiplayerMatchId, setMultiplayerMatchId] = useState<string | null>(null)
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerPublicState | null>(null)
  const [multiplayerGuess, setMultiplayerGuess] = useState('')
  const [multiplayerFeedback, setMultiplayerFeedback] = useState<string | null>(null)
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null)
  const [isMultiplayerLoading, setIsMultiplayerLoading] = useState(false)

  const canSubmitMultiplayerGuess =
    Boolean(multiplayerMatchId) &&
    multiplayerGuess.trim().length === 1 &&
    multiplayerState?.status === 'in_progress' &&
    multiplayerState.self.status === 'in_progress'

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

  async function onCreateMultiplayerMatch() {
    setIsMultiplayerLoading(true)
    setMultiplayerError(null)
    setMultiplayerFeedback(null)

    try {
      const response = await createMultiplayerMatch(multiplayerPlayerId.trim(), difficulty)
      setMultiplayerMatchId(response.matchId)
      setMultiplayerMatchIdInput(response.matchId)
      setMultiplayerState(response.state)
      setMultiplayerGuess('')
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to create match')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  async function onJoinMultiplayerMatch() {
    setIsMultiplayerLoading(true)
    setMultiplayerError(null)
    setMultiplayerFeedback(null)

    try {
      const response = await joinMultiplayerMatch(multiplayerMatchIdInput.trim(), multiplayerPlayerId.trim())
      setMultiplayerMatchId(response.matchId)
      setMultiplayerState(response.state)
      setMultiplayerGuess('')
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to join match')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  async function onRefreshMultiplayerState() {
    if (!multiplayerMatchId || !multiplayerPlayerId.trim()) {
      return
    }

    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const response = await getMultiplayerState(multiplayerMatchId, multiplayerPlayerId.trim())
      setMultiplayerState(response.state)
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to refresh state')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  async function onSubmitMultiplayerGuess(event: FormEvent) {
    event.preventDefault()
    if (!multiplayerMatchId || !multiplayerPlayerId.trim() || multiplayerGuess.trim().length !== 1) {
      return
    }

    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const response = await submitMultiplayerGuess(multiplayerMatchId, multiplayerPlayerId.trim(), multiplayerGuess)
      setMultiplayerState(response.state)
      setMultiplayerFeedback(`Guess '${response.letter}': ${response.code}`)
      setMultiplayerGuess('')
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to submit multiplayer guess')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <h1>Hangman Web</h1>

      <section className="panel">
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

      <section className="panel">
        <h2>Multiplayer (Scaffold)</h2>
        <div className="inline-controls">
          <input
            value={multiplayerPlayerId}
            onChange={(event) => setMultiplayerPlayerId(event.target.value)}
            placeholder="player id"
            disabled={isMultiplayerLoading}
          />
          <input
            value={multiplayerMatchIdInput}
            onChange={(event) => setMultiplayerMatchIdInput(event.target.value)}
            placeholder="match id"
            disabled={isMultiplayerLoading}
          />
        </div>
        <div className="inline-controls">
          <button type="button" onClick={onCreateMultiplayerMatch} disabled={isMultiplayerLoading}>
            Create Match
          </button>
          <button type="button" onClick={onJoinMultiplayerMatch} disabled={isMultiplayerLoading || !multiplayerMatchIdInput.trim()}>
            Join Match
          </button>
          <button type="button" onClick={onRefreshMultiplayerState} disabled={isMultiplayerLoading || !multiplayerMatchId}>
            Refresh State
          </button>
        </div>

        <p>Active match: {multiplayerMatchId ?? '-'}</p>
        <p>Status: {multiplayerState?.status ?? '-'}</p>
        <p>Seconds remaining: {multiplayerState?.secondsRemaining ?? '-'}</p>
        <p>Your word: {multiplayerState?.self.maskedWord ?? '_ _ _ _ _'}</p>
        <p>Your attempts left: {multiplayerState?.self.attemptsLeft ?? '-'}</p>
        <p>Your guesses: {multiplayerState?.self.guessedLetters.join(', ') || '-'}</p>
        <p>
          Opponent: {multiplayerState?.opponent ? `${multiplayerState.opponent.playerId} (${multiplayerState.opponent.status})` : 'waiting'}
        </p>
        <p>
          Opponent attempts left: {multiplayerState?.opponent?.attemptsLeft ?? '-'}
        </p>
        {multiplayerState?.status === 'waiting_for_opponent' ? (
          <p>Match is waiting for opponent. Join the same match ID from another player before guessing.</p>
        ) : null}
        <p>
          Result:{' '}
          {multiplayerState?.result
            ? multiplayerState.result.isDraw
              ? `Draw (${multiplayerState.result.reason})`
              : `Winner ${multiplayerState.result.winnerPlayerId} (${multiplayerState.result.reason})`
            : '-'}
        </p>

        <form onSubmit={onSubmitMultiplayerGuess} className="guess-form">
          <input
            value={multiplayerGuess}
            onChange={(event) => setMultiplayerGuess(event.target.value.toLowerCase().slice(0, 1))}
            maxLength={1}
            inputMode="text"
            placeholder="a-z"
            disabled={isMultiplayerLoading || !multiplayerMatchId || multiplayerState?.status !== 'in_progress'}
          />
          <button type="submit" disabled={isMultiplayerLoading || !canSubmitMultiplayerGuess}>
            Multiplayer Guess
          </button>
        </form>

        {multiplayerFeedback ? <p>{multiplayerFeedback}</p> : null}
        {multiplayerError ? <p className="error">{multiplayerError}</p> : null}
      </section>
    </main>
  )
}

export default App
