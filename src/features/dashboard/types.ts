import type {
  DataConfidence,
  DeliveryStatus,
  ImprovementDirection,
  MetricIconName,
  MetricProvenance,
  PillarId,
  SourceTag,
  Trend,
} from '@/types/domain'

/**
 * Response shape for GET /api/executive-overview.
 *
 * Structured to mirror the page specification exactly — sections A to E of
 * docs/specs/executive-overview.md. The workbook governs what appears here;
 * the wireframe governs how it looks.
 *
 * Mirrored by the MSW handler in src/mocks/handlers.ts and documented in
 * docs/API.md — all three must change together.
 */

/* ------------------------------------------------------------------ *
 * Section A — Headline cards
 *
 * The specification is explicit that exactly four cards appear, each with a
 * distinct shape. They are modelled as four named fields rather than an array
 * so a card cannot go missing without a type error.
 * ------------------------------------------------------------------ */

/** A1. Wide progress card with the delivery-status breakdown. */
export interface MilestoneDeliveryCard {
  readonly title: string
  readonly icon: MetricIconName
  /** Percentage of due priority milestones completed on schedule (0–100). */
  readonly percentComplete: number
  readonly caption: string
  readonly breakdown: ReadonlyArray<{
    readonly status: DeliveryStatus
    readonly label: string
    readonly count: number
  }>
  readonly baselineLabel: string
  readonly targetLabel: string
  readonly trend?: Trend
  readonly source: SourceTag
  readonly provenance: MetricProvenance
}

/**
 * A2. Access-rate card.
 *
 * `sourceYear` is a required field, not a caption: the specification says the
 * source year must be visible at all times because the figure is an annual
 * official publication that must never be read as current-period data.
 */
export interface AccessRateCard {
  readonly title: string
  readonly icon: MetricIconName
  readonly value: string
  readonly rawValue: number
  readonly sourceYear: string
  readonly previousPublication: string
  readonly targetLabel: string
  readonly trend?: Trend
  readonly source: SourceTag
  readonly confidence: DataConfidence
  readonly provenance: MetricProvenance
}

/** A3. Available generation capacity, with a trend sparkline. */
export interface GenerationCapacityCard {
  readonly title: string
  readonly icon: MetricIconName
  readonly availableMw: number
  readonly installedMw: number
  readonly value: string
  /** Available divided by installed, as a percentage. */
  readonly availabilityRatio: number
  /** Ordered oldest-to-newest available-capacity readings for the sparkline. */
  readonly sparkline: readonly number[]
  readonly benchmarkLabel: string
  readonly trend?: Trend
  readonly source: SourceTag
  readonly confidence: DataConfidence
  readonly provenance: MetricProvenance
}

/**
 * A4. Critical escalations alert card.
 *
 * Improvement here means the count going DOWN, so the trend direction is
 * lower-is-better and a falling count renders green.
 */
export interface EscalationsCard {
  readonly title: string
  readonly icon: MetricIconName
  readonly unresolvedCritical: number
  readonly overdueDecisions: number
  readonly longestDaysUnresolved: number
  readonly targetLabel: string
  readonly trend?: Trend
  readonly source: SourceTag
  readonly provenance: MetricProvenance
}

export interface HeadlineCards {
  readonly milestoneDelivery: MilestoneDeliveryCard
  readonly accessRate: AccessRateCard
  readonly generationCapacity: GenerationCapacityCard
  readonly escalations: EscalationsCard
}

/* ------------------------------------------------------------------ *
 * Section B — Access delivery by channel
 * ------------------------------------------------------------------ */

/**
 * One delivery channel: grid connections, mini-grid connections, Solar Home
 * Systems.
 *
 * `target` is nullable on purpose. The specification forbids inventing a grid
 * connection target from the access-rate commitment, so until one is approved
 * the card must show period-on-period trend only and no progress bar.
 */
export interface AccessChannel {
  readonly id: string
  readonly title: string
  readonly value: string
  readonly rawValue: number
  readonly target: number | null
  readonly targetLabel: string
  /** Null when no target is approved — render trend only, no progress bar. */
  readonly percentComplete: number | null
  readonly trend?: Trend
  readonly source: SourceTag
  readonly confidence: DataConfidence
  readonly provenance: MetricProvenance
}

/* ------------------------------------------------------------------ *
 * Section C — National performance and target progress
 * ------------------------------------------------------------------ */

/**
 * A metric rendered as a horizontal bullet chart.
 *
 * Each metric carries its own scale because they are not comparable: a
 * percentage, a currency total and a loss rate share no axis. `expected` is
 * the value the approved trajectory predicts for the selected period, which is
 * what turns "we are at 55%" into "we are behind".
 */
export interface BulletMetric {
  readonly id: string
  readonly title: string
  readonly pillar: PillarId
  readonly scaleMin: number
  readonly scaleMax: number
  readonly baseline: number
  readonly current: number
  /** Expected value for the selected period; null when no trajectory exists. */
  readonly expected: number | null
  /** Approved target; null when none is currently stated. */
  readonly target: number | null
  readonly direction: ImprovementDirection
  readonly value: string
  readonly targetLabel: string
  readonly caption?: string
  readonly trend?: Trend
  readonly source: SourceTag
  readonly confidence: DataConfidence
  readonly provenance: MetricProvenance
}

/* ------------------------------------------------------------------ *
 * Section D — Delivery status, bottlenecks and decisions
 * ------------------------------------------------------------------ */

/** Per-pillar record counts, rendered as a horizontal stacked bar. */
export interface PillarDeliveryStatus {
  readonly pillar: PillarId
  readonly label: string
  readonly counts: ReadonlyArray<{
    readonly status: DeliveryStatus
    readonly count: number
  }>
  readonly total: number
}

export type BottleneckSeverity =
  | 'critical'
  | 'regulatory'
  | 'delayed'
  | 'blocked'

/** One row of the ranked exception table. */
export interface Bottleneck {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly institution: string
  readonly reference: string
  readonly severity: BottleneckSeverity
  readonly daysUnresolved: number
  readonly provenance: MetricProvenance
}

export interface DeliveryStatusPanel {
  readonly pillars: readonly PillarDeliveryStatus[]
  readonly exceptions: readonly Bottleneck[]
  readonly trend?: Trend
  readonly provenance: MetricProvenance
}

/* ------------------------------------------------------------------ *
 * Section E — Filters
 * ------------------------------------------------------------------ */

export interface FilterOption {
  readonly value: string
  readonly label: string
}

/**
 * The seven filters the specification requires. Options are server-driven so
 * adding an institution or DisCo does not need a frontend release.
 *
 * Geographic scope, Distribution Company and Technology sit under a "More
 * filters" disclosure per the specification, which notes they only affect
 * metrics supporting those breakdowns.
 */
export interface ExecutiveOverviewFilters {
  readonly reportingPeriods: readonly FilterOption[]
  readonly pillars: readonly FilterOption[]
  readonly institutions: readonly FilterOption[]
  readonly priorities: readonly FilterOption[]
  readonly geographicScopes: readonly FilterOption[]
  readonly distributionCompanies: readonly FilterOption[]
  readonly technologies: readonly FilterOption[]
}

export interface ExecutiveOverviewQuery {
  readonly period?: string
  readonly pillar?: string
  readonly institution?: string
  readonly priority?: string
  readonly geographicScope?: string
  readonly distributionCompany?: string
  readonly technology?: string
}

/* ------------------------------------------------------------------ */

export interface ExecutiveOverview {
  readonly filters: ExecutiveOverviewFilters
  readonly lastUpdated: string
  /** Echoes the pillar the payload was calculated for; 'all' for All Pillars. */
  readonly appliedPillar: string
  readonly headlineCards: HeadlineCards
  readonly accessDelivery: readonly AccessChannel[]
  readonly nationalPerformance: readonly BulletMetric[]
  readonly deliveryStatus: DeliveryStatusPanel
}
