import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { joinMultiplayerMatch, toMultiplayerPublicState } from "@hangman/shared";
import { getMultiplayerMatch, saveMultiplayerMatch } from "../store.js";

interface JoinMatchBody {
  matchId?: string;
  playerId?: string;
}

export async function joinMultiplayerMatchHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json()) as JoinMatchBody | null) ?? {};
  const matchId = body.matchId?.trim();
  const playerId = body.playerId?.trim();

  if (!matchId || !playerId) {
    return {
      status: 400,
      jsonBody: {
        error: "matchId and playerId are required",
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

  try {
    joinMultiplayerMatch(match, playerId);
    saveMultiplayerMatch(match);
  } catch (error) {
    return {
      status: 409,
      jsonBody: {
        error: error instanceof Error ? error.message : "unable to join match",
      },
    };
  }

  return {
    status: 200,
    jsonBody: {
      matchId,
      state: toMultiplayerPublicState(match, playerId),
    },
  };
}

app.http("multiplayer-join", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "multiplayer/join",
  handler: joinMultiplayerMatchHandler,
});
