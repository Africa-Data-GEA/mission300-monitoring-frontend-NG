import { describe, expect, it } from 'vitest'
import {
  kpiExplorerFilterOptionsSchema,
  kpiExplorerOverviewSchema,
  kpiProfileSchema,
} from '@/api/schemas/kpi-explorer'
import {
  getKpiProfile,
  kpiExplorerCatalogue,
  kpiExplorerFilterOptions,
  kpiExplorerOverview,
} from '@/mocks/data/kpi-explorer'

function issuesOf(result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) {
  return result.success
    ? []
    : (result.error?.issues ?? []).map(
        (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      )
}

/**
 * The mock is what the app serves in development and what every test renders
 * against, so it must satisfy the same schema the real backend is held to.
 * Without this, a schema change surfaces as a runtime ContractError in the
 * browser rather than a failing test.
 */
describe('KPI Explorer mock data', () => {
  it('satisfies the overview contract', () => {
    expect(issuesOf(kpiExplorerOverviewSchema.safeParse(kpiExplorerOverview)))
      .toEqual([])
  })

  it('satisfies the filter options contract', () => {
    expect(
      issuesOf(kpiExplorerFilterOptionsSchema.safeParse(kpiExplorerFilterOptions)),
    ).toEqual([])
  })

  it('returns a schema-valid profile for every catalogue row', () => {
    for (const row of kpiExplorerCatalogue) {
      const profile = getKpiProfile(row.id)
      expect(profile, row.id).toBeDefined()
      expect(issuesOf(kpiProfileSchema.safeParse(profile)), row.id).toEqual([])
    }
  })

  it('returns undefined for an unknown indicator id', () => {
    expect(getKpiProfile('does-not-exist')).toBeUndefined()
  })

  describe('internal consistency', () => {
    it('sums each pillar status breakdown to the pillar total', () => {
      for (const pillar of kpiExplorerOverview.pillarDistribution) {
        const sum = pillar.byStatus.reduce((total, s) => total + s.count, 0)
        expect(sum, pillar.label).toBe(pillar.total)
      }
    })

    it('matches the total-indicators summary to the catalogue length', () => {
      const totalCard = kpiExplorerOverview.summary.find(
        (card) => card.id === 'total-indicators',
      )
      expect(totalCard?.count).toBe(kpiExplorerCatalogue.length)
    })

    it('matches the readiness distribution counts to the catalogue', () => {
      for (const tier of kpiExplorerOverview.readinessDistribution) {
        const actual = kpiExplorerCatalogue.filter(
          (row) => row.readiness === tier.tier,
        ).length
        expect(tier.count, tier.label).toBe(actual)
      }
    })

    it('gives every catalogue row a unique identifier', () => {
      const ids = kpiExplorerCatalogue.map((row) => row.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    /*
     * Deliberate edge cases the UI must handle: a public-source value (not
     * yet institutionally confirmed) and a value requiring validation, per
     * the M300 KPI Matrix's own vocabulary — neither must read as confirmed.
     */
    it('includes a public-source indicator', () => {
      expect(
        kpiExplorerCatalogue.some((row) => row.validationStatus === 'public-source'),
      ).toBe(true)
    })

    it('includes a requires-validation indicator', () => {
      expect(
        kpiExplorerCatalogue.some((row) => row.validationStatus === 'requires-validation'),
      ).toBe(true)
    })

    it('includes an indicator with no current value yet', () => {
      const profiles = kpiExplorerCatalogue.map((row) => getKpiProfile(row.id))
      expect(profiles.some((profile) => profile?.current === null)).toBe(true)
    })
  })
})
