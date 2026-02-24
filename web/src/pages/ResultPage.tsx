import { Link, useLocation } from 'react-router-dom'
import type { MultiplayerResult, RoundState } from '../api'

type ResultLocationState =
  | {
      mode: 'single'
      state: RoundState
    }
  | {
      mode: 'multiplayer'
      result: MultiplayerResult | null
      selfStatus: 'in_progress' | 'won' | 'lost'
      opponentStatus: 'in_progress' | 'won' | 'lost' | null
    }

function ResultPage() {
  const location = useLocation()
  const resultState = location.state as ResultLocationState | null

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <h1>Result</h1>
          <Link to="/" className="nav-link-button">
            Back to Home
          </Link>
        </div>

        {!resultState ? <p>No result data is available yet. Start a game to see your outcome.</p> : null}

        {resultState?.mode === 'single' ? (
          <>
            <p>{resultState.state.status === 'won' ? 'You won the round.' : 'You lost the round.'}</p>
            <p>Final word: {resultState.state.maskedWord}</p>
            <p>Wrong guesses: {resultState.state.wrongGuesses}</p>
            <p>Attempts left: {resultState.state.attemptsLeft}</p>
          </>
        ) : null}

        {resultState?.mode === 'multiplayer' ? (
          <>
            <p>
              Outcome:{' '}
              {resultState.result
                ? resultState.result.isDraw
                  ? 'Draw'
                  : `Winner: ${resultState.result.winnerPlayerId ?? 'unknown'}`
                : 'No final result yet'}
            </p>
            <p>Resolution: {resultState.result?.reason ?? '-'}</p>
            <p>Your status: {resultState.selfStatus}</p>
            <p>Opponent status: {resultState.opponentStatus ?? '-'}</p>
          </>
        ) : null}

        <div className="landing-actions">
          <Link to="/single" className="nav-link-button">
            Play Single-Player Again
          </Link>
          <Link to="/multiplayer/lobby" className="nav-link-button">
            Play Multiplayer Again
          </Link>
        </div>
      </section>
    </main>
  )
}

export default ResultPage
