import type { Difficulty, GuessResultCode, RoundStatus } from "./game.js";

export type MultiplayerMatchStatus = "waiting_for_opponent" | "in_progress" | "ended";

export interface MultiplayerPlayerState {
  playerId: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  status: RoundStatus;
  solvedAtIso?: string;
}

export interface MultiplayerResult {
  winnerPlayerId: string | null;
  isDraw: boolean;
  reason: "solved_status" | "efficiency" | "speed" | "exact_tie" | "both_failed";
}

export interface MultiplayerMatch {
  id: string;
  word: string;
  difficulty: Difficulty;
  createdAtIso: string;
  roundDurationSeconds: number;
  status: MultiplayerMatchStatus;
  players: MultiplayerPlayerState[];
  result?: MultiplayerResult;
}

export interface MultiplayerPlayerView {
  playerId: string;
  maskedWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  attemptsLeft: number;
  status: RoundStatus;
}

export interface OpponentProgressView {
  playerId: string;
  wrongGuesses: number;
  attemptsLeft: number;
  status: RoundStatus;
}

export interface MultiplayerPublicState {
  matchId: string;
  status: MultiplayerMatchStatus;
  difficulty: Difficulty;
  secondsRemaining: number;
  self: MultiplayerPlayerView;
  opponent: OpponentProgressView | null;
  result?: MultiplayerResult;
}

export interface MultiplayerGuessOutcome {
  code: GuessResultCode;
  letter: string;
  state: MultiplayerPublicState;
}

const WORD_BANK: Record<Difficulty, string[]> = {
  easy: ["apple", "chair", "beach", "light", "plant"],
  medium: ["planet", "window", "rocket", "silver", "jungle"],
  hard: ["mystery", "puzzling", "vortex", "zephyrs", "awkward"],
};

const MAX_WRONG_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 7,
  hard: 6,
};

const TIE_TOLERANCE_MS = 250;

export function createMultiplayerMatch(hostPlayerId: string, difficulty: Difficulty, roundDurationSeconds = 90): MultiplayerMatch {
  const words = WORD_BANK[difficulty];
  const word = words[Math.floor(Math.random() * words.length)];

  return {
    id: crypto.randomUUID(),
    word,
    difficulty,
    createdAtIso: new Date().toISOString(),
    roundDurationSeconds,
    status: "waiting_for_opponent",
    players: [createPlayerState(hostPlayerId, MAX_WRONG_BY_DIFFICULTY[difficulty])],
  };
}

export function joinMultiplayerMatch(match: MultiplayerMatch, playerId: string): MultiplayerMatch {
  const exists = match.players.find((player) => player.playerId === playerId);
  if (exists) {
    return match;
  }

  if (match.players.length >= 2 || match.status === "ended") {
    throw new Error("match unavailable");
  }

  const maxWrongGuesses = MAX_WRONG_BY_DIFFICULTY[match.difficulty];
  match.players.push(createPlayerState(playerId, maxWrongGuesses));

  if (match.players.length === 2) {
    match.status = "in_progress";
  }

  return match;
}

export function submitMultiplayerGuess(match: MultiplayerMatch, playerId: string, rawLetter: string): MultiplayerGuessOutcome {
  ensureTimerResolution(match);

  const player = getPlayer(match, playerId);
  const letter = rawLetter.toLowerCase().trim();

  if (!player || !/^[a-z]$/.test(letter) || match.status !== "in_progress" || player.status !== "in_progress") {
    return {
      code: "invalid",
      letter,
      state: toMultiplayerPublicState(match, playerId),
    };
  }

  if (player.guessedLetters.includes(letter)) {
    return {
      code: "duplicate",
      letter,
      state: toMultiplayerPublicState(match, playerId),
    };
  }

  player.guessedLetters.push(letter);

  if (match.word.includes(letter)) {
    const solved = match.word.split("").every((character) => player.guessedLetters.includes(character));

    if (solved) {
      player.status = "won";
      player.solvedAtIso = new Date().toISOString();
      resolveIfRoundEnded(match);
    }

    return {
      code: "correct",
      letter,
      state: toMultiplayerPublicState(match, playerId),
    };
  }

  player.wrongGuesses += 1;
  if (player.wrongGuesses >= player.maxWrongGuesses) {
    player.status = "lost";
    resolveIfRoundEnded(match);
  }

  return {
    code: "wrong",
    letter,
    state: toMultiplayerPublicState(match, playerId),
  };
}

export function toMultiplayerPublicState(match: MultiplayerMatch, playerId: string): MultiplayerPublicState {
  ensureTimerResolution(match);

  const self = getPlayer(match, playerId);
  if (!self) {
    throw new Error("player not found");
  }

  const opponentRaw = match.players.find((player) => player.playerId !== playerId) ?? null;
  const createdAtMs = Date.parse(match.createdAtIso);
  const elapsedSeconds = Number.isFinite(createdAtMs)
    ? Math.floor((Date.now() - createdAtMs) / 1000)
    : 0;
  const secondsRemaining = Math.max(match.roundDurationSeconds - elapsedSeconds, 0);

  const selfView: MultiplayerPlayerView = {
    playerId: self.playerId,
    maskedWord: maskWord(match.word, self.guessedLetters),
    guessedLetters: [...self.guessedLetters],
    wrongGuesses: self.wrongGuesses,
    maxWrongGuesses: self.maxWrongGuesses,
    attemptsLeft: Math.max(self.maxWrongGuesses - self.wrongGuesses, 0),
    status: self.status,
  };

  const opponent = opponentRaw
    ? {
        playerId: opponentRaw.playerId,
        wrongGuesses: opponentRaw.wrongGuesses,
        attemptsLeft: Math.max(opponentRaw.maxWrongGuesses - opponentRaw.wrongGuesses, 0),
        status: opponentRaw.status,
      }
    : null;

  return {
    matchId: match.id,
    status: match.status,
    difficulty: match.difficulty,
    secondsRemaining,
    self: selfView,
    opponent,
    result: match.result,
  };
}

export function resolveIfRoundEnded(match: MultiplayerMatch): MultiplayerMatch {
  if (match.status !== "in_progress") {
    return match;
  }

  const [first, second] = match.players;
  if (!first || !second) {
    return match;
  }

  if (first.status === "won" || second.status === "won") {
    match.status = "ended";
    match.result = resolveWinner(first, second);
    return match;
  }

  if (first.status === "lost" && second.status === "lost") {
    match.status = "ended";
    match.result = {
      winnerPlayerId: null,
      isDraw: true,
      reason: "both_failed",
    };
  }

  return match;
}

export function resolveWinner(first: MultiplayerPlayerState, second: MultiplayerPlayerState): MultiplayerResult {
  const firstSolved = first.status === "won";
  const secondSolved = second.status === "won";

  if (firstSolved !== secondSolved) {
    return {
      winnerPlayerId: firstSolved ? first.playerId : second.playerId,
      isDraw: false,
      reason: "solved_status",
    };
  }

  if (first.wrongGuesses !== second.wrongGuesses) {
    return {
      winnerPlayerId: first.wrongGuesses < second.wrongGuesses ? first.playerId : second.playerId,
      isDraw: false,
      reason: "efficiency",
    };
  }

  if (firstSolved && secondSolved && first.solvedAtIso && second.solvedAtIso) {
    const firstMs = Date.parse(first.solvedAtIso);
    const secondMs = Date.parse(second.solvedAtIso);

    if (Math.abs(firstMs - secondMs) > TIE_TOLERANCE_MS) {
      return {
        winnerPlayerId: firstMs < secondMs ? first.playerId : second.playerId,
        isDraw: false,
        reason: "speed",
      };
    }
  }

  return {
    winnerPlayerId: null,
    isDraw: true,
    reason: "exact_tie",
  };
}

function ensureTimerResolution(match: MultiplayerMatch): void {
  if (match.status !== "in_progress") {
    return;
  }

  const deadline = Date.parse(match.createdAtIso) + match.roundDurationSeconds * 1000;
  if (Date.now() < deadline) {
    return;
  }

  const [first, second] = match.players;
  if (!first || !second) {
    return;
  }

  match.status = "ended";
  match.result = resolveWinner(first, second);
}

function createPlayerState(playerId: string, maxWrongGuesses: number): MultiplayerPlayerState {
  return {
    playerId,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses,
    status: "in_progress",
  };
}

function getPlayer(match: MultiplayerMatch, playerId: string): MultiplayerPlayerState | undefined {
  return match.players.find((player) => player.playerId === playerId);
}

function maskWord(word: string, guessedLetters: string[]): string {
  return word
    .split("")
    .map((character) => (guessedLetters.includes(character) ? character : "_"))
    .join(" ");
}
