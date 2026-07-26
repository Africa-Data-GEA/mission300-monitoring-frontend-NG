import { describe, expect, it } from 'vitest'
import {
  bottlenecksFilterOptionsSchema,
  bottlenecksOverviewSchema,
} from '@/api/schemas/bottlenecks'
import {
  bottlenecksFilterOptions,
  bottlenecksOverview,
} from '@/mocks/data/bottlenecks'

/**
 * The mock is what the app serves in development and what every other test
 * renders against, so it must satisfy the same schema the real backend will
 * be held to. Without this, a schema change surfaces as a runtime
 * ContractError in the browser rather than a failing test.
 */
describe('bottlenecks mock payload', () => {
  describe('schema conformance', () => {
    it('satisfies the Bottlenecks and Exceptions contract', () => {
      const result = bottlenecksOverviewSchema.safeParse(bottlenecksOverview)

      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })

    it('satisfies the filter options contract', () => {
      const result = bottlenecksFilterOptionsSchema.safeParse(bottlenecksFilterOptions)

      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })
  })

  describe('specification requirements', () => {
    /*
     * The specification restricts operational benchmarks to exactly four
     * headline alert cards — enforced in the schema with `.length(4)`, and
     * checked again here so the mock itself cannot silently drift.
     */
    it('provides exactly four headline alert cards', () => {
      expect(bottlenecksOverview.alerts).toHaveLength(4)
    })

    it('gives every alert card a lower-is-better trend', () => {
      // Every alert targets zero, so a rising count is always a worsening.
      for (const alert of bottlenecksOverview.alerts) {
        expect(alert.trend.direction, alert.title).toBe('lower-is-better')
      }
    })

    it('gives every alert card complete provenance', () => {
      for (const alert of bottlenecksOverview.alerts) {
        expect(alert.provenance.definition, alert.title).toBeTruthy()
        expect(alert.provenance.methodology, alert.title).toBeTruthy()
        expect(alert.provenance.source, alert.title).toBeTruthy()
      }
    })

    it('provides all nine specified filter groups', () => {
      expect(Object.keys(bottlenecksFilterOptions).sort()).toEqual(
        [
          'severities',
          'categories',
          'institutions',
          'pillars',
          'linkedRecords',
          'lifecycleStages',
          'escalationStatuses',
          'validationStatuses',
          'reportingPeriods',
        ].sort(),
      )
    })
  })

  describe('internal consistency', () => {
    it('gives every register record a unique id', () => {
      const ids = bottlenecksOverview.register.items.map((row) => row.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('gives every escalation record a unique id', () => {
      const ids = bottlenecksOverview.escalations.items.map((row) => row.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('links every escalation to a real register record', () => {
      const registerIds = new Set(
        bottlenecksOverview.register.items.map((row) => row.id),
      )
      for (const escalation of bottlenecksOverview.escalations.items) {
        expect(registerIds.has(escalation.bottleneckId), escalation.id).toBe(true)
      }
    })

    it('matches each lifecycle stage total to the sum of its severities', () => {
      for (const stage of bottlenecksOverview.byLifecycleStage) {
        const sum = stage.bySeverity.reduce((total, entry) => total + entry.count, 0)
        expect(sum, stage.label).toBe(stage.total)
      }
    })

    it('ranks institutions with more high-or-critical records first', () => {
      const counts = bottlenecksOverview.byInstitution.map(
        (row) => row.criticalOrHighCount,
      )
      const sorted = [...counts].sort((a, b) => b - a)
      expect(counts).toEqual(sorted)
    })
  })

  describe('realistic edge cases', () => {
    /*
     * These exist on purpose so the UI is exercised against awkward real data
     * rather than only tidy values. Removing them weakens every test that
     * depends on the mock.
     */
    it('includes a record with no linked implementation record', () => {
      expect(
        bottlenecksOverview.register.items.some((row) => row.linkedRecord === ''),
      ).toBe(true)
    })

    it('includes a resolved escalation with a resolution and evidence', () => {
      expect(
        bottlenecksOverview.escalations.items.some(
          (row) => row.status === 'resolved' && row.resolution && row.evidenceUrl,
        ),
      ).toBe(true)
    })

    it('includes an overdue escalation', () => {
      expect(
        bottlenecksOverview.escalations.items.some((row) => row.status === 'overdue'),
      ).toBe(true)
    })

    it('includes an escalation not yet due', () => {
      expect(
        bottlenecksOverview.escalations.items.some((row) => row.daysOverdue < 0),
      ).toBe(true)
    })
  })
})
