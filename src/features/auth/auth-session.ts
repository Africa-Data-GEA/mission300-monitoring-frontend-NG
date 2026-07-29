import {
  identifiedAccountSchema,
  type IdentifiedAccount,
  type LoginResponse,
} from '@/api/schemas/auth'

const AUTH_SESSION_KEY = 'm300-auth'
const PENDING_ACCOUNT_KEY = 'm300-pending-account'

export function saveAuthSession(session: LoginResponse) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  sessionStorage.removeItem(PENDING_ACCOUNT_KEY)
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
