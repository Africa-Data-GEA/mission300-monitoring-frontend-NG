import { describe, expect, it } from 'vitest'
import { pillarDashboardOverviewSchema } from '@/api/schemas/pillar-dashboard'
import { buildPillarDashboard } from '@/mocks/data/pillar-dashboard'
import { PILLARS } from '@/types/domain'

function issuesOf(result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) {
  return result.success
    ? []
    : (result.error?.issues ?? []).map(
        (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      )
}

/**
 * Each pillar dashboard is derived from KPI Explorer, Programs and
 * Bottlenecks mock data rather than hand-authored, so this both checks the
 * contract and proves every pillar's headline-card KPI ids actually resolve
 * to a real catalogue entry.
 */
describe('Pillar dashboard mock data', () => {
  for (const pillar of PILLARS) {
    it(`builds a schema-valid dashboard for ${pillar}`, () => {
      const overview = buildPillarDashboard(pillar)
      expect(issuesOf(pillarDashboardOverviewSchema.safeParse(overview))).toEqual([])
    })

    it(`gives ${pillar} exactly four distinct headline cards`, () => {
      const overview = buildPillarDashboard(pillar)
      const kpiIds = overview.headlineCards.map((card) => card.kpiId)
      expect(kpiIds).toHaveLength(4)
      expect(new Set(kpiIds).size).toBe(4)
    })

    it(`only includes bottlenecks tagged to ${pillar}`, () => {
      const overview = buildPillarDashboard(pillar)
      for (const record of overview.bottlenecks) {
        expect(record.pillar, record.id).toBe(pillar)
      }
    })

    it(`only includes KPIs tagged to ${pillar}, including every headline card`, () => {
      const overview = buildPillarDashboard(pillar)
      for (const kpi of overview.kpis) {
        expect(kpi.pillar, kpi.id).toBe(pillar)
      }

      const kpiIds = new Set(overview.kpis.map((kpi) => kpi.id))
      for (const card of overview.headlineCards) {
        expect(kpiIds.has(card.kpiId), card.kpiId).toBe(true)
      }
    })
  }
})
