import {
  forgotPasswordResponseSchema,
  identifiedAccountSchema,
  loginResponseSchema,
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
