import { z } from 'zod'
import {
  dataConfidenceSchema,
  improvementDirectionSchema,
  metricIconNameSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  sourceTagSchema,
  trendSchema,
} from './common'
import { dashboardFilterValuesSchema } from './filters'
import { executionStatusSchema, pipelineReadinessSchema, statusHistoryEntrySchema } from './programs'

/**
 * ============================================================================
 * BACKEND TOLERANCE
 * ============================================================================
 *
 * The Nigeria backend (`ExecutiveOverviewController::show`) predates several
 * fields this frontend added, and returns a 200 without them. Validating
 * strictly meant the whole page failed with a ContractError and showed an
 * error state, which is a worse outcome than rendering everything the backend
 * *does* send.
 *
 * So the fields the backend omits are given defaults here, at the boundary, in
 * one visible place. Two rules govern what a default may be:
 *
 *   1. It must be EMPTY, never invented. `[]` and `null` are honest — they say
 *      "not supplied". A fabricated milestone or a guessed target would put a
 *      number on a government dashboard that no institution reported.
 *   2. Every consumer must already degrade visibly on the empty value. That is
 *      checked, not assumed: no milestone ticks on the bullet charts, no trend
 *      view on the national-performance rows, no evolution charts on the public
 *      gateway, no CPR caption. The absence is what tells a reader the backend
 *      has not caught up.
 *
 * REMOVE THESE DEFAULTS once the backend sends the fields. They are a bridge,
 * not the contract — the required shapes below are still what the API owes.
 * The gaps as of 2026-08-25: `cprTargets`, `kpiId` on all four headline cards,
 * `milestones`, `history`, `statusHistory`, `leadName`, `comment`,
 * `pipelineReadiness`, `followUp`, and period labels on both sparklines.
 */

/**
 * A period-labelled series that also accepts the backend's bare number array.
 *
 * `[52.0, 55.0, 58.5]` becomes `[{period: 'Period 1', value: 52}, ...]`. The
 * VALUES are real; only the labels are missing, and the schemas below document
 * that these arrays are ordered oldest-to-newest — so position is genuine
 * information and "Period 1" states it without inventing a reporting date.
 *
 * It is deliberately not a real-looking label. A chart axis reading "Q1 2024"
 * that this client made up would be indistinguishable from one the Ministry
 * reported, and that is exactly the confusion the provenance rules exist to
 * prevent.
 */
const periodSeriesSchema = z.preprocess(
  (input) =>
    Array.isArray(input) && input.every((entry) => typeof entry === 'number')
      ? input.map((value, index) => ({ period: `Period ${index + 1}`, value }))
      : input,
  z.array(z.object({ period: z.string().min(1), value: z.number() })),
)

/**
 * Contract for GET /api/executive-overview.
 *
 * Mirrors the page specification section by section — see
 * docs/specs/executive-overview.md. The workbook governs what appears here;
 * the wireframe governs how it looks.
 */

/* ------------------------------------------------------------------ *
 * Section A — Headline cards
 *
 * The specification is explicit that exactly four cards appear, each with a
 * distinct shape. Modelled as four named fields rather than an array so a
 * card cannot go missing without failing validation.
 * ------------------------------------------------------------------ */

/** An interim checkpoint between baseline and the 2030 target — stakeholder
 * feedback noted that a single distant target makes the current trajectory
 * hard to interpret without something nearer-term to check progress against. */
export const outcomeMilestoneSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
})

/** Mission 300 high-level outcome shown as baseline → current → 2030 target. */
export const compactOutcomeCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  value: z.string().min(1),
  current: z.number().min(0),
  baseline: z.number().min(0),
  target: z.number().positive(),
  scaleMin: z.number(),
  scaleMax: z.number(),
  reportingPeriod: z.string().min(1),
  baselineLabel: z.string(),
  targetLabel: z.string(),
  direction: improvementDirectionSchema,
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
  /** Empty where no intermediate checkpoints have been defined for this
   * outcome — the card then plots baseline/current/target only, as before. */
  // Defaulted: see BACKEND TOLERANCE. Empty means the bullet chart draws
  // baseline/current/target with no interim checkpoints.
  milestones: z.array(outcomeMilestoneSchema).default([]),
  /** The KPI Explorer profile this outcome rolls up from, where one exists,
   * so the "four CPR targets" summary can deep-link into it. Null for a
   * composite figure with no single backing profile. */
  // Defaulted: see BACKEND TOLERANCE. Null disables the KPI Explorer
  // deep-link, exactly as it already does for a composite figure.
  kpiId: z.string().nullable().default(null),
}).refine((card) => card.scaleMax > card.scaleMin, {
  message: 'scaleMax must be greater than scaleMin',
  path: ['scaleMax'],
})

/**
 * A2. Access-rate card.
 *
 * `sourceYear` is required, not decorative: the specification says the source
 * year must be visible at all times because the figure is an annual official
 * publication that must never be read as current-period data.
 */
export const accessRateCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  value: z.string().min(1),
  rawValue: z.number(),
  /** The backing KPI Explorer profile, for the "four CPR targets" deep link. */
  // Defaulted: see BACKEND TOLERANCE. Null disables the deep-link.
  kpiId: z.string().min(1).nullable().default(null),
  sourceYear: z.string().min(1),
  previousPublication: z.string(),
  targetLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
  /** Ordered oldest-to-newest readings, one per prior publication. Carries
   * the KPI profile's own period label per point (see BulletMetric.history's
   * comment) so a real time axis can be drawn, not just an unlabelled line. */
  sparkline: periodSeriesSchema.default([]),
})

/** A3. Available generation capacity, with a trend sparkline. */
export const generationCapacityCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  /** The backing KPI Explorer profile, for the "four CPR targets" deep link. */
  // Defaulted: see BACKEND TOLERANCE. Null disables the deep-link.
  kpiId: z.string().min(1).nullable().default(null),
  availableMw: z.number().min(0),
  installedMw: z.number().min(0),
  value: z.string().min(1),
  /** Available divided by installed, as a percentage. */
  availabilityRatio: z.number().min(0).max(100),
  /** Ordered oldest-to-newest readings. Two points minimum to draw a line.
   * Period-labelled, same reasoning as AccessRateCard.sparkline above. */
  sparkline: periodSeriesSchema.default([]),
  benchmarkLabel: z.string(),
  reportingPeriod: z.string().min(1),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
})

export const headlineCardsSchema = z.object({
  peopleWithElectricityAccess: compactOutcomeCardSchema,
  accessRate: accessRateCardSchema,
  generationCapacity: generationCapacityCardSchema,
  cleanCookingAccess: compactOutcomeCardSchema,
})

/* ------------------------------------------------------------------ *
 * Section B — Access delivery by channel
 * ------------------------------------------------------------------ */

/**
 * One delivery channel: grid connections, mini-grid connections, Solar Home
 * Systems.
 *
 * `target` and `percentComplete` are nullable on purpose. The specification
 * forbids inventing a grid-connection target from the access-rate commitment,
 * so until one is approved the card shows trend only and no progress bar.
 */
export const accessChannelSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  value: z.string().min(1),
  rawValue: z.number(),
  target: z.number().nullable(),
  targetLabel: z.string(),
  percentComplete: z.number().min(0).nullable(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
})

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
export const bulletMetricSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    pillar: pillarIdSchema,
    scaleMin: z.number(),
    scaleMax: z.number(),
    baseline: z.number(),
    current: z.number(),
    /** Expected value for the selected period; null when no trajectory exists. */
    expected: z.number().nullable(),
    /** Approved target; null when none is currently stated. */
    target: z.number().nullable(),
    direction: improvementDirectionSchema,
    value: z.string().min(1),
    targetLabel: z.string(),
    // The PHP controller explicitly emits null when a metric has no caption.
    // Normalize that wire value to the optional value the UI already expects.
    caption: z.preprocess((value) => (value === null ? undefined : value), z.string().optional()),
    trend: trendSchema.optional(),
    source: sourceTagSchema,
    confidence: dataConfidenceSchema,
    provenance: metricProvenanceSchema,
    /** Ordered oldest-to-newest readings, for the "trend view" toggle —
     * stakeholder feedback asked to see a target's evolution across the
     * reporting cycle, not only its current position. Carries the KPI
     * profile's own period label per point (not just the bare value) so a
     * consumer can plot a real time axis, e.g. the public gateway's
     * evolution charts — not just an unlabelled sparkline. */
    history: periodSeriesSchema.default([]),
  })
  // A degenerate scale would make every position zero, silently flattening the
  // chart rather than failing.
  .refine((metric) => metric.scaleMax > metric.scaleMin, {
    message: 'scaleMax must be greater than scaleMin',
    path: ['scaleMax'],
  })

/* ------------------------------------------------------------------ *
 * Section D — Delivery status, bottlenecks and decisions
 * ------------------------------------------------------------------ */

export const bottleneckSeveritySchema = z.enum([
  'critical',
  'regulatory',
  'delayed',
  'blocked',
])

/** One row of the ranked exception table. */
export const bottleneckSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string(),
  institution: z.string(),
  reference: z.string(),
  severity: bottleneckSeveritySchema,
  daysUnresolved: z.number().int().min(0),
  /** The register's free-text follow-up note — what's being done about it,
   * not just that it's unresolved. Shown in the exception's detail popover. */
  // Defaulted: see BACKEND TOLERANCE. Rendered as an em dash.
  followUp: z.string().default(''),
  provenance: metricProvenanceSchema,
})

export const deliveryStatusPanelSchema = z.object({
  ongoingProjects: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      programmeId: z.string().min(1),
      programmeName: z.string().min(1),
      pillar: pillarIdSchema,
      pillarLabel: z.string().min(1),
      owner: z.string().min(1),
      /** The named person leading delivery, distinct from `owner` (the
       * accountable institution). */
      // Defaulted: see BACKEND TOLERANCE. Rendered as an em dash.
      leadName: z.string().default(''),
      location: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      currentStatus: executionStatusSchema.exclude(['completed']),
      /** Null once a project is active — carried through from Programs so a
       * project still in the pipeline (not yet active delivery) is visible
       * here too, not only in the full Programs → Projects table. */
      // Defaulted: see BACKEND TOLERANCE. Null hides the readiness badge,
      // as it already does for a project in active delivery.
      pipelineReadiness: pipelineReadinessSchema.nullable().default(null),
      startDate: z.iso.datetime(),
      endDate: z.iso.datetime(),
      /** The workbook's "Comment – Issues/Main Risk/Bottlenecks" narrative,
       * surfaced here rather than requiring a click through to Programs. */
      // Defaulted: see BACKEND TOLERANCE.
      comment: z.string().default(''),
      /** Ordered oldest-to-newest status per reporting period. */
      // Defaulted: see BACKEND TOLERANCE. Empty makes the status-evolution
      // table say plainly that no history was supplied.
      statusHistory: z.array(statusHistoryEntrySchema).default([]),
    }),
  ),
  statusSummary: z.array(
    z.object({
      status: executionStatusSchema.exclude(['completed']),
      count: z.number().int().min(0),
    }),
  ),
  exceptions: z.array(bottleneckSchema),
  trend: trendSchema.optional(),
  provenance: metricProvenanceSchema,
})

/**
 * A summary strip explicitly framing the four headline cards as the
 * Compact Progress Report's tracked targets — stakeholder feedback asked
 * for the target section to be linked to CPR-target achievement rather than
 * left implicit in the headline cards alone.
 */
export const cprTargetSchema = z.object({
  title: z.string().min(1),
  value: z.string().min(1),
  baselineLabel: z.string().min(1),
  targetLabel: z.string().min(1),
  /** Null for a composite figure with no single backing KPI Explorer profile. */
  kpiId: z.string().nullable(),
})

/* ------------------------------------------------------------------ */

export const executiveOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  /** Echoes the pillar the payload was calculated for; 'all' for All Pillars. */
  appliedPillar: z.string(),
  headlineCards: headlineCardsSchema,
  /** Always the same four headline cards, reframed as CPR targets.
   * Defaulted: see BACKEND TOLERANCE. Empty hides the CPR caption entirely
   * rather than asserting a framing the backend did not send. The `.length(4)`
   * the contract owes is therefore relaxed to "four, or none". */
  cprTargets: z.union([z.array(cprTargetSchema).length(4), z.array(cprTargetSchema).max(0)]).default([]),
  accessDelivery: z.array(accessChannelSchema),
  nationalPerformance: z.array(bulletMetricSchema),
  deliveryStatus: deliveryStatusPanelSchema,
})

/**
 * Query accepted by GET /api/executive-overview.
 *
 * Identical to the global filter values: the page adds no page-specific
 * parameters, it passes the application-wide selection through.
 */
export const executiveOverviewQuerySchema =
  dashboardFilterValuesSchema.partial()

export type OutcomeMilestone = z.infer<typeof outcomeMilestoneSchema>
export type CompactOutcomeCard = z.infer<typeof compactOutcomeCardSchema>
export type CprTarget = z.infer<typeof cprTargetSchema>
export type AccessRateCard = z.infer<typeof accessRateCardSchema>
export type GenerationCapacityCard = z.infer<typeof generationCapacityCardSchema>
export type HeadlineCards = z.infer<typeof headlineCardsSchema>
export type AccessChannel = z.infer<typeof accessChannelSchema>
export type BulletMetric = z.infer<typeof bulletMetricSchema>
export type BottleneckSeverity = z.infer<typeof bottleneckSeveritySchema>
export type Bottleneck = z.infer<typeof bottleneckSchema>
export type OngoingProject = z.infer<
  typeof deliveryStatusPanelSchema.shape.ongoingProjects.element
>
export type ProjectStatusSummary = z.infer<
  typeof deliveryStatusPanelSchema.shape.statusSummary.element
>
export type DeliveryStatusPanel = z.infer<typeof deliveryStatusPanelSchema>
export type ExecutiveOverview = z.infer<typeof executiveOverviewSchema>
export type ExecutiveOverviewQuery = z.infer<typeof executiveOverviewQuerySchema>
