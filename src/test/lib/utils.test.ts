import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins plain class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('accepts conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('flattens arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  /*
   * The reason this helper exists rather than a plain join: a caller passing
   * `className="p-8"` must be able to override a component's own `p-5`.
   */
  it('resolves conflicting Tailwind utilities in favour of the last one', () => {
    expect(cn('p-5', 'p-8')).toBe('p-8')
    expect(cn('text-sm text-text-muted', 'text-lg')).toBe(
      'text-text-muted text-lg',
    )
  })

  it('keeps non-conflicting utilities from both sides', () => {
    expect(cn('rounded-card border', 'bg-surface')).toBe(
      'rounded-card border bg-surface',
    )
  })
})
