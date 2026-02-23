import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { toPublicRoundState } from "@hangman/shared";
import { getRound } from "../store.js";

export async function getSinglePlayerState(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const sessionId = request.params.sessionId;
  const round = getRound(sessionId);

  if (!round) {
    return {
      status: 404,
      jsonBody: {
        error: "session not found",
      },
    };
  }

  return {
    status: 200,
    jsonBody: {
      sessionId,
      state: toPublicRoundState(round),
    },
  };
}

app.http("singleplayer-state", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "singleplayer/state/{sessionId}",
  handler: getSinglePlayerState,
});
