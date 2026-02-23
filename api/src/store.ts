import type { MultiplayerMatch, SinglePlayerRound } from "@hangman/shared";

const singlePlayerRounds = new Map<string, SinglePlayerRound>();
const multiplayerMatches = new Map<string, MultiplayerMatch>();

export function saveRound(round: SinglePlayerRound): void {
  singlePlayerRounds.set(round.id, round);
}

export function getRound(sessionId: string): SinglePlayerRound | undefined {
  return singlePlayerRounds.get(sessionId);
}

export function saveMultiplayerMatch(match: MultiplayerMatch): void {
  multiplayerMatches.set(match.id, match);
}

export function getMultiplayerMatch(matchId: string): MultiplayerMatch | undefined {
  return multiplayerMatches.get(matchId);
}
