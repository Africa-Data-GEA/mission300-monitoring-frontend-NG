import {
  forgotPasswordResponseSchema,
  identifiedAccountSchema,
  loginResponseSchema,
  logoutResponseSchema,
  setPasswordResponseSchema,
  type IdentifiedAccount,
  type LoginResponse,
} from '@/api/schemas/auth'
import { api } from '@/lib/api-client'

export function identifyAccount(email: string): Promise<IdentifiedAccount> {
  return api.post('/auth/identify', { email }, identifiedAccountSchema)
}

export function authenticate(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return api.post('/auth/login', { email, password }, loginResponseSchema)
}

export function requestPasswordReset(email: string): Promise<{ message: string }> {
  return api.post(
    '/auth/forgot-password',
    { email },
    forgotPasswordResponseSchema,
  )
}

export function setAccountPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return api.post('/auth/set-password', { token, newPassword }, setPasswordResponseSchema)
}

/**
 * Revokes the signed-in account's JWT server-side (WEB-008 fix) — without
 * this, a token captured before logout (XSS, shared machine, proxy log)
 * stayed valid for the rest of its 15-minute lifetime even after the user
 * signed out. Best-effort: the caller is clearing the local session and
 * navigating away regardless of whether this succeeds.
 */
export function logoutRequest(): Promise<{ message: string }> {
  return api.post('/auth/logout', {}, logoutResponseSchema)
}
