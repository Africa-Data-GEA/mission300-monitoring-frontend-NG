import {
  identifiedAccountSchema,
  loginResponseSchema,
  type IdentifiedAccount,
  type LoginResponse,
} from '@/api/schemas/auth'

const AUTH_SESSION_KEY = 'm300-auth'
const PENDING_ACCOUNT_KEY = 'm300-pending-account'
export const AUTH_SESSION_CHANGED = 'm300-auth-session-changed'

function notifySessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED))
}

function tokenExpiry(accessToken: string): number | null {
  const payload = accessToken.split('.')[1]
  if (!payload) return null
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as unknown
    return typeof decoded === 'object' && decoded !== null && 'exp' in decoded &&
      typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

export function saveAuthSession(session: LoginResponse) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  sessionStorage.removeItem(PENDING_ACCOUNT_KEY)
  notifySessionChanged()
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
    if (!result.success) {
      clearAuthSession()
      return null
    }

    const expiry = result.data.expiresAt
      ? new Date(result.data.expiresAt).getTime()
      : tokenExpiry(result.data.accessToken)
    if (expiry !== null && expiry <= Date.now()) {
      clearAuthSession()
      return null
    }

    return result.data
  } catch {
    clearAuthSession()
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
  notifySessionChanged()
}

export function updateAuthUserName(name: string) {
  const session = readAuthSession()
  if (!session) return
  saveAuthSession({ ...session, user: { ...session.user, name } })
}
