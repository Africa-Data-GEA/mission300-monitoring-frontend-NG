import { describe, expect, it } from 'vitest'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'

/**
 * The live Nigeria backend's Executive Overview payload, byte-for-byte as
 * `ExecutiveOverviewController::show()` builds it
 * (mission300-monitoring-backend-NG/api/src/App/Controllers/ExecutiveOverviewController.php).
 *
 * WHY THIS TEST EXISTS. The backend omits eleven fields this frontend added
 * later, and the tolerance defaults in the schema are what let `/dashboard`
 * render against it at all. Those defaults are easy to delete by accident
 * while "tidying up" a schema, and the failure mode is not a red test — it is
 * a blank error state in production against the real API.
 *
 * So this pins the exact shape the backend actually sends. If it goes red,
 * either the backend changed (good — then delete the matching default and this
 * fixture's gap) or someone tightened a schema without checking what the
 * backend serves (bad). Either way the answer is here rather than in a browser.
 *
 * It also asserts the defaults land as EMPTY, never invented — a milestone or
 * a target conjured by this client would be indistinguishable from one an
 * institution reported.
 */
const provenance = {
  definition: 'Nigerians with an active electricity connection, grid or off-grid.',
  methodology: 'National access rate multiplied by mid-year population estimate.',
  source: 'World Bank / SDG7 tracking publication',
  lastUpdated: '2025-09-30T00:00:00Z',
}
const trend = (change: number, label: string, direction: string) => ({ change, label, direction })

const backendPayload = {
  lastUpdated: '2025-10-14T09:12:00Z',
  appliedPillar: 'all',
  headlineCards: {
    peopleWithElectricityAccess: {
      title: 'People with electricity access',
      icon: 'access',
      value: '137.3M',
      current: 137300000,
      baseline: 86600000,
      target: 236700000,
      scaleMin: 0,
      scaleMax: 236700000,
      reportingPeriod: 'Q3 2025',
      baselineLabel: '86.6M in 2024',
      targetLabel: '236.7M by 2030',
      direction: 'higher-is-better',
      trend: trend(50700000, '+50.7M vs prior published year', 'higher-is-better'),
      source: 'public-source',
      confidence: 'confirmed',
      provenance,
      // NOTE: no `milestones`, no `kpiId`.
    },
    accessRate: {
      title: 'Electricity access rate',
      icon: 'access',
      value: '70.0%',
      rawValue: 70.0,
      sourceYear: '2024',
      previousPublication: '61.0% (2023)',
      targetLabel: 'Approved 9% annual improvement commitment',
      trend: trend(9, '+9pts vs prior published year', 'higher-is-better'),
      source: 'public-source',
      confidence: 'confirmed',
      provenance,
      // Bare numbers, not { period, value } — the gap periodSeriesSchema covers.
      sparkline: [52.0, 55.0, 58.5, 61.0, 70.0],
      // NOTE: no `kpiId`.
    },
    generationCapacity: {
      title: 'Available generation capacity',
      icon: 'generation',
      availableMw: 5400,
      installedMw: 13600,
      value: '5.4 GW',
      availabilityRatio: 39.7,
      sparkline: [4800, 5000, 5100, 5250, 5400],
      benchmarkLabel: 'Integrated Resource Plan target not yet approved',
      reportingPeriod: 'Q3 2025',
      trend: trend(150, '+150MW vs prior period', 'higher-is-better'),
      source: 'live',
      confidence: 'confirmed',
      provenance,
      // NOTE: no `kpiId`.
    },
    cleanCookingAccess: {
      title: 'Clean cooking access',
      icon: 'cooking',
      value: '26.0%',
      current: 26,
      baseline: 22,
      target: 100,
      scaleMin: 0,
      scaleMax: 100,
      reportingPeriod: 'Q3 2025',
      baselineLabel: '22% in 2024',
      targetLabel: '100% by 2030',
      direction: 'higher-is-better',
      trend: trend(4, '+4 pts vs prior published year', 'higher-is-better'),
      source: 'requires-validation',
      confidence: 'requires-validation',
      provenance,
      // NOTE: no `milestones`, no `kpiId`.
    },
  },
  // NOTE: no `cprTargets` at all.
  accessDelivery: [
    {
      id: 'grid-connections',
      title: 'New grid connections',
      value: '412,000',
      rawValue: 412000,
      target: null,
      targetLabel: 'Annual target to be confirmed',
      percentComplete: null,
      trend: trend(38000, '+38,000 vs prior period', 'higher-is-better'),
      source: 'live',
      confidence: 'confirmed',
      provenance,
    },
  ],
  nationalPerformance: [
    {
      id: 'renewable-share',
      title: 'Renewable Energy Share in Generation Mix',
      pillar: 'generation-network',
      scaleMin: 0,
      scaleMax: 100,
      baseline: 18,
      current: 27.4,
      expected: 30,
      target: 50,
      direction: 'higher-is-better',
      value: '27.4%',
      targetLabel: '50% by 2030',
      caption: 'Seasonal — retains the reporting period',
      trend: trend(2.1, '+2.1pts vs prior period', 'higher-is-better'),
      source: 'live',
      confidence: 'confirmed',
      provenance,
      // NOTE: no `history`.
    },
  ],
  deliveryStatus: {
    ongoingProjects: [
      {
        id: 'PRJ-2025-0142',
        name: 'Kaduna 132kV Feeder Reinforcement',
        programmeId: 'PRG-0031',
        programmeName: 'Northern Grid Reinforcement Programme',
        pillar: 'generation-network',
        pillarLabel: 'Generation & Network',
        owner: 'Transmission Company of Nigeria',
        location: 'Kaduna State',
        latitude: 10.5222,
        longitude: 7.4383,
        currentStatus: 'at-risk',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-12-15T00:00:00Z',
        // NOTE: no `leadName`, `pipelineReadiness`, `comment`, `statusHistory`.
      },
    ],
    statusSummary: [{ status: 'at-risk', count: 1 }],
    exceptions: [
      {
        id: 'BTL-2025-0088',
        title: 'Transmission evacuation constraint limiting dispatch, North East',
        category: 'technical-constraint',
        institution: 'Transmission Company of Nigeria',
        reference: 'IMP-2025-0055',
        severity: 'critical',
        daysUnresolved: 46,
        provenance,
        // NOTE: no `followUp`.
      },
    ],
    trend: trend(-3, '-3 exceptions vs prior period', 'lower-is-better'),
    provenance,
  },
}

describe('the live backend payload against the Executive Overview contract', () => {
  it('validates, so /dashboard renders instead of showing an error state', () => {
    const result = executiveOverviewSchema.safeParse(backendPayload)

    // Naming the offending fields beats "expected true, got false" when this
    // is the test standing between a schema edit and a blank production page.
    const failures = result.success
      ? []
      : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)

    expect(failures).toEqual([])
  })

  it('fills the gaps with empty values, never invented ones', () => {
    const data = executiveOverviewSchema.parse(backendPayload)

    expect(data.cprTargets).toEqual([])
    expect(data.headlineCards.peopleWithElectricityAccess.milestones).toEqual([])
    expect(data.headlineCards.peopleWithElectricityAccess.kpiId).toBeNull()
    expect(data.headlineCards.accessRate.kpiId).toBeNull()
    expect(data.headlineCards.generationCapacity.kpiId).toBeNull()
    expect(data.nationalPerformance[0]?.history).toEqual([])
    expect(data.deliveryStatus.ongoingProjects[0]?.statusHistory).toEqual([])
    expect(data.deliveryStatus.ongoingProjects[0]?.leadName).toBe('')
    expect(data.deliveryStatus.ongoingProjects[0]?.pipelineReadiness).toBeNull()
    expect(data.deliveryStatus.exceptions[0]?.followUp).toBe('')
  })

  it('keeps the real sparkline values and labels them by position only', () => {
    const data = executiveOverviewSchema.parse(backendPayload)

    // The values are the backend's own. Only the labels are ours, and they
    // say "position in an ordered series" rather than impersonating a
    // reporting period the Ministry never published.
    expect(data.headlineCards.accessRate.sparkline).toEqual([
      { period: 'Period 1', value: 52.0 },
      { period: 'Period 2', value: 55.0 },
      { period: 'Period 3', value: 58.5 },
      { period: 'Period 4', value: 61.0 },
      { period: 'Period 5', value: 70.0 },
    ])
  })

  it('accepts the null captions emitted for most backend metrics', () => {
    const payload = structuredClone(backendPayload) as unknown as {
      nationalPerformance: Array<Record<string, unknown>>
    }
    payload.nationalPerformance[0]!.caption = null

    const data = executiveOverviewSchema.parse(payload)

    expect(data.nationalPerformance[0]?.caption).toBeUndefined()
  })

  it('still accepts a fully-populated payload once the backend catches up', () => {
    const complete = structuredClone(backendPayload) as Record<string, unknown>
    complete.cprTargets = [1, 2, 3, 4].map((n) => ({
      title: `Target ${n}`,
      value: '1',
      baselineLabel: 'b',
      targetLabel: 't',
      kpiId: null,
    }))

    expect(executiveOverviewSchema.safeParse(complete).success).toBe(true)
  })
})
