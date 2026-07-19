import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { resolveTrend } from '@/lib/trend'
import type { Trend } from '@/types/domain'

function trend(partial: Partial<Trend>): Trend {
  return {
    change: 0,
    label: 'label',
    direction: 'higher-is-better',
    ...partial,
  }
}

describe('resolveTrend', () => {
  describe('higher-is-better metrics (access rate, metering rate)', () => {
    it('treats a rise as an improvement and points the arrow up', () => {
      const result = resolveTrend(
        trend({ change: 2.1, direction: 'higher-is-better' }),
      )

      expect(result.isImproving).toBe(true)
      expect(result.isRising).toBe(true)
      expect(result.Icon).toBe(ArrowUp)
    })

    it('treats a fall as a worsening and points the arrow down', () => {
      const result = resolveTrend(
        trend({ change: -2.1, direction: 'higher-is-better' }),
      )

      expect(result.isImproving).toBe(false)
      expect(result.Icon).toBe(ArrowDown)
    })
  })

  describe('lower-is-better metrics (ATC&C losses, tariff shortfall)', () => {
    /*
     * This is the case the page specification is explicit about:
     * "Use a green downward arrow when losses decline and a red upward arrow
     *  when losses rise." A falling value must be BOTH a down arrow and an
     *  improvement — the arrow direction and the colour disagree by design.
     */
    it('treats a fall as an improvement while still pointing the arrow down', () => {
      const result = resolveTrend(
        trend({ change: -1.4, direction: 'lower-is-better' }),
      )

      expect(result.isImproving).toBe(true)
      expect(result.isRising).toBe(false)
      expect(result.Icon).toBe(ArrowDown)
    })

    it('treats a rise as a worsening and points the arrow up', () => {
      const result = resolveTrend(
        trend({ change: 3.2, direction: 'lower-is-better' }),
      )

      expect(result.isImproving).toBe(false)
      expect(result.isRising).toBe(true)
      expect(result.Icon).toBe(ArrowUp)
    })
  })

  describe('no movement', () => {
    it('is flat regardless of direction', () => {
      for (const direction of ['higher-is-better', 'lower-is-better'] as const) {
        const result = resolveTrend(trend({ change: 0, direction }))

        expect(result.isFlat).toBe(true)
        expect(result.isRising).toBe(false)
        expect(result.Icon).toBe(ArrowRight)
      }
    })

    /*
     * Guards a subtle bug: `isImproving` is derived from `isRising`, so a flat
     * lower-is-better metric reads as "improving". Rendering must branch on
     * isFlat FIRST, which TrendIndicator does. Documented here so nobody
     * "fixes" the flat branch out of the component.
     */
    it('reports flat lower-is-better movement as improving, which callers must override', () => {
      const result = resolveTrend(
        trend({ change: 0, direction: 'lower-is-better' }),
      )

      expect(result.isFlat).toBe(true)
      expect(result.isImproving).toBe(true)
    })
  })
})
