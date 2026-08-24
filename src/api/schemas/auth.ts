import { z } from 'zod'

export const identifyAccountRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const identifiedAccountSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1),
  institution: z.string().min(1),
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
  }),
})

export const forgotPasswordRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const forgotPasswordResponseSchema = z.object({
  message: z.string().min(1),
})

export type IdentifiedAccount = z.infer<typeof identifiedAccountSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
