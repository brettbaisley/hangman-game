import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getMultiplayerState, submitMultiplayerGuess } from '../api'
import type { MultiplayerPublicState } from '../api'

function MultiplayerMatchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('matchId')?.trim() ?? ''
  const playerId = searchParams.get('playerId')?.trim() ?? ''

  const [multiplayerState, setMultiplayerState] = useState<MultiplayerPublicState | null>(null)
  const [multiplayerGuess, setMultiplayerGuess] = useState('')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [multiplayerFeedback, setMultiplayerFeedback] = useState<string | null>(null)
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null)
  const [isMultiplayerLoading, setIsMultiplayerLoading] = useState(false)

  const canSubmitMultiplayerGuess =
    Boolean(matchId) &&
    multiplayerGuess.trim().length === 1 &&
    multiplayerState?.status === 'in_progress' &&
    multiplayerState.self.status === 'in_progress'

  function navigateToMultiplayerResult(state: MultiplayerPublicState) {
    navigate('/result', {
      state: {
        mode: 'multiplayer',
        result: state.result ?? null,
        selfStatus: state.self.status,
        opponentStatus: state.opponent?.status ?? null,
      },
    })
  }

  async function onCopyMatchId() {
    if (!matchId) return

    try {
      await navigator.clipboard.writeText(matchId)
      setCopyFeedback('Match ID copied.')
    } catch {
      setCopyFeedback('Unable to copy match ID.')
    }
  }

  async function onRefreshMultiplayerState() {
    if (!matchId || !playerId) {
      return
    }

    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const response = await getMultiplayerState(matchId, playerId)
      setMultiplayerState(response.state)

      if (response.state.status === 'ended') {
        navigateToMultiplayerResult(response.state)
      }
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to refresh state')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  async function onSubmitMultiplayerGuess(event: FormEvent) {
    event.preventDefault()
    if (!matchId || !playerId || multiplayerGuess.trim().length !== 1) {
      return
    }

    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const response = await submitMultiplayerGuess(matchId, playerId, multiplayerGuess)
      setMultiplayerState(response.state)
      setMultiplayerFeedback(`Guess '${response.letter}': ${response.code}`)
      setMultiplayerGuess('')

      if (response.state.status === 'ended') {
        navigateToMultiplayerResult(response.state)
      }
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to submit multiplayer guess')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  useEffect(() => {
    void onRefreshMultiplayerState()
  }, [])

  if (!matchId || !playerId) {
    return (
      <main className="app-shell">
        <section className="panel">
          <h1>Multiplayer Match</h1>
          <p>Missing match details. Return to the lobby and join or create a match.</p>
          <Link to="/multiplayer/lobby" className="nav-link-button">
            Go to Lobby
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <h1>Multiplayer Match</h1>
          <div className="inline-controls">
            <Link to={`/multiplayer/lobby?playerId=${encodeURIComponent(playerId)}`} className="nav-link-button">
              Back to Lobby
            </Link>
            <Link to="/" className="nav-link-button">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="inline-controls">
          <button type="button" onClick={onRefreshMultiplayerState} disabled={isMultiplayerLoading}>
            Refresh State
          </button>
          <button type="button" onClick={onCopyMatchId}>
            Copy Match ID
          </button>
        </div>

        <p>Active match: {matchId}</p>
        <p>Status: {multiplayerState?.status ?? '-'}</p>
        <p>Seconds remaining: {multiplayerState?.secondsRemaining ?? '-'}</p>
        <p>Your word: {multiplayerState?.self.maskedWord ?? '_ _ _ _ _'}</p>
        <p>Your attempts left: {multiplayerState?.self.attemptsLeft ?? '-'}</p>
        <p>Your guesses: {multiplayerState?.self.guessedLetters.join(', ') || '-'}</p>
        <p>
          Opponent: {multiplayerState?.opponent ? `${multiplayerState.opponent.playerId} (${multiplayerState.opponent.status})` : 'waiting'}
        </p>
        <p>Opponent attempts left: {multiplayerState?.opponent?.attemptsLeft ?? '-'}</p>
        {multiplayerState?.status === 'waiting_for_opponent' ? (
          <p>Match is waiting for opponent. Share this match ID and refresh after they join.</p>
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
            disabled={isMultiplayerLoading || multiplayerState?.status !== 'in_progress'}
          />
          <button type="submit" disabled={isMultiplayerLoading || !canSubmitMultiplayerGuess}>
            Multiplayer Guess
          </button>
        </form>

        {multiplayerState?.status === 'ended' ? (
          <button type="button" onClick={() => multiplayerState && navigateToMultiplayerResult(multiplayerState)}>
            View Result
          </button>
        ) : null}

        {copyFeedback ? <p>{copyFeedback}</p> : null}
        {multiplayerFeedback ? <p>{multiplayerFeedback}</p> : null}
        {multiplayerError ? <p className="error">{multiplayerError}</p> : null}
      </section>
    </main>
  )
}

export default MultiplayerMatchPage
