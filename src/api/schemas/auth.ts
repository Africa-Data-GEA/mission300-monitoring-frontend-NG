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

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    role: z.string().min(1),
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
