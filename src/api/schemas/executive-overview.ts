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
import { executionStatusSchema } from './programs'

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
  sourceYear: z.string().min(1),
  previousPublication: z.string(),
  targetLabel: z.string(),
  trend: trendSchema.optional(),
  source: sourceTagSchema,
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,
  /** Ordered oldest-to-newest readings, one per prior publication. */
  sparkline: z.array(z.number()),
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
      location: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      currentStatus: executionStatusSchema.exclude(['completed']),
      startDate: z.iso.datetime(),
      endDate: z.iso.datetime(),
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

export type CompactOutcomeCard = z.infer<typeof compactOutcomeCardSchema>
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
