import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { toMultiplayerPublicState } from "@hangman/shared";
import { getMultiplayerMatch } from "../store.js";

export async function getMultiplayerResultHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
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
    const state = toMultiplayerPublicState(match, playerId);
    return {
      status: 200,
      jsonBody: {
        matchId,
        status: state.status,
        result: state.result ?? null,
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

app.http("multiplayer-result", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "multiplayer/result/{matchId}/{playerId}",
  handler: getMultiplayerResultHandler,
});
