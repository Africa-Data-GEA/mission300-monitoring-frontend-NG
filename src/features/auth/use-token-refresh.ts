import { useEffect } from 'react'
import { AUTH_SESSION_CHANGED, readAuthSession, tokenExpiry, updateAccessToken } from './auth-session'
import { refreshAccessToken } from './refresh-token'

// Refresh this long before the access token actually expires - comfortably
// ahead of network latency and the httpOnly cookie's own round trip, so the
// old token is still valid when the new one is requested.
const REFRESH_MARGIN_MS = 60_000

/**
 * The actual fix for "the app logs me out every 15 minutes": schedules a
 * silent refresh shortly before the current access token's own `exp`, so a
 * user who's actively using the app never sees readAuthSession() go null on
 * its own. api-client.ts's 401-retry is only the fallback for whatever
 * slips past this (a request in flight right at the boundary, a background
 * tab whose timers got throttled).
 *
 * A mock-mode token (`mock-token-<id>`) has no decodable `exp` claim -
 * tokenExpiry() returns null for it, so nothing is ever scheduled there,
 * matching that mode's tokens never actually expiring today.
 */
export function useTokenRefresh() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function schedule() {
      if (timer) clearTimeout(timer)
      timer = null

      const session = readAuthSession()
      if (!session) return

      const expiry = tokenExpiry(session.accessToken)
      if (expiry === null) return

      const delay = Math.max(0, expiry - Date.now() - REFRESH_MARGIN_MS)
      timer = setTimeout(async () => {
        const refreshed = await refreshAccessToken()
        // Re-scheduling for the new token happens via the AUTH_SESSION_CHANGED
        // listener below, fired by updateAccessToken() itself. A failed
        // refresh schedules nothing further - the refresh token is most
        // likely dead, and api-client.ts's reactive path takes over from here.
        if (refreshed) updateAccessToken(refreshed)
      }, delay)
    }

    schedule()
    window.addEventListener(AUTH_SESSION_CHANGED, schedule)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener(AUTH_SESSION_CHANGED, schedule)
    }
  }, [])
}
