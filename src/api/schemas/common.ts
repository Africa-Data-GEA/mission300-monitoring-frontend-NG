import { z } from 'zod'

/**
 * ============================================================================
 * SHARED CONTRACT PRIMITIVES
 * ============================================================================
 *
 * These schemas are the single source of truth for the API contract between
 * this frontend and the gApp backend.
 *
 * WHY SCHEMAS RATHER THAN INTERFACES
 *   - TypeScript types are erased at build time, so a wrong shape from the
 *     backend surfaces as `undefined` deep inside a component. A schema
 *     validates at the boundary and names the offending field.
 *   - Types are inferred from the schema with `z.infer`, so there is one
 *     definition, not a type and a validator that can drift apart.
 *   - The schemas can be rendered to OpenAPI for the backend team.
 *
 * RULE: never hand-write an interface for an API payload. Define the schema
 * here (or in a sibling file) and infer the type from it.
 */

/** The six Compact pillars. IDs are stable and used in URLs and API filters. */
export const pillarIdSchema = z.enum([
  'generation-network',
  'last-mile-access',
  'financially-viable-utilities',
  'private-sector-participation',
  'regional-integration',
  'clean-cooking',
])

/**
 * Delivery status vocabulary.
 *
 * `limited-data` and `provisional` are distinct from a performance judgement:
 * they mean the dashboard cannot yet assert whether something is performing,
 * which the specification requires be shown plainly rather than defaulting to
 * "at risk".
 */
export const deliveryStatusSchema = z.enum([
  'completed',
  'on-track',
  'at-risk',
  'lagging',
  'delayed',
  'blocked',
  'limited-data',
  'provisional',
])

/** How much the underlying figure can be trusted. */
export const dataConfidenceSchema = z.enum([
  'confirmed',
  'requires-validation',
  'future-gap',
])

/** Provenance badge shown on a metric. */
export const sourceTagSchema = z.enum([
  'live',
  'live-cpr',
  'public-source',
  'indicative',
  'requires-validation',
])

/**
 * Direction in which a metric improves.
 *
 * Critical for arrow colouring: ATC&C losses and tariff shortfall improve as
 * they FALL, so a downward arrow must render green for those metrics.
 */
export const improvementDirectionSchema = z.enum([
  'higher-is-better',
  'lower-is-better',
])

/**
 * Semantic icon name. The API sends a name, not an icon, so the backend stays
 * independent of the icon library. Resolved in src/config/metric-icons.tsx.
 */
export const metricIconNameSchema = z.enum([
  'access',
  'metering',
  'losses',
  'capital',
  'generation',
  'cooking',
  'milestones',
  'pillars',
  'kpis',
  'escalations',
  'institutions',
  'generic',
])

/** Period-on-period movement attached to a metric. */
export const trendSchema = z.object({
  /** Signed change against the previous comparable period. */
  change: z.number(),
  /** Rendering hint, e.g. "target 100% by 2027". */
  label: z.string(),
  direction: improvementDirectionSchema,
})

/**
 * The definition/methodology payload behind every information icon.
 *
 * The specification requires all four parts for every metric, so none are
 * optional — a backend that omits one fails validation rather than shipping a
 * card with an empty popover.
 */
export const metricProvenanceSchema = z.object({
  definition: z.string().min(1),
  methodology: z.string().min(1),
  source: z.string().min(1),
  /** ISO 8601 timestamp. */
  lastUpdated: z.iso.datetime(),
})

export type PillarId = z.infer<typeof pillarIdSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
export type DataConfidence = z.infer<typeof dataConfidenceSchema>
export type SourceTag = z.infer<typeof sourceTagSchema>
export type ImprovementDirection = z.infer<typeof improvementDirectionSchema>
export type MetricIconName = z.infer<typeof metricIconNameSchema>
export type Trend = z.infer<typeof trendSchema>
export type MetricProvenance = z.infer<typeof metricProvenanceSchema>

export const PILLARS = pillarIdSchema.options

export const PILLAR_LABELS: Record<PillarId, string> = {
  'generation-network': 'Generation & network',
  'last-mile-access': 'Last-mile access',
  'financially-viable-utilities': 'Viable utilities',
  'private-sector-participation': 'Private sector',
  'regional-integration': 'Regional integration',
  'clean-cooking': 'Clean cooking',
}
