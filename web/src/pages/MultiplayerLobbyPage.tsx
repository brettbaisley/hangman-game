import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createMultiplayerMatch, joinMultiplayerMatch } from '../api'
import type { MultiplayerPublicState } from '../api'

interface MultiplayerLobbyPageProps {
  defaultPlayerId: string
}

function MultiplayerLobbyPage({ defaultPlayerId }: MultiplayerLobbyPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryPlayerId = searchParams.get('playerId')

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [multiplayerPlayerId, setMultiplayerPlayerId] = useState(queryPlayerId?.trim() || defaultPlayerId)
  const [multiplayerMatchIdInput, setMultiplayerMatchIdInput] = useState('')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null)
  const [isMultiplayerLoading, setIsMultiplayerLoading] = useState(false)

  async function onCopyMatchId() {
    const matchId = multiplayerMatchIdInput.trim()
    if (!matchId) return

    try {
      await navigator.clipboard.writeText(matchId)
      setCopyFeedback('Match ID copied.')
    } catch {
      setCopyFeedback('Unable to copy match ID.')
    }
  }

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

  function openMatch(matchId: string, playerId: string) {
    const params = new URLSearchParams({
      matchId,
      playerId,
    })
    navigate(`/multiplayer/match?${params.toString()}`)
  }

  async function onCreateMultiplayerMatch() {
    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const playerId = multiplayerPlayerId.trim()
      const response = await createMultiplayerMatch(playerId, difficulty)

      if (response.state.status === 'ended') {
        navigateToMultiplayerResult(response.state)
        return
      }

      openMatch(response.matchId, playerId)
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to create match')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  async function onJoinMultiplayerMatch() {
    setIsMultiplayerLoading(true)
    setMultiplayerError(null)

    try {
      const playerId = multiplayerPlayerId.trim()
      const response = await joinMultiplayerMatch(multiplayerMatchIdInput.trim(), playerId)

      if (response.state.status === 'ended') {
        navigateToMultiplayerResult(response.state)
        return
      }

      openMatch(response.matchId, playerId)
    } catch (requestError) {
      setMultiplayerError(requestError instanceof Error ? requestError.message : 'Failed to join match')
    } finally {
      setIsMultiplayerLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <h1>Multiplayer Lobby</h1>
          <Link to="/" className="nav-link-button">
            Back to Home
          </Link>
        </div>

        <p>Create a new match or enter a match ID to join an existing one.</p>

        <label htmlFor="multiplayer-difficulty">Difficulty</label>
        <select
          id="multiplayer-difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
          disabled={isMultiplayerLoading}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

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
          <button type="button" onClick={onCopyMatchId} disabled={!multiplayerMatchIdInput.trim()}>
            Copy Match ID
          </button>
        </div>

        <div className="inline-controls">
          <button type="button" onClick={onCreateMultiplayerMatch} disabled={isMultiplayerLoading || !multiplayerPlayerId.trim()}>
            Create Match
          </button>
          <button
            type="button"
            onClick={onJoinMultiplayerMatch}
            disabled={isMultiplayerLoading || !multiplayerPlayerId.trim() || !multiplayerMatchIdInput.trim()}
          >
            Join Match
          </button>
        </div>

        {copyFeedback ? <p>{copyFeedback}</p> : null}
        {multiplayerError ? <p className="error">{multiplayerError}</p> : null}
      </section>
    </main>
  )
}

export default MultiplayerLobbyPage
