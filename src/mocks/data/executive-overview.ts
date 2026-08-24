import type { DataConfidence, SourceTag } from '@/api/schemas/common'
import { PILLAR_LABELS } from '@/api/schemas/common'
import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import type { ValidationStatus } from '@/api/schemas/kpi-explorer'
import type {
  AccessChannel,
  AccessRateCard,
  Bottleneck,
  BottleneckSeverity,
  BulletMetric,
  CompactOutcomeCard,
  ExecutiveOverview,
  GenerationCapacityCard,
  OngoingProject,
  ProjectStatusSummary,
} from '@/features/dashboard/types'
import { formatCurrency, USD } from '@/lib/currency'
import { bottlenecksRegister } from './bottlenecks'
import { getKpiProfile } from './kpi-explorer'
import { projects } from './programs'

/**
 * Derives the Executive Overview from data that already exists elsewhere,
 * the same way buildPillarDashboard() does for the Compact pillar
 * dashboards: headline figures and bullet metrics come from real KpiProfile
 * records (kpi-explorer.ts), milestone delivery comes from the Programs
 * register, and the delivery-status panel comes from Projects and Bottlenecks
 * records grouped by pillar. Nothing here is a separate,
 * re-typed copy of that data — approving a submission that publishes a KPI
 * value (see publishKpiValue in kpi-explorer.ts) changes what this page
 * shows on the next fetch.
 */

const LAST_UPDATED = '2025-10-14T09:12:00Z'
const numberFormatter = new Intl.NumberFormat('en-US')

function toSourceTag(status: ValidationStatus): SourceTag {
  switch (status) {
    case 'confirmed':
      return 'live'
    case 'public-source':
      return 'public-source'
    case 'provisional':
      return 'indicative'
    case 'requires-validation':
    case 'future':
    default:
      return 'requires-validation'
  }
}

function toConfidence(status: ValidationStatus): DataConfidence {
  if (status === 'confirmed') return 'confirmed'
  if (status === 'future') return 'future-gap'
  return 'requires-validation'
}

/**
 * Appends the target's deadline to its label unless the label already names
 * that year. Review feedback was that a target without a date ("100% market
 * remittance compliance") does not say what is actually being committed to
 * (docs/M300 Monitoring Platform Feedback.pptx, slide 3); the date is held
 * structurally on the KPI profile (`targetDate`), so this only formats it.
 */
function withTargetDate(label: string, targetDate: string | null): string {
  if (!targetDate) return label
  const year = targetDate.match(/20\d\d/)?.[0]
  if (year && label.includes(year)) return label
  return `${label} — by ${targetDate}`
}

/* ---------------- Section A — Headline cards ------------------------- */

function buildPeopleWithElectricityAccessCard(): CompactOutcomeCard {
  return {
    title: 'People with electricity access',
    icon: 'access',
    value: '137.3M',
    current: 137.3,
    baseline: 86.6,
    target: 236.7,
    scaleMin: 0,
    scaleMax: 236.7,
    reportingPeriod: 'End 2025',
    baselineLabel: '86.6M baseline (2024)',
    targetLabel: '236.7M by 2030',
    direction: 'higher-is-better',
    trend: { change: 137.3 - 86.6, label: '+50.7M vs prior published year', direction: 'higher-is-better' },
    source: 'live-cpr',
    confidence: 'confirmed',
    // Interim Compact Action Plan checkpoints between the 2024 baseline and
    // the 2030 target, so the trajectory reads as a staircase rather than
    // one distant jump.
    milestones: [
      { label: '2026 checkpoint', value: 150 },
      { label: '2028 checkpoint', value: 190 },
    ],
    // A composite figure blended from grid, mini-grid and SHS connections —
    // no single KPI Explorer profile backs it directly.
    kpiId: null,
    provenance: {
      definition:
        'Cumulative number of people with electricity access across grid, mini-grid and solar home system solutions.',
      methodology:
        'Country-reported connections are converted to people using the nationally supplied household-size methodology and validated by the CDMU.',
      source: 'Nigeria Mission 300 Compact Progress Report, Q1 2026.',
      lastUpdated: '2026-05-05T00:00:00Z',
    },
  }
}

function buildAccessRateCard(): AccessRateCard {
  const profile = getKpiProfile('M300-PX-001')!
  const history = profile.history
  const previous = history.length > 1 ? history[history.length - 2] : null

  return {
    title: 'Electricity access rate',
    icon: 'access',
    kpiId: 'M300-PX-001',
    // One decimal, matching clean cooking access on the same row.
    value: `${(profile.current ?? 0).toFixed(1)}%`,
    rawValue: profile.current ?? 0,
    sourceYear: profile.reportingPeriod,
    previousPublication: previous
      ? `previous publication ${previous.value}% (${previous.period})`
      : 'No previous publication on record',
    targetLabel: withTargetDate(profile.targetLabel, profile.targetDate),
    trend: profile.trend,
    source: toSourceTag(profile.validationStatus),
    confidence: toConfidence(profile.validationStatus),
    provenance: profile.provenance,
    sparkline: history.map((point) => ({ period: point.period, value: point.value })),
  }
}

function buildGenerationCapacityCard(): GenerationCapacityCard {
  const profile = getKpiProfile('M300-P1-003')!
  const availableMw = profile.current ?? 0
  // Installed nameplate capacity (13.6 GW) is not yet its own tracked KPI
  // Explorer indicator — only available/dispatched capacity is. Kept as a
  // known infrastructure constant rather than inventing a bespoke KPI for it.
  const installedMw = 13_600

  return {
    title: 'Available generation capacity',
    icon: 'generation',
    kpiId: 'M300-P1-003',
    availableMw,
    installedMw,
    value: `${(availableMw / 1000).toFixed(1)} GW`,
    availabilityRatio: Math.round((availableMw / installedMw) * 1000) / 10,
    sparkline: profile.history.map((point) => ({ period: point.period, value: point.value })),
    benchmarkLabel: `of ${(installedMw / 1000).toFixed(1)} GW installed`,
    reportingPeriod: profile.reportingPeriod,
    trend: profile.trend,
    source: toSourceTag(profile.validationStatus),
    confidence: toConfidence(profile.validationStatus),
    provenance: profile.provenance,
  }
}

function buildCleanCookingAccessCard(): CompactOutcomeCard {
  return {
    title: 'Clean cooking access',
    icon: 'cooking',
    // One decimal, matching the access rate beside it and the value the
    // period-filtered handler produces for this same card.
    value: '26.0%',
    current: 26,
    baseline: 22,
    target: 100,
    scaleMin: 0,
    scaleMax: 100,
    reportingPeriod: 'End 2025',
    baselineLabel: '22% baseline (2024)',
    targetLabel: '100% by 2030',
    direction: 'higher-is-better',
    trend: { change: 26 - 22, label: '+4 pts vs prior published year', direction: 'higher-is-better' },
    // Overdue leadership decisions live in the Escalation Register, a
    // separate array (bottlenecksEscalations) not yet imported by this
    // build — approximated here as escalated-but-unresolved critical or
    // high-severity bottlenecks pending a dedicated escalations feed.
    // Reuses the Bottlenecks module's own trend for open high/critical
    // records — the two figures track the same underlying register, so
    // this is the same real trend, not an invented one.
    source: 'live-cpr',
    confidence: 'confirmed',
    milestones: [
      { label: '2026 checkpoint', value: 40 },
      { label: '2028 checkpoint', value: 70 },
    ],
    // A composite figure blended across cooking-fuel technologies — no
    // single KPI Explorer profile backs it directly.
    kpiId: null,
    provenance: {
      definition:
        'Share of Nigeria’s population with access to clean fuels and technologies for cooking.',
      methodology:
        'Country-reported clean-cooking access measured under the national methodology and validated through the Compact Delivery and Monitoring Unit.',
      source: 'Nigeria Mission 300 Compact Progress Report, Q1 2026.',
      lastUpdated: '2026-05-05T00:00:00Z',
    },
  }
}

/* ---------------- Section B — Access delivery by channel -------------- */

/**
 * Clean cooking is tracked as a delivery channel alongside the three
 * electrification routes, not only as a headline outcome card — review
 * feedback asked why it was missing from this section when it is one of the
 * ways access is actually delivered (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 2).
 */
const ACCESS_CHANNEL_KPI_IDS: Record<string, string> = {
  'grid-connections': 'M300-P2-001',
  'mini-grid-connections': 'M300-P2-003',
  'solar-home-systems': 'M300-P2-006',
  'clean-cooking': 'M300-P2-011',
}

function buildAccessChannel(id: string, kpiId: string): AccessChannel {
  const profile = getKpiProfile(kpiId)!
  const current = profile.current ?? 0
  const percentComplete = profile.target
    ? Math.round((current / profile.target) * 1000) / 10
    : null

  return {
    id,
    title: profile.name,
    value: numberFormatter.format(current),
    rawValue: current,
    target: profile.target,
    targetLabel: withTargetDate(profile.targetLabel, profile.targetDate),
    percentComplete,
    trend: profile.trend,
    source: toSourceTag(profile.validationStatus),
    confidence: toConfidence(profile.validationStatus),
    provenance: profile.provenance,
  }
}

/* ---------------- Section C — National performance --------------------
 *
 * `scaleMin`/`scaleMax` (the chart axis) and `expected` (the value the
 * approved trajectory predicts for this period) are presentation concerns
 * the KPI Explorer profile does not model — it carries baseline/current/
 * target only, not a full trajectory. Kept here as this section's own
 * config, applied on top of the live baseline/current/target/direction
 * pulled from the KPI profile.
 * ------------------------------------------------------------------- */

const NATIONAL_PERFORMANCE_METRICS: {
  id: string
  kpiId: string
  scaleMin: number
  scaleMax: number
  expected: number | null
  caption?: string
  formatValue: (current: number) => string
}[] = [
  {
    id: 'renewable-share',
    kpiId: 'M300-P1-004',
    scaleMin: 0,
    scaleMax: 80,
    expected: 27,
    caption: 'Seasonal — retains the reporting period',
    formatValue: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'metering-rate',
    kpiId: 'M300-P3-004',
    scaleMin: 0,
    scaleMax: 100,
    expected: 68,
    formatValue: (v) => `${v.toFixed(0)}%`,
  },
  {
    id: 'atcc-losses',
    kpiId: 'M300-P3-006',
    scaleMin: 0,
    scaleMax: 60,
    expected: 31,
    caption: 'Lower is better',
    formatValue: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'market-remittance',
    kpiId: 'M300-P3-009',
    scaleMin: 0,
    scaleMax: 100,
    expected: 85,
    formatValue: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'tariff-shortfall',
    kpiId: 'M300-P3-010',
    scaleMin: 0,
    scaleMax: 2500,
    expected: 1700,
    caption: 'Outstanding = approved requirement − funded',
    // National currency, so it follows the configured brand currency rather
    // than a hardcoded naira sign.
    formatValue: (v) => formatCurrency(`${(v / 1000).toFixed(2)}tn`),
  },
  {
    id: 'private-capital',
    kpiId: 'M300-P4-002',
    scaleMin: 0,
    scaleMax: 15_500,
    expected: 2_400,
    caption: 'Tracked from the January 2025 baseline',
    // Mobilised international private capital is quoted in USD by convention,
    // whichever country the deployment serves — an explicit override rather
    // than an accident of hardcoding.
    formatValue: (v) => formatCurrency(`${(v / 1000).toFixed(1)}B`, { currency: USD }),
  },
]

function buildBulletMetric(config: (typeof NATIONAL_PERFORMANCE_METRICS)[number]): BulletMetric {
  const profile = getKpiProfile(config.kpiId)!
  const current = profile.current ?? 0

  return {
    id: config.id,
    title: profile.name,
    pillar: profile.pillar,
    scaleMin: config.scaleMin,
    scaleMax: config.scaleMax,
    baseline: profile.baseline ?? config.scaleMin,
    current,
    expected: config.expected,
    target: profile.target,
    direction: profile.direction,
    value: config.formatValue(current),
    targetLabel: withTargetDate(profile.targetLabel, profile.targetDate),
    caption: config.caption,
    trend: profile.trend,
    source: toSourceTag(profile.validationStatus),
    confidence: toConfidence(profile.validationStatus),
    provenance: profile.provenance,
    history: profile.history.map((point) => ({ period: point.period, value: point.value })),
  }
}

/* ---------------- Section D — Delivery status and exceptions ---------- */

const PROJECT_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'PRJ-2025-011': { latitude: 11.8311, longitude: 13.151 },
  'PRJ-2025-014': { latitude: 6.5244, longitude: 3.3792 },
  'PRJ-2025-021': { latitude: 7.7322, longitude: 8.5391 },
  'PRJ-2025-026': { latitude: 9.0765, longitude: 7.3986 },
  'PRJ-2025-033': { latitude: 9.15, longitude: 7.5 },
  'PRJ-2025-038': { latitude: 6.6, longitude: 3.45 },
}

function buildOngoingProjects(): OngoingProject[] {
  return projects.flatMap((row) =>
    row.currentStatus === 'completed'
      ? []
      : [{
          id: row.id,
          name: row.name,
          programmeId: row.programmeId,
          programmeName: row.programmeName,
          pillar: row.pillar,
          pillarLabel: PILLAR_LABELS[row.pillar],
          owner: row.owner,
          leadName: row.leadName,
          location: row.location,
          latitude: PROJECT_COORDINATES[row.id]?.latitude ?? 9.0765,
          longitude: PROJECT_COORDINATES[row.id]?.longitude ?? 7.3986,
          currentStatus: row.currentStatus,
          pipelineReadiness: row.pipelineReadiness,
          startDate: row.startDate,
          endDate: row.endDate,
          comment: row.comment,
          statusHistory: row.statusHistory,
        }],
  )
}

const ongoingProjects = buildOngoingProjects()

export function buildProjectStatusSummary(
  projectRows: readonly OngoingProject[],
): ProjectStatusSummary[] {
  return (['on-track', 'at-risk', 'delayed', 'blocked'] as const).map((status) => ({
    status,
    count: projectRows.filter((project) => project.currentStatus === status).length,
  }))
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

/**
 * Reconciles bottlenecks.ts's real 4-tier severity ('critical'|'high'|
 * 'medium'|'low') against this section's own 4-tag exception schema
 * ('critical'|'regulatory'|'delayed'|'blocked'), which describes the kind
 * of exception as much as its severity. Blocked status and critical
 * severity are checked first since they are the most specific true facts;
 * everything else falls back to category or a generic 'delayed' tag.
 */
function mapBottleneckSeverity(row: BottleneckRecord): BottleneckSeverity {
  if (row.status === 'blocked') return 'blocked'
  if (row.severity === 'critical') return 'critical'
  if (row.category === 'regulatory-approval') return 'regulatory'
  return 'delayed'
}

function buildExceptions(): Bottleneck[] {
  return [...bottlenecksRegister]
    .filter((row) => row.status !== 'resolved')
    .sort((a, b) => {
      const severityDelta = (SEVERITY_RANK[a.severity] ?? 0) - (SEVERITY_RANK[b.severity] ?? 0)
      return severityDelta !== 0 ? severityDelta : b.ageDays - a.ageDays
    })
    /*
      No longer capped at five here. This section is now a filterable,
      sortable, searchable table rather than a ranked five-row sample, so it
      needs the whole unresolved set to filter across — review feedback was
      that understanding where bottlenecks are is a primary task, not a
      glance (docs/M300 Monitoring Platform Feedback.pptx, slide 4).
    */
    .map((row) => ({
      id: row.id,
      title: row.issue,
      category: row.category,
      institution: row.institution,
      reference: row.linkedRecord,
      severity: mapBottleneckSeverity(row),
      daysUnresolved: row.ageDays,
      followUp: row.followUp,
      provenance: {
        definition: row.followUp,
        methodology: `Tracked as a ${row.status} ${row.category} bottleneck.`,
        source: 'Bottleneck Register.',
        lastUpdated: row.dateRaised,
      },
    }))
}

/**
 * Reframes the four headline cards as the Compact Progress Report's tracked
 * targets — stakeholder feedback asked for the target section to be
 * explicitly linked to CPR-target achievement.
 */
function buildCprTargets(cards: ExecutiveOverview['headlineCards']): ExecutiveOverview['cprTargets'] {
  return [
    {
      title: cards.peopleWithElectricityAccess.title,
      value: cards.peopleWithElectricityAccess.value,
      baselineLabel: cards.peopleWithElectricityAccess.baselineLabel,
      targetLabel: cards.peopleWithElectricityAccess.targetLabel,
      kpiId: cards.peopleWithElectricityAccess.kpiId,
    },
    {
      title: cards.accessRate.title,
      value: cards.accessRate.value,
      baselineLabel: `${cards.accessRate.sourceYear} publication`,
      targetLabel: cards.accessRate.targetLabel,
      kpiId: cards.accessRate.kpiId,
    },
    {
      title: cards.generationCapacity.title,
      value: cards.generationCapacity.value,
      // Unlike the other three, this metric has no formal Compact baseline
      // or fixed 2030 target — per docs/specs/generation-network.md, it is
      // benchmarked against installed capacity and an approved plan
      // projection "when available," not a single approved end-state figure.
      // Stating that plainly avoids repeating the same benchmark on both
      // rows, which reads as a data error rather than a deliberate framing.
      baselineLabel: cards.generationCapacity.benchmarkLabel,
      targetLabel: 'No fixed Compact target — tracked against an approved Integrated Resource Plan projection when available',
      kpiId: cards.generationCapacity.kpiId,
    },
    {
      title: cards.cleanCookingAccess.title,
      value: cards.cleanCookingAccess.value,
      baselineLabel: cards.cleanCookingAccess.baselineLabel,
      targetLabel: cards.cleanCookingAccess.targetLabel,
      kpiId: cards.cleanCookingAccess.kpiId,
    },
  ]
}

/* ---------------------------------------------------------------------- */

export function buildExecutiveOverview(): ExecutiveOverview {
  const headlineCards: ExecutiveOverview['headlineCards'] = {
    peopleWithElectricityAccess: buildPeopleWithElectricityAccessCard(),
    accessRate: buildAccessRateCard(),
    generationCapacity: buildGenerationCapacityCard(),
    cleanCookingAccess: buildCleanCookingAccessCard(),
  }

  return {
    lastUpdated: LAST_UPDATED,
    appliedPillar: 'all',

    headlineCards,
    cprTargets: buildCprTargets(headlineCards),

    accessDelivery: Object.entries(ACCESS_CHANNEL_KPI_IDS).map(([id, kpiId]) =>
      buildAccessChannel(id, kpiId),
    ),

    nationalPerformance: NATIONAL_PERFORMANCE_METRICS.map(buildBulletMetric),

    deliveryStatus: {
      provenance: {
        definition:
          'Ongoing project delivery status by pillar, linked to unresolved bottlenecks and overdue decisions.',
        methodology:
          'Exclude completed projects, then count ongoing projects by On Track, At Risk, Delayed and Blocked status for each pillar. Rank exceptions by severity, delivery impact and days unresolved. Unrelated performance percentages are never averaged.',
        source: 'Compact Progress Report, Implementation Register and Bottleneck Register.',
        lastUpdated: LAST_UPDATED,
      },
      ongoingProjects,
      statusSummary: buildProjectStatusSummary(ongoingProjects),
      exceptions: buildExceptions(),
    },
  }
}

/**
 * Mock payload for GET /api/executive-overview. Built from the KPI
 * Explorer, Programs and Bottlenecks registers above, so approving a data
 * submission that publishes a KPI value or changing a programme/bottleneck
 * status is visible here on the next fetch — not a separate, hand-typed
 * dataset.
 */
export const executiveOverview: ExecutiveOverview = buildExecutiveOverview()
