import { describe, expect, it } from 'vitest'
import {
  implementationRegisterFilterOptionsSchema,
  implementationRegisterOverviewSchema,
} from '@/api/schemas/implementation-register'
import {
  implementationRegisterActions,
  implementationRegisterFilterOptions,
  implementationRegisterMilestones,
  implementationRegisterOverview,
  implementationRegisterProgrammes,
  implementationRegisterProjects,
} from '@/mocks/data/implementation-register'

/**
 * The mock is what the app serves in development and what every other test
 * renders against, so it must satisfy the same schema the real backend will
 * be held to. Without this, a schema change surfaces as a runtime
 * ContractError in the browser rather than a failing test.
 */
describe('implementation register mock payload', () => {
  describe('schema conformance', () => {
    it('satisfies the Implementation Register contract', () => {
      const result = implementationRegisterOverviewSchema.safeParse(
        implementationRegisterOverview,
      )

      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })

    it('satisfies the filter options contract', () => {
      const result = implementationRegisterFilterOptionsSchema.safeParse(
        implementationRegisterFilterOptions,
      )

      const issues = result.success
        ? []
        : result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )

      expect(issues).toEqual([])
    })
  })

  describe('specification requirements', () => {
    it('provides all nine specified filter groups', () => {
      expect(Object.keys(implementationRegisterFilterOptions).sort()).toEqual(
        [
          'recordTypes',
          'pillars',
          'institutions',
          'lifecycleStages',
          'executionStatuses',
          'priorities',
          'bottleneckCategories',
          'validationStatuses',
          'reportingPeriods',
        ].sort(),
      )
    })

    it('gives every headline card complete provenance', () => {
      const cards = Object.values(implementationRegisterOverview.headlineCards)
      for (const card of cards) {
        expect(card.provenance.definition).toBeTruthy()
        expect(card.provenance.methodology).toBeTruthy()
        expect(card.provenance.source).toBeTruthy()
      }
    })
  })

  describe('internal consistency', () => {
    it('gives every programme, project, milestone and action a unique id', () => {
      const ids = [
        ...implementationRegisterProgrammes.map((row) => row.id),
        ...implementationRegisterProjects.map((row) => row.id),
        ...implementationRegisterMilestones.map((row) => row.id),
        ...implementationRegisterActions.map((row) => row.id),
      ]
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('links every project to a real programme', () => {
      const programmeIds = new Set(implementationRegisterProgrammes.map((row) => row.id))
      for (const project of implementationRegisterProjects) {
        expect(programmeIds.has(project.programmeId), project.id).toBe(true)
      }
    })

    it('links every milestone to a real project', () => {
      const projectIds = new Set(implementationRegisterProjects.map((row) => row.id))
      for (const milestone of implementationRegisterMilestones) {
        expect(projectIds.has(milestone.projectId), milestone.id).toBe(true)
      }
    })
  })

  describe('realistic edge cases', () => {
    /*
     * These exist on purpose so the UI is exercised against awkward real data
     * rather than only tidy values. Removing them weakens every test that
     * depends on the mock.
     */
    it('includes a programme with no current bottleneck', () => {
      expect(
        implementationRegisterProgrammes.some((row) => row.bottleneckCategory === null),
      ).toBe(true)
    })

    it('includes a project profile with no contractor yet appointed', () => {
      expect(
        implementationRegisterProjects.some((row) => row.profile.contractor === null),
      ).toBe(true)
    })

    it('includes a milestone completed ahead of its expected date', () => {
      expect(
        implementationRegisterMilestones.some(
          (row) =>
            row.status === 'completed' &&
            row.actualDate !== null &&
            row.actualDate < row.expectedDate,
        ),
      ).toBe(true)
    })

    it('includes an action with no dependency', () => {
      expect(implementationRegisterActions.some((row) => row.dependency === '')).toBe(true)
    })
  })
})
