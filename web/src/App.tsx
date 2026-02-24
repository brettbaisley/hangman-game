import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { getAuthenticatedUser } from './auth'
import LandingPage from './pages/LandingPage'
import MultiplayerPage from './pages/MultiplayerPage'
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
      <Route
        path="/multiplayer"
        element={isAuthenticated ? <MultiplayerPage defaultPlayerId={userDisplayName ?? 'player-1'} /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
