import {
  identifiedAccountSchema,
  loginResponseSchema,
  type IdentifiedAccount,
  type LoginResponse,
} from '@/api/schemas/auth'

const AUTH_SESSION_KEY = 'm300-auth'
const PENDING_ACCOUNT_KEY = 'm300-pending-account'

export function saveAuthSession(session: LoginResponse) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  sessionStorage.removeItem(PENDING_ACCOUNT_KEY)
}

/**
 * Reads back the session `saveAuthSession` wrote on login — previously
 * nothing in the app did this, so the signed-in user's name and role never
 * reached the sidebar or any role-based access check after the login screen
 * itself.
 */
export function readAuthSession(): LoginResponse | null {
  const stored = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!stored) return null

  try {
    const result = loginResponseSchema.safeParse(JSON.parse(stored))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function savePendingAccount(account: IdentifiedAccount) {
  sessionStorage.setItem(PENDING_ACCOUNT_KEY, JSON.stringify(account))
}

export function readPendingAccount(): IdentifiedAccount | null {
  const stored = sessionStorage.getItem(PENDING_ACCOUNT_KEY)
  if (!stored) return null

  try {
    const result = identifiedAccountSchema.safeParse(JSON.parse(stored))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function clearPendingAccount() {
  sessionStorage.removeItem(PENDING_ACCOUNT_KEY)
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  sessionStorage.removeItem(PENDING_ACCOUNT_KEY)
}
