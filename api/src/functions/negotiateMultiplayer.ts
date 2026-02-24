import { app, HttpRequest, HttpResponseInit, InvocationContext, input } from "@azure/functions";

const signalRConnectionInput = input.generic({
  type: "signalRConnectionInfo",
  name: "connectionInfo",
  hubName: "hangman",
  connectionStringSetting: "AzureSignalRConnectionString",
  userId: "{headers.x-player-id}",
});

interface NegotiateBody {
  playerId?: string;
}

interface SignalRConnectionInfo {
  url: string;
  accessToken: string;
}

export async function negotiateMultiplayerHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const body = ((await request.json().catch(() => null)) as NegotiateBody | null) ?? {};
  const playerId = body.playerId?.trim();

  if (!playerId) {
    return {
      status: 400,
      jsonBody: {
        error: "playerId is required",
      },
    };
  }

  const connectionInfo = context.extraInputs.get(signalRConnectionInput) as SignalRConnectionInfo | undefined;
  if (!connectionInfo?.url || !connectionInfo.accessToken) {
    return {
      status: 500,
      jsonBody: {
        error: "signalr negotiation unavailable",
      },
    };
  }

  return {
    status: 200,
    jsonBody: connectionInfo,
  };
}

app.http("multiplayer-negotiate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "multiplayer/negotiate",
  extraInputs: [signalRConnectionInput],
  handler: negotiateMultiplayerHandler,
});
