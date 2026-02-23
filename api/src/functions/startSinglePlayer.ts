import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createSinglePlayerRound, Difficulty, toPublicRoundState } from "@hangman/shared";
import { saveRound } from "../store.js";

interface StartBody {
  difficulty?: Difficulty;
}

const allowed: Difficulty[] = ["easy", "medium", "hard"];

export async function startSinglePlayer(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json()) as StartBody | null) ?? {};
  const difficulty: Difficulty = allowed.includes(body.difficulty as Difficulty) ? (body.difficulty as Difficulty) : "easy";

  const round = createSinglePlayerRound(difficulty);
  saveRound(round);

  return {
    status: 200,
    jsonBody: {
      sessionId: round.id,
      difficulty,
      state: toPublicRoundState(round),
    },
  };
}

app.http("singleplayer-start", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "singleplayer/start",
  handler: startSinglePlayer,
});
