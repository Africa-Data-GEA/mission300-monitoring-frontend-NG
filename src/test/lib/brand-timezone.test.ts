import { afterEach, describe, expect, it } from 'vitest'
import { formatDateTime, setDisplayTimeZone } from '@/lib/format'

describe('the configured timezone', () => {
  afterEach(() => setDisplayTimeZone('Africa/Lagos'))

  it('shows the same instant on the local clock of the configured country', () => {
    const iso = '2026-10-20T22:30:00.000Z'
    setDisplayTimeZone('Africa/Lagos')
    const lagos = formatDateTime(iso)
    setDisplayTimeZone('Africa/Nairobi')
    const nairobi = formatDateTime(iso)
    expect(lagos).not.toEqual(nairobi)
    expect(lagos).toContain('20 Oct')
    expect(nairobi).toContain('21 Oct')
  })

  it('ignores a timezone that does not exist and keeps a working one', () => {
    setDisplayTimeZone('Mars/Olympus')
    expect(formatDateTime('2026-10-20T10:00:00.000Z')).toContain('2026')
  })
})
