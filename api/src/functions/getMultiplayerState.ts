import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { toMultiplayerPublicState } from "@hangman/shared";
import { getMultiplayerMatch } from "../store.js";

export async function getMultiplayerStateHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const matchId = request.params.matchId;
  const playerId = request.params.playerId;

  const match = getMultiplayerMatch(matchId);
  if (!match) {
    return {
      status: 404,
      jsonBody: {
        error: "match not found",
      },
    };
  }

  try {
    return {
      status: 200,
      jsonBody: {
        matchId,
        playerId,
        state: toMultiplayerPublicState(match, playerId),
      },
    };
  } catch {
    return {
      status: 404,
      jsonBody: {
        error: "player not found in match",
      },
    };
  }
}

app.http("multiplayer-state", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "multiplayer/state/{matchId}/{playerId}",
  handler: getMultiplayerStateHandler,
});
