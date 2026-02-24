import { Link } from 'react-router-dom'

interface LandingPageProps {
  isAuthLoading: boolean
  isAuthenticated: boolean
  userDisplayName: string | null
}

function LandingPage({ isAuthLoading, isAuthenticated, userDisplayName }: LandingPageProps) {
  function onLogin() {
    window.location.href = '/.auth/login/aad'
  }

  function onLogout() {
    window.location.href = '/.auth/logout'
  }

  return (
    <main className="app-shell">
      <section className="panel landing-panel">
        <h1>Hangman Web</h1>
        <p>
          Play classic Hangman in your browser. Start a solo round to practice or jump into multiplayer to race another
          player on the same word.
        </p>
        <p>Sign up or log in to access your account and prepare for multiplayer play.</p>
        {isAuthLoading ? <p>Checking login status...</p> : null}
        {!isAuthLoading && isAuthenticated ? <p>Signed in as {userDisplayName ?? 'player'}.</p> : null}
        {!isAuthLoading && !isAuthenticated ? <p>You are currently playing as a guest.</p> : null}
        <div className="landing-actions">
          {isAuthenticated ? (
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <button type="button" onClick={onLogin}>
              Login / Sign Up
            </button>
          )}
        </div>
        <div className="landing-actions">
          <Link to="/single" className="nav-link-button">
            Start 1 Player Game
          </Link>
          {isAuthenticated ? (
            <Link to="/multiplayer/lobby" className="nav-link-button">
              Start Multiplayer Game
            </Link>
          ) : (
            <button type="button" className="nav-link-button nav-link-button-disabled" disabled>
              Start Multiplayer Game
            </button>
          )}
        </div>
        {!isAuthLoading && !isAuthenticated ? <p>Log in to enable multiplayer mode.</p> : null}
      </section>
    </main>
  )
}

export default LandingPage
