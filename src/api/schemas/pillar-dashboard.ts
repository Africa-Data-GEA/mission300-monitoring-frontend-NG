import { z } from 'zod'
import { bottleneckRecordSchema } from './bottlenecks'
import { metricProvenanceSchema, pillarIdSchema, trendSchema } from './common'
import { executionStatusSchema } from './programs'
import { kpiCatalogueRowSchema, validationStatusSchema } from './kpi-explorer'

/**
 * Contract for a Compact pillar dashboard (`/pillars/:pillar`).
 *
 * Deliberately has no entities of its own. Per docs/database-structure.md,
 * a pillar dashboard is a FILTERED VIEW over data that already exists:
 * headline cards are real KPI Explorer profiles (kpi-explorer.ts) selected
 * for this pillar, and the delivery/bottleneck panel is Programs
 * (programs.ts) and Bottlenecks (bottlenecks.ts) records filtered by the
 * same `pillar` field they already carry. This is what makes the dashboard
 * genuinely connected to the KPI Matrix rather than a re-typed copy of it.
 *
 * Scope for this pass: Section A (headline cards) and Section F-equivalent
 * (delivery status + ranked bottlenecks), per the six pillar specifications
 * in docs/specs/. The bespoke diagnostic sections (generation-by-fuel bars,
 * transmission corridor rankings, milestone trackers, etc.) are a distinct
 * follow-up, not attempted here.
 */

/** One headline card, sourced from a real KpiProfile (kpiId is the join key). */
export const pillarHeadlineCardSchema = z.object({
  kpiId: z.string().min(1),
  title: z.string().min(1),
  value: z.string().min(1),
  rawValue: z.number().nullable(),
  targetLabel: z.string().min(1),
  target: z.number().nullable(),
  trend: trendSchema.optional(),
  validationStatus: validationStatusSchema,
  provenance: metricProvenanceSchema,
})

/** Delivery status of this pillar's programmes and projects. */
export const pillarDeliveryStatusSchema = z.object({
  counts: z.array(
    z.object({
      status: executionStatusSchema,
      count: z.number().int().min(0),
    }),
  ),
  total: z.number().int().min(0),
})

/** Response shape for GET /api/pillars/:pillar. */
export const pillarDashboardOverviewSchema = z.object({
  pillar: pillarIdSchema,
  label: z.string().min(1),
  lastUpdated: z.iso.datetime(),
  headlineCards: z.array(pillarHeadlineCardSchema).length(4),
  deliveryStatus: pillarDeliveryStatusSchema,
  /** Ranked top-5 open bottlenecks for this pillar. */
  bottlenecks: z.array(bottleneckRecordSchema).max(5),
  /** Every KPI Matrix indicator tagged to this pillar, not just the four
   * headline cards — the same catalogue rows KPI Explorer reads. */
  kpis: z.array(kpiCatalogueRowSchema),
})

export type PillarHeadlineCard = z.infer<typeof pillarHeadlineCardSchema>
export type PillarDeliveryStatus = z.infer<typeof pillarDeliveryStatusSchema>
export type PillarDashboardOverview = z.infer<typeof pillarDashboardOverviewSchema>
