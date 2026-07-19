import { describe, expect, it } from 'vitest'
import { executiveOverview } from '@/mocks/data/executive-overview'
import { PILLARS } from '@/types/domain'

/**
 * The mock payload doubles as the worked example handed to the gApp backend
 * team, so it must stay internally consistent and match the page
 * specification. These tests guard the qualities real data must also have.
 */
const {
  headlineCards,
  accessDelivery,
  nationalPerformance,
  deliveryStatus,
  filters,
} = executiveOverview

const allCards = [
  headlineCards.milestoneDelivery,
  headlineCards.accessRate,
  headlineCards.generationCapacity,
  headlineCards.escalations,
]

describe('executive overview mock payload', () => {
  describe('provenance', () => {
    /*
     * The specification requires definition, methodology, source and
     * last-updated for every metric. A missing one would let a card ship with
     * an incomplete information popover.
     */
    it('gives every headline card complete provenance', () => {
      for (const card of allCards) {
        expect(card.provenance.definition, card.title).toBeTruthy()
        expect(card.provenance.methodology, card.title).toBeTruthy()
        expect(card.provenance.source, card.title).toBeTruthy()
        expect(card.provenance.lastUpdated, card.title).toBeTruthy()
      }
    })

    it('gives every Section B channel complete provenance', () => {
      for (const channel of accessDelivery) {
        expect(channel.provenance.definition, channel.id).toBeTruthy()
        expect(channel.provenance.methodology, channel.id).toBeTruthy()
        expect(channel.provenance.source, channel.id).toBeTruthy()
      }
    })

    it('gives every Section C metric complete provenance', () => {
      for (const metric of nationalPerformance) {
        expect(metric.provenance.definition, metric.id).toBeTruthy()
        expect(metric.provenance.methodology, metric.id).toBeTruthy()
        expect(metric.provenance.source, metric.id).toBeTruthy()
      }
    })

    it('gives every exception complete provenance', () => {
      for (const exception of deliveryStatus.exceptions) {
        expect(exception.provenance.definition, exception.id).toBeTruthy()
        expect(exception.provenance.source, exception.id).toBeTruthy()
      }
    })

    it('uses parseable ISO timestamps throughout', () => {
      const timestamps = [
        executiveOverview.lastUpdated,
        ...allCards.map((card) => card.provenance.lastUpdated),
        ...nationalPerformance.map((metric) => metric.provenance.lastUpdated),
      ]

      for (const timestamp of timestamps) {
        expect(Number.isNaN(new Date(timestamp).getTime()), timestamp).toBe(false)
      }
    })
  })

  describe('specification coverage', () => {
    it('provides exactly the three specified access channels', () => {
      expect(accessDelivery.map((channel) => channel.id)).toEqual([
        'grid-connections',
        'mini-grid-connections',
        'solar-home-systems',
      ])
    })

    it('provides exactly the six specified national performance metrics', () => {
      expect(nationalPerformance.map((metric) => metric.id)).toEqual([
        'renewable-share',
        'metering-rate',
        'atcc-losses',
        'market-remittance',
        'tariff-shortfall',
        'private-capital',
      ])
    })

    it('reports delivery status for all six Compact pillars', () => {
      const reported = deliveryStatus.pillars.map((entry) => entry.pillar)

      expect(new Set(reported).size).toBe(PILLARS.length)
      for (const pillar of PILLARS) {
        expect(reported, pillar).toContain(pillar)
      }
    })

    it('provides all seven specified filter groups', () => {
      expect(Object.keys(filters).sort()).toEqual(
        [
          'distributionCompanies',
          'geographicScopes',
          'institutions',
          'pillars',
          'priorities',
          'reportingPeriods',
          'technologies',
        ].sort(),
      )
    })
  })

  describe('internal consistency', () => {
    it('gives every access channel and metric a unique id', () => {
      const ids = [
        ...accessDelivery.map((channel) => channel.id),
        ...nationalPerformance.map((metric) => metric.id),
        ...deliveryStatus.exceptions.map((exception) => exception.id),
      ]

      expect(new Set(ids).size).toBe(ids.length)
    })

    it('matches each pillar total to the sum of its status counts', () => {
      for (const pillar of deliveryStatus.pillars) {
        const sum = pillar.counts.reduce((total, entry) => total + entry.count, 0)
        expect(sum, pillar.label).toBe(pillar.total)
      }
    })

    it('keeps every bullet metric inside its own declared scale', () => {
      for (const metric of nationalPerformance) {
        expect(metric.scaleMax, metric.id).toBeGreaterThan(metric.scaleMin)
        expect(metric.current, metric.id).toBeGreaterThanOrEqual(metric.scaleMin)
        expect(metric.current, metric.id).toBeLessThanOrEqual(metric.scaleMax)
        expect(metric.baseline, metric.id).toBeGreaterThanOrEqual(metric.scaleMin)
        expect(metric.baseline, metric.id).toBeLessThanOrEqual(metric.scaleMax)
      }
    })

    it('keeps milestone delivery within 0–100', () => {
      const { percentComplete } = headlineCards.milestoneDelivery
      expect(percentComplete).toBeGreaterThanOrEqual(0)
      expect(percentComplete).toBeLessThanOrEqual(100)
    })

    it('gives every filter option a unique value and a label', () => {
      for (const [group, options] of Object.entries(filters)) {
        const values = options.map((option: { value: string }) => option.value)
        expect(new Set(values).size, group).toBe(values.length)
        for (const option of options) {
          expect(option.label, `${group}.${option.value}`).toBeTruthy()
        }
      }
    })
  })

  describe('improvement direction', () => {
    /*
     * ATC&C losses, tariff shortfall and escalation counts all improve as they
     * FALL. Mislabelling them would render a genuine improvement in red.
     */
    it.each(['atcc-losses', 'tariff-shortfall'])(
      'marks %s as lower-is-better',
      (id) => {
        const metric = nationalPerformance.find((entry) => entry.id === id)
        expect(metric?.direction).toBe('lower-is-better')
        expect(metric?.trend?.direction).toBe('lower-is-better')
      },
    )

    it('marks a rising escalation count as a worsening', () => {
      expect(headlineCards.escalations.trend?.direction).toBe('lower-is-better')
    })

    it.each(['renewable-share', 'metering-rate', 'market-remittance', 'private-capital'])(
      'marks %s as higher-is-better',
      (id) => {
        const metric = nationalPerformance.find((entry) => entry.id === id)
        expect(metric?.direction).toBe('higher-is-better')
      },
    )
  })

  describe('realistic edge cases', () => {
    /*
     * These exist on purpose so the UI is exercised against awkward real data
     * rather than only tidy values. Removing them weakens every test that
     * depends on the mock.
     */
    it('includes a channel with no approved target', () => {
      const untargeted = accessDelivery.find((channel) => channel.target === null)

      expect(untargeted).toBeDefined()
      expect(untargeted?.percentComplete).toBeNull()
    })

    it('includes a metric with no approved target', () => {
      expect(
        nationalPerformance.find((metric) => metric.target === null),
      ).toBeDefined()
    })

    it('includes a zero-value metric', () => {
      const zero = nationalPerformance.find((metric) => metric.current === 0)

      expect(zero).toBeDefined()
      expect(zero?.value).toBe('$0.0B')
    })

    it('includes a pillar with no approved records', () => {
      expect(
        deliveryStatus.pillars.find((pillar) => pillar.total === 0),
      ).toBeDefined()
    })

    it('includes an unvalidated data source', () => {
      expect(
        nationalPerformance.find(
          (metric) => metric.confidence === 'requires-validation',
        ),
      ).toBeDefined()
    })

    it('offers a custom reporting period so the date picker is reachable', () => {
      expect(filters.reportingPeriods).toContainEqual(
        expect.objectContaining({ value: 'custom' }),
      )
    })
  })
})
