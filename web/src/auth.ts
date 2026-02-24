export interface AuthenticatedUser {
  userId: string
  userDetails: string
  identityProvider: string
}

interface SwaClientPrincipal {
  userId?: string
  userDetails?: string
  identityProvider?: string
}

interface SwaMeResponse {
  clientPrincipal?: SwaClientPrincipal | null
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const response = await fetch('/.auth/me', {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as SwaMeResponse
  const principal = payload.clientPrincipal

  if (!principal?.userId) {
    return null
  }

  return {
    userId: principal.userId,
    userDetails: principal.userDetails ?? principal.userId,
    identityProvider: principal.identityProvider ?? 'unknown',
  }
}