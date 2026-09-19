import { z } from 'zod'

export const identifyAccountRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

/**
 * Step 1's response is now just the echoed email (WEB-006 fix) — the
 * backend used to also return displayName/institution here, but that
 * personalized "Welcome back, {name}" before the password was even typed,
 * which combined with the step returning a different status/body for a
 * known-vs-unknown email made this an account-enumeration oracle. Personal
 * details now only ever appear after a successful password verification
 * (see loginResponseSchema below).
 */
export const identifiedAccountSchema = z.object({
  email: z.email(),
})

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Enter your password'),
})

const expiresAtSchema = z
  .string()
  .transform((value) =>
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(' ', 'T')}Z`
      : value,
  )
  .pipe(z.iso.datetime())

const ROLE_ALIASES: Record<string, string> = {
  'system administrator': 'system-administrator',
  administrator: 'system-administrator',
  'data officer': 'institutional-data-provider',
  reviewer: 'data-reviewer',
}

function normalizeRole(role: string) {
  const normalized = role.trim().toLowerCase()
  return ROLE_ALIASES[normalized] ?? normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: expiresAtSchema.optional(),
  user: z.object({
    id: z.union([z.string().min(1), z.number()]).transform(String),
    name: z.string().min(1),
    email: z.email(),
    role: z.string().min(1).transform(normalizeRole),
    roles: z.array(z.string().min(1).transform(normalizeRole)).optional(),
  }),
})

/** POST /auth/refresh's response - just a new access token. The refresh
 * token itself never appears here; it lives only in the httpOnly cookie the
 * browser sends automatically, never something JS reads or writes. */
export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
})

export const forgotPasswordRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const forgotPasswordResponseSchema = z.object({
  message: z.string().min(1),
})

export const setPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Use at least 8 characters'),
})

export const setPasswordResponseSchema = z.object({
  message: z.string().min(1),
})

export const logoutResponseSchema = z.object({
  message: z.string().min(1),
})

export type IdentifiedAccount = z.infer<typeof identifiedAccountSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
