import { describe, expect, it } from 'vitest'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { dashboardFilterOptionsSchema } from '@/api/schemas/filters'
import { executiveOverview } from '@/mocks/data/executive-overview'
import { filterOptions } from '@/mocks/data/filters'
import type { FilterOption } from '@/types/filters'

/**
 * The mock payload doubles as the worked example handed to the gApp backend
 * team, so it must stay internally consistent and match the page
 * specification. These tests guard the qualities real data must also have.
 */
const { headlineCards, accessDelivery, nationalPerformance, deliveryStatus } =
  executiveOverview

const allCards = [
  headlineCards.peopleWithElectricityAccess,
  headlineCards.accessRate,
  headlineCards.generationCapacity,
  headlineCards.cleanCookingAccess,
]

describe('executive overview mock payload', () => {
  /*
   * The mock is what the app serves in development and what every other test
   * renders against, so it must satisfy the same schema the real backend will
   * be held to. Without this, a schema change would surface as a runtime
   * ContractError in the browser rather than a failing test.
   */
  describe('schema conformance', () => {
    it('satisfies the Executive Overview contract', () => {
      const result = executiveOverviewSchema.safeParse(executiveOverview)

      // Surface the offending fields rather than a bare boolean.
      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })

    it('satisfies the filter options contract', () => {
      const result = dashboardFilterOptionsSchema.safeParse(filterOptions)

      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })
  })

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

    it('provides only ongoing projects with coordinates for map rendering', () => {
      expect(deliveryStatus.ongoingProjects).not.toHaveLength(0)
      for (const project of deliveryStatus.ongoingProjects) {
        expect(project.currentStatus).not.toBe('completed')
        expect(project.latitude).toBeGreaterThanOrEqual(-90)
        expect(project.latitude).toBeLessThanOrEqual(90)
        expect(project.longitude).toBeGreaterThanOrEqual(-180)
        expect(project.longitude).toBeLessThanOrEqual(180)
      }
    })

    it('provides all seven specified filter groups', () => {
      expect(Object.keys(filterOptions).sort()).toEqual(
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

    it('keeps every bullet metric inside its own declared scale', () => {
      for (const metric of nationalPerformance) {
        expect(metric.scaleMax, metric.id).toBeGreaterThan(metric.scaleMin)
        expect(metric.current, metric.id).toBeGreaterThanOrEqual(metric.scaleMin)
        expect(metric.current, metric.id).toBeLessThanOrEqual(metric.scaleMax)
        expect(metric.baseline, metric.id).toBeGreaterThanOrEqual(metric.scaleMin)
        expect(metric.baseline, metric.id).toBeLessThanOrEqual(metric.scaleMax)
      }
    })

    it('keeps every compact outcome card inside its own declared scale', () => {
      for (const card of [headlineCards.peopleWithElectricityAccess, headlineCards.cleanCookingAccess]) {
        expect(card.scaleMax, card.title).toBeGreaterThan(card.scaleMin)
        expect(card.current, card.title).toBeGreaterThanOrEqual(card.scaleMin)
        expect(card.current, card.title).toBeLessThanOrEqual(card.scaleMax)
        expect(card.baseline, card.title).toBeGreaterThanOrEqual(card.scaleMin)
        expect(card.baseline, card.title).toBeLessThanOrEqual(card.scaleMax)
      }
    })

    it('gives every filter option a unique value and a label', () => {
      // Object.entries widens the value type, so restate it for the loop.
      const groups = Object.entries(filterOptions) as ReadonlyArray<
        [string, readonly FilterOption[]]
      >

      for (const [group, options] of groups) {
        const values = options.map((option) => option.value)
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

    it('includes an unvalidated data source', () => {
      expect(
        nationalPerformance.find(
          (metric) => metric.confidence === 'requires-validation',
        ),
      ).toBeDefined()
    })

    it('offers a custom reporting period so the date picker is reachable', () => {
      expect(filterOptions.reportingPeriods).toContainEqual(
        expect.objectContaining({ value: 'custom' }),
      )
    })
  })
})
