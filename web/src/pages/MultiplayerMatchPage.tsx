import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getMultiplayerState, negotiateMultiplayerConnection, sendMultiplayerSignalRTest, submitMultiplayerGuess } from '../api'
import type { MultiplayerPublicState } from '../api'

interface MultiplayerGuessSignalREvent {
  matchId: string
  playerId: string
  letter: string
  code: 'correct' | 'wrong' | 'duplicate' | 'invalid'
  status: 'waiting_for_opponent' | 'in_progress' | 'ended'
}

interface MultiplayerSignalRTestEvent {
  matchId: string
  sentAt: string
}

type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

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
  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null)
  const [realtimeTestStatus, setRealtimeTestStatus] = useState<string | null>(null)
  const [realtimeConnectionState, setRealtimeConnectionState] = useState<RealtimeConnectionState>('connecting')
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

  async function onSendRealtimeTestEvent() {
    try {
      await sendMultiplayerSignalRTest(matchId)
      setRealtimeTestStatus('Realtime test event sent. Waiting for receipt...')
    } catch (requestError) {
      setRealtimeTestStatus(requestError instanceof Error ? `Realtime test failed: ${requestError.message}` : 'Realtime test failed')
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

  useEffect(() => {
    if (!matchId || !playerId) {
      return
    }

    setRealtimeConnectionState('connecting')
    let isActive = true
    let cleanup: (() => Promise<void>) | undefined

    async function startSignalR() {
      try {
        const connectionInfo = await negotiateMultiplayerConnection(playerId)
        if (!isActive) {
          return
        }

        const connection = new HubConnectionBuilder()
          .withUrl(connectionInfo.url, {
            accessTokenFactory: () => connectionInfo.accessToken,
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Warning)
          .build()

        connection.onreconnecting(() => {
          setRealtimeConnectionState('reconnecting')
          setRealtimeStatus('Reconnecting real-time updates...')
        })

        connection.onreconnected(() => {
          setRealtimeConnectionState('connected')
          setRealtimeStatus('Real-time match updates connected.')
        })

        connection.onclose(() => {
          setRealtimeConnectionState('disconnected')
          setRealtimeStatus('Real-time updates disconnected. Use Refresh State.')
        })

        const onGuessSubmitted = (event: MultiplayerGuessSignalREvent) => {
          if (event.matchId !== matchId || event.playerId === playerId) {
            return
          }

          setRealtimeStatus(`Opponent guessed '${event.letter}' (${event.code}). Refreshing state...`)
          void onRefreshMultiplayerState()
        }

        const onSignalRTest = (event: MultiplayerSignalRTestEvent) => {
          if (event.matchId !== matchId) {
            return
          }

          setRealtimeTestStatus(`Realtime test event received at ${new Date().toLocaleTimeString()}.`)
        }

        connection.on('multiplayerGuessSubmitted', onGuessSubmitted)
        connection.on('multiplayerSignalRTest', onSignalRTest)
        const detachHandler = () => {
          connection.off('multiplayerGuessSubmitted', onGuessSubmitted)
          connection.off('multiplayerSignalRTest', onSignalRTest)
        }

        await connection.start()
        if (!isActive) {
          detachHandler()
          await connection.stop()
          return
        }

        setRealtimeConnectionState('connected')
        setRealtimeStatus('Real-time match updates connected.')

        cleanup = async () => {
          detachHandler()
          await connection.stop()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error'
        if (isActive) {
          setRealtimeConnectionState('disconnected')
          setRealtimeStatus(`Real-time updates unavailable (${message}). Use Refresh State.`)
        }
      }
    }

    void startSignalR()

    return () => {
      isActive = false
      if (cleanup) {
        void cleanup()
      }
    }
  }, [matchId, playerId])

  function realtimeStatusLabel() {
    if (realtimeConnectionState === 'connected') return 'Connected'
    if (realtimeConnectionState === 'reconnecting') return 'Reconnecting'
    if (realtimeConnectionState === 'disconnected') return 'Disconnected'
    return 'Connecting'
  }

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
          <div className="header-with-badge">
            <h1>Multiplayer Match</h1>
            <span className={`status-badge status-badge-${realtimeConnectionState}`}>Realtime: {realtimeStatusLabel()}</span>
          </div>
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
          <button type="button" onClick={onSendRealtimeTestEvent}>
            Send Realtime Test Event
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

        {realtimeStatus ? <p>{realtimeStatus}</p> : null}
        {realtimeTestStatus ? <p>{realtimeTestStatus}</p> : null}
        {copyFeedback ? <p>{copyFeedback}</p> : null}
        {multiplayerFeedback ? <p>{multiplayerFeedback}</p> : null}
        {multiplayerError ? <p className="error">{multiplayerError}</p> : null}
      </section>
    </main>
  )
}

export default MultiplayerMatchPage
