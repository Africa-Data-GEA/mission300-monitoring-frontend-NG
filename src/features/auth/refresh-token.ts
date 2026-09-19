import { refreshResponseSchema } from '@/api/schemas/auth'
import { environment } from '@/config/environment'
import { dispatchLocalRequest } from '@/mocks/local-router'

const BASE_URL = environment.usesBrowserMocks ? '/api' : environment.apiBaseUrl

let inFlight: Promise<string | null> | null = null

/**
 * Exchanges the httpOnly refresh cookie for a new access token. Called both
 * proactively (use-token-refresh.ts, shortly before the current token
 * expires) and reactively (api-client.ts, after a 401) - deduped behind one
 * shared in-flight promise so several callers racing at once (e.g. a page
 * that fires 5 queries right as the token expires) trigger exactly one
 * network call, not five.
 *
 * Deliberately bypasses `api` (src/lib/api-client.ts): that module reads the
 * stored access token via readAuthSession(), which itself rejects an
 * already-expired token - the one case this function exists to recover
 * from. Returns null on any failure (no session, expired/revoked refresh
 * token) rather than throwing, since every caller's own fallback is simply
 * "give up and let the normal logged-out state take over".
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!inFlight) {
    inFlight = performRefresh().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

async function performRefresh(): Promise<string | null> {
  try {
    const response = environment.usesLocalRouter
      ? await dispatchLocalRequest('POST', `${BASE_URL}/auth/refresh`, {})
      : await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })

    if (!response || !response.ok) return null

    const payload: unknown = await response.json()
    const result = refreshResponseSchema.safeParse(payload)
    return result.success ? result.data.accessToken : null
  } catch {
    return null
  }
}
