import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from "@azure/functions";

const signalROutput = output.generic({
  type: "signalR",
  name: "signalRMessages",
  hubName: "hangman",
  connectionStringSetting: "AzureSignalRConnectionString",
});

interface TestSignalRBody {
  matchId?: string;
}

export async function testMultiplayerSignalRHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json().catch(() => null)) as TestSignalRBody | null) ?? {};
  const matchId = body.matchId?.trim();

  if (!matchId) {
    return {
      status: 400,
      jsonBody: {
        error: "matchId is required",
      },
    };
  }

  context.extraOutputs.set(signalROutput, [
    {
      target: "multiplayerSignalRTest",
      arguments: [
        {
          matchId,
          sentAt: new Date().toISOString(),
        },
      ],
    },
  ]);

  return {
    status: 200,
    jsonBody: {
      ok: true,
      matchId,
    },
  };
}

app.http("multiplayer-signalr-test", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "multiplayer/signalr/test",
  extraOutputs: [signalROutput],
  handler: testMultiplayerSignalRHandler,
});
