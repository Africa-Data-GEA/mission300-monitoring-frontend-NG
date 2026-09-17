import { z } from 'zod'

export const identifyAccountRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const identifiedAccountSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1),
  /**
   * Allowed to be empty. The Nigeria backend returns `""` for an account with
   * no institution assigned yet, which is a legitimate state — an oversight
   * user, or a provider whose institution has not been linked. Requiring a
   * non-empty string here rejected the whole 200 response and failed sign-in
   * at the email step with no way for the user to proceed.
   *
   * Nothing in the sign-in flow renders this field; it is carried so the
   * password step can show who is signing in once a backend populates it.
   */
  institution: z.string(),
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

export type IdentifiedAccount = z.infer<typeof identifiedAccountSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
