import { afterEach, describe, expect, it } from 'vitest'
import { saveAuthSession } from '@/features/auth/auth-session'
import { destinationAfterSubmit } from '@/features/data-submissions/lib/after-submit'

function signInAs(role: string) {
  saveAuthSession({
    accessToken: 'token',
    user: { id: 'u1', name: 'Test User', email: 'test@example.com', role },
  })
}

afterEach(() => sessionStorage.clear())

describe('destinationAfterSubmit', () => {
  it('sends a provider to submission history instead of a reviewer page', () => {
    signInAs('institutional-data-provider')
    expect(destinationAfterSubmit('/data-submissions/validation/sub-1')).toBe('/data-submissions/submissions')
    expect(destinationAfterSubmit('/data-submissions/validation')).toBe('/data-submissions/submissions')
  })

  it('leaves a provider destination that is not a reviewer page alone', () => {
    signInAs('institutional-data-provider')
    expect(destinationAfterSubmit('/data-submissions/submissions')).toBe('/data-submissions/submissions')
  })

  it.each(['data-reviewer', 'validator', 'system-administrator'])('keeps the validation page for %s', (role) => {
    signInAs(role)
    expect(destinationAfterSubmit('/data-submissions/validation/sub-1')).toBe('/data-submissions/validation/sub-1')
  })
})
