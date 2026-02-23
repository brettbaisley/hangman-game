import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createMultiplayerMatch, Difficulty, toMultiplayerPublicState } from "@hangman/shared";
import { saveMultiplayerMatch } from "../store.js";

interface CreateMatchBody {
  playerId?: string;
  difficulty?: Difficulty;
  roundDurationSeconds?: number;
}

const allowedDifficulty: Difficulty[] = ["easy", "medium", "hard"];

export async function createMultiplayerMatchHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json()) as CreateMatchBody | null) ?? {};
  const playerId = body.playerId?.trim();

  if (!playerId) {
    return {
      status: 400,
      jsonBody: {
        error: "playerId is required",
      },
    };
  }

  const difficulty: Difficulty = allowedDifficulty.includes(body.difficulty as Difficulty)
    ? (body.difficulty as Difficulty)
    : "easy";
  const roundDurationSeconds =
    typeof body.roundDurationSeconds === "number" && body.roundDurationSeconds >= 30
      ? Math.floor(body.roundDurationSeconds)
      : 90;

  const match = createMultiplayerMatch(playerId, difficulty, roundDurationSeconds);
  saveMultiplayerMatch(match);

  return {
    status: 200,
    jsonBody: {
      matchId: match.id,
      state: toMultiplayerPublicState(match, playerId),
    },
  };
}

app.http("multiplayer-create", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "multiplayer/create",
  handler: createMultiplayerMatchHandler,
});
