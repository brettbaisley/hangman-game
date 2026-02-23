export type RoundStatus = 'in_progress' | 'won' | 'lost'

export interface RoundState {
  id: string
  maskedWord: string
  guessedLetters: string[]
  wrongGuesses: number
  maxWrongGuesses: number
  attemptsLeft: number
  status: RoundStatus
}

export interface StartResponse {
  sessionId: string
  difficulty: 'easy' | 'medium' | 'hard'
  state: RoundState
}

export interface GuessResponse {
  sessionId: string
  code: 'correct' | 'wrong' | 'duplicate' | 'invalid'
  letter: string
  state: RoundState
}

export interface MultiplayerResult {
  winnerPlayerId: string | null
  isDraw: boolean
  reason: 'solved_status' | 'efficiency' | 'speed' | 'exact_tie' | 'both_failed'
}

export interface MultiplayerPlayerView {
  playerId: string
  maskedWord: string
  guessedLetters: string[]
  wrongGuesses: number
  maxWrongGuesses: number
  attemptsLeft: number
  status: RoundStatus
}

export interface OpponentProgressView {
  playerId: string
  wrongGuesses: number
  attemptsLeft: number
  status: RoundStatus
}

export interface MultiplayerPublicState {
  matchId: string
  status: 'waiting_for_opponent' | 'in_progress' | 'ended'
  difficulty: 'easy' | 'medium' | 'hard'
  secondsRemaining: number
  self: MultiplayerPlayerView
  opponent: OpponentProgressView | null
  result?: MultiplayerResult
}

export interface CreateMultiplayerResponse {
  matchId: string
  state: MultiplayerPublicState
}

export interface JoinMultiplayerResponse {
  matchId: string
  state: MultiplayerPublicState
}

export interface GuessMultiplayerResponse {
  matchId: string
  playerId: string
  code: 'correct' | 'wrong' | 'duplicate' | 'invalid'
  letter: string
  state: MultiplayerPublicState
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(errorPayload?.error ?? 'Request failed')
  }

  return (await response.json()) as T
}

export async function startSinglePlayer(difficulty: 'easy' | 'medium' | 'hard'): Promise<StartResponse> {
  const response = await fetch('/api/singleplayer/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ difficulty }),
  })

  return handleResponse<StartResponse>(response)
}

export async function submitSinglePlayerGuess(sessionId: string, letter: string): Promise<GuessResponse> {
  const response = await fetch('/api/singleplayer/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, letter }),
  })

  return handleResponse<GuessResponse>(response)
}

export async function createMultiplayerMatch(
  playerId: string,
  difficulty: 'easy' | 'medium' | 'hard',
): Promise<CreateMultiplayerResponse> {
  const response = await fetch('/api/multiplayer/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, difficulty }),
  })

  return handleResponse<CreateMultiplayerResponse>(response)
}

export async function joinMultiplayerMatch(matchId: string, playerId: string): Promise<JoinMultiplayerResponse> {
  const response = await fetch('/api/multiplayer/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matchId, playerId }),
  })

  return handleResponse<JoinMultiplayerResponse>(response)
}

export async function submitMultiplayerGuess(
  matchId: string,
  playerId: string,
  letter: string,
): Promise<GuessMultiplayerResponse> {
  const response = await fetch('/api/multiplayer/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matchId, playerId, letter }),
  })

  return handleResponse<GuessMultiplayerResponse>(response)
}

export async function getMultiplayerState(matchId: string, playerId: string): Promise<{ state: MultiplayerPublicState }> {
  const response = await fetch(`/api/multiplayer/state/${matchId}/${playerId}`)
  return handleResponse<{ state: MultiplayerPublicState }>(response)
}

export async function getMultiplayerResult(
  matchId: string,
  playerId: string,
): Promise<{ status: 'waiting_for_opponent' | 'in_progress' | 'ended'; result: MultiplayerResult | null }> {
  const response = await fetch(`/api/multiplayer/result/${matchId}/${playerId}`)
  return handleResponse<{ status: 'waiting_for_opponent' | 'in_progress' | 'ended'; result: MultiplayerResult | null }>(response)
}