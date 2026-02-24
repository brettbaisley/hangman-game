import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { getAuthenticatedUser } from './auth'
import LandingPage from './pages/LandingPage'
import MultiplayerLobbyPage from './pages/MultiplayerLobbyPage'
import MultiplayerMatchPage from './pages/MultiplayerMatchPage'
import ResultPage from './pages/ResultPage'
import SinglePlayerPage from './pages/SinglePlayerPage'

function App() {
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadAuthState() {
      try {
        const user = await getAuthenticatedUser()
        if (!isActive) return
        setIsAuthenticated(Boolean(user))
        setUserDisplayName(user?.userDetails ?? null)
      } finally {
        if (isActive) {
          setIsAuthLoading(false)
        }
      }
    }

    void loadAuthState()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage isAuthLoading={isAuthLoading} isAuthenticated={isAuthenticated} userDisplayName={userDisplayName} />}
      />
      <Route path="/single" element={<SinglePlayerPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route
        path="/multiplayer"
        element={isAuthenticated ? <Navigate to="/multiplayer/lobby" replace /> : <Navigate to="/" replace />}
      />
      <Route
        path="/multiplayer/lobby"
        element={isAuthenticated ? <MultiplayerLobbyPage defaultPlayerId={userDisplayName ?? 'player-1'} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/multiplayer/match"
        element={isAuthenticated ? <MultiplayerMatchPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
