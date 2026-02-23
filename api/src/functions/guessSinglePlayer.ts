import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { submitGuess } from "@hangman/shared";
import { getRound } from "../store.js";

interface GuessBody {
  sessionId?: string;
  letter?: string;
}

export async function guessSinglePlayer(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json()) as GuessBody | null) ?? {};

  if (!body.sessionId || !body.letter) {
    return {
      status: 400,
      jsonBody: {
        error: "sessionId and letter are required",
      },
    };
  }

  const round = getRound(body.sessionId);
  if (!round) {
    return {
      status: 404,
      jsonBody: {
        error: "session not found",
      },
    };
  }

  const outcome = submitGuess(round, body.letter);

  return {
    status: 200,
    jsonBody: {
      sessionId: body.sessionId,
      ...outcome,
    },
  };
}

app.http("singleplayer-guess", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "singleplayer/guess",
  handler: guessSinglePlayer,
});
