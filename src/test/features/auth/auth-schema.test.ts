import { describe, expect, it } from 'vitest'
import { loginResponseSchema } from '@/api/schemas/auth'

describe('login response contract', () => {
  it('normalizes values returned by the PHP backend', () => {
    const result = loginResponseSchema.parse({
      accessToken: 'token-123',
      expiresAt: '2026-08-24 18:30:00',
      user: {
        id: 42,
        name: 'Test User',
        email: 'test@example.com',
        role: 'System Administrator',
      },
    })

    expect(result).toEqual({
      accessToken: 'token-123',
      expiresAt: '2026-08-24T18:30:00Z',
      user: {
        id: '42',
        name: 'Test User',
        email: 'test@example.com',
        role: 'system-administrator',
      },
    })
  })
})
