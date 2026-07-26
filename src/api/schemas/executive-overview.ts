import { z } from 'zod'
import {
  dataConfidenceSchema,
  deliveryStatusSchema,
  improvementDirectionSchema,
  metricIconNameSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  sourceTagSchema,
  trendSchema,
} from './common'
import { dashboardFilterValuesSchema } from './filters'

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

/** A1. Wide progress card with the delivery-status breakdown. */
export const milestoneDeliveryCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  /** Percentage of due priority milestones completed on schedule. */
  percentComplete: z.number().min(0).max(100),
  breakdown: z.array(
    z.object({
      status: deliveryStatusSchema,
      label: z.string().min(1),
      count: z.number().int().min(0),
    }),
  ),
  baselineLabel: z.string(),
  targetLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  provenance: metricProvenanceSchema,
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
  sourceYear: z.string().min(1),
  previousPublication: z.string(),
  targetLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
})

/** A3. Available generation capacity, with a trend sparkline. */
export const generationCapacityCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  availableMw: z.number().min(0),
  installedMw: z.number().min(0),
  value: z.string().min(1),
  /** Available divided by installed, as a percentage. */
  availabilityRatio: z.number().min(0).max(100),
  /** Ordered oldest-to-newest readings. Two points minimum to draw a line. */
  sparkline: z.array(z.number()),
  benchmarkLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
})

/**
 * A4. Critical escalations alert card.
 *
 * Improvement means the count going DOWN, so the trend direction is
 * lower-is-better and a falling count renders green.
 */
export const escalationsCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  unresolvedCritical: z.number().int().min(0),
  overdueDecisions: z.number().int().min(0),
  longestDaysUnresolved: z.number().int().min(0),
  targetLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  provenance: metricProvenanceSchema,
})

export const headlineCardsSchema = z.object({
  milestoneDelivery: milestoneDeliveryCardSchema,
  accessRate: accessRateCardSchema,
  generationCapacity: generationCapacityCardSchema,
  escalations: escalationsCardSchema,
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
    caption: z.string().optional(),
    trend: trendSchema.optional(),
    source: sourceTagSchema,
    confidence: dataConfidenceSchema,
    provenance: metricProvenanceSchema,
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
  provenance: metricProvenanceSchema,
})

/** Per-pillar record counts, rendered as a horizontal stacked bar. */
export const pillarDeliveryStatusSchema = z
  .object({
    pillar: pillarIdSchema,
    label: z.string().min(1),
    counts: z.array(
      z.object({
        status: deliveryStatusSchema,
        count: z.number().int().min(0),
      }),
    ),
    total: z.number().int().min(0),
  })
  // The bar divides each count by the total, so a mismatch would render
  // segments that do not fill the bar.
  .refine(
    (entry) =>
      entry.counts.reduce((sum, count) => sum + count.count, 0) === entry.total,
    { message: 'counts must sum to total', path: ['total'] },
  )

export const deliveryStatusPanelSchema = z.object({
  pillars: z.array(pillarDeliveryStatusSchema),
  exceptions: z.array(bottleneckSchema),
  trend: trendSchema.optional(),
  provenance: metricProvenanceSchema,
})

/* ------------------------------------------------------------------ */

export const executiveOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  /** Echoes the pillar the payload was calculated for; 'all' for All Pillars. */
  appliedPillar: z.string(),
  headlineCards: headlineCardsSchema,
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

export type MilestoneDeliveryCard = z.infer<typeof milestoneDeliveryCardSchema>
export type AccessRateCard = z.infer<typeof accessRateCardSchema>
export type GenerationCapacityCard = z.infer<typeof generationCapacityCardSchema>
export type EscalationsCard = z.infer<typeof escalationsCardSchema>
export type HeadlineCards = z.infer<typeof headlineCardsSchema>
export type AccessChannel = z.infer<typeof accessChannelSchema>
export type BulletMetric = z.infer<typeof bulletMetricSchema>
export type BottleneckSeverity = z.infer<typeof bottleneckSeveritySchema>
export type Bottleneck = z.infer<typeof bottleneckSchema>
export type PillarDeliveryStatus = z.infer<typeof pillarDeliveryStatusSchema>
export type DeliveryStatusPanel = z.infer<typeof deliveryStatusPanelSchema>
export type ExecutiveOverview = z.infer<typeof executiveOverviewSchema>
export type ExecutiveOverviewQuery = z.infer<typeof executiveOverviewQuerySchema>
