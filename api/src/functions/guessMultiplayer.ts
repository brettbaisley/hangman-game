import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { submitMultiplayerGuess } from "@hangman/shared";
import { getMultiplayerMatch, saveMultiplayerMatch } from "../store.js";

interface GuessMatchBody {
  matchId?: string;
  playerId?: string;
  letter?: string;
}

export async function guessMultiplayerHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json()) as GuessMatchBody | null) ?? {};
  const matchId = body.matchId?.trim();
  const playerId = body.playerId?.trim();
  const letter = body.letter?.trim();

  if (!matchId || !playerId || !letter) {
    return {
      status: 400,
      jsonBody: {
        error: "matchId, playerId, and letter are required",
      },
    };
  }

  const match = getMultiplayerMatch(matchId);
  if (!match) {
    return {
      status: 404,
      jsonBody: {
        error: "match not found",
      },
    };
  }

  if (!match.players.some((player) => player.playerId === playerId)) {
    return {
      status: 404,
      jsonBody: {
        error: "player not found in match",
      },
    };
  }

  if (match.status === "waiting_for_opponent") {
    return {
      status: 409,
      jsonBody: {
        error: "waiting for opponent to join",
      },
    };
  }

  if (match.status === "ended") {
    return {
      status: 409,
      jsonBody: {
        error: "match already ended",
      },
    };
  }

  const outcome = submitMultiplayerGuess(match, playerId, letter);
  saveMultiplayerMatch(match);

  return {
    status: 200,
    jsonBody: {
      matchId,
      playerId,
      ...outcome,
    },
  };
}

app.http("multiplayer-guess", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "multiplayer/guess",
  handler: guessMultiplayerHandler,
});
