import { z } from 'zod'
import { bottleneckRecordSchema } from './bottlenecks'
import {
  improvementDirectionSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  trendSchema,
} from './common'
import { discoComparisonRowSchema } from './state-disco'
import { executionStatusSchema, milestoneRecordSchema, programmeRecordSchema, projectRecordSchema } from './programs'
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
 * The payload also carries the programmes/projects that contribute to the
 * pillar result and, for Financially Viable Utilities, the shared DisCo
 * comparison rows. This lets the page show delivery evidence instead of
 * repeating KPI metadata beneath the headline indicators.
 */

/** One headline card, sourced from a real KpiProfile (kpiId is the join key). */
export const pillarHeadlineCardSchema = z.object({
  kpiId: z.string().min(1),
  title: z.string().min(1),
  value: z.string().min(1),
  rawValue: z.number().nullable(),
  unit: z.string().min(1),
  /** Which reporting period `rawValue` is as of (e.g. "Q4 2025"). Null
   * where there's no value yet to date. */
  period: z.string().nullable(),
  /** Null where the indicator has no stated Compact baseline. */
  baseline: z.number().nullable(),
  baselineLabel: z.string(),
  targetLabel: z.string().min(1),
  target: z.number().nullable(),
  /** See `targetBasis` on kpiProfileSchema — carried through so the card can
   * distinguish "no target agreed" from "target exists, in another unit". */
  targetBasis: z.enum(['level', 'growth-rate', 'none']).optional(),
  targetBasisLabel: z.string().optional(),
  /**
   * Which way is good. Without it the card cannot tell progress from
   * regression: a lower-is-better indicator like ATC&C at 34.81% against a
   * 20% target computes as "174% to target" on a bare current/target ratio.
   */
  direction: improvementDirectionSchema,
  trend: trendSchema.optional(),
  validationStatus: validationStatusSchema,
  provenance: metricProvenanceSchema,
})

/**
 * One Core/Tier 1 KPI Matrix indicator for this pillar beyond the four
 * headline cards — real current/target values from the same KpiProfile the
 * KPI Directory reads, grouped for a clean analytics layout rather than
 * dumped as one long list. `group` is curated per pillar (e.g. "Metering
 * coverage", "Tariffs") rather than derived from the catalogue's generic
 * `category` field, which doesn't align with how these read well together.
 */
export const pillarCoreIndicatorSchema = z.object({
  kpiId: z.string().min(1),
  name: z.string().min(1),
  group: z.string().min(1),
  unit: z.string().min(1),
  current: z.number().nullable(),
  target: z.number().nullable(),
  /** Null where the indicator has no stated Compact baseline. */
  baseline: z.number().nullable(),
  baselineLabel: z.string(),
  /** Human-readable status text for a `unit: 'status'` milestone indicator
   * (e.g. "Not yet achieved", "In progress") — the milestone tracker reads
   * this instead of `current`/`target`, which stay null for binary KPIs. */
  currentLabel: z.string(),
  targetLabel: z.string(),
  /** Which reporting period `current` is as of (e.g. "Q4 2025"). Null
   * where there's no value yet to date. */
  period: z.string().nullable(),
  direction: z.enum(['higher-is-better', 'lower-is-better']),
  /** Ordered oldest-to-newest reading values, for a sparkline. Empty where
   * no historical series is available yet (e.g. a pending milestone metric). */
  history: z.array(z.number()),
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
  /** Core/Tier 1 indicators beyond the four headline cards. Empty for
   * pillars that don't yet have this expanded coverage. */
  coreIndicators: z.array(pillarCoreIndicatorSchema),
  deliveryStatus: pillarDeliveryStatusSchema,
  /** Ranked top-5 open bottlenecks for this pillar. */
  bottlenecks: z.array(bottleneckRecordSchema).max(5),
  /** Real Milestone records (programs.ts's own milestoneRecordSchema) for
   * projects in this pillar - not a KPI standing in for one. Empty until
   * someone actually creates a milestone against a project here. */
  milestones: z.array(milestoneRecordSchema),
  /** Delivery records that contribute to this pillar's aggregate results. */
  programmes: z.array(programmeRecordSchema),
  projects: z.array(projectRecordSchema),
  /** Utility-level evidence for the Financially Viable Utilities pillar. */
  discoPerformance: z.array(discoComparisonRowSchema),
  /** Every KPI Matrix indicator tagged to this pillar, not just the four
   * headline cards — the same catalogue rows KPI Explorer reads. */
  kpis: z.array(kpiCatalogueRowSchema),
})

export type PillarHeadlineCard = z.infer<typeof pillarHeadlineCardSchema>
export type PillarCoreIndicator = z.infer<typeof pillarCoreIndicatorSchema>
export type PillarDeliveryStatus = z.infer<typeof pillarDeliveryStatusSchema>
export type PillarDashboardOverview = z.infer<typeof pillarDashboardOverviewSchema>
