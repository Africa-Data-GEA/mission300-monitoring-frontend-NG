import { z } from 'zod'
import {
  dataConfidenceSchema,
  improvementDirectionSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  trendSchema,
} from './common'
import { filterOptionSchema } from './filters'
import { paginated } from './administration'

/**
 * Contract for the KPI Explorer module.
 *
 * Specification: docs/specs/kpi-explorer.md
 *
 * This page is the authoritative indicator catalogue and technical drill-down.
 * The specification is explicit that the KPI identifier is shown HERE for
 * traceability, but not on executive or pillar cards — so `id` is first-class
 * on these shapes in a way it is not elsewhere.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

/**
 * Readiness tier. The specification pairs these terms — "Core or Tier 1",
 * "Supporting or Tier 2" — so the values keep the meaningful half.
 */
export const readinessTierSchema = z.enum(['core', 'supporting', 'future'])

/**
 * Validation status of an indicator's current value.
 *
 * `provisional` and `pending` are distinct: the specification says pending
 * values must NOT be treated as confirmed, and provisional is a published-but-
 * caveated value. `data-gap` means no value exists at all.
 */
export const validationStatusSchema = z.enum([
  'confirmed',
  'provisional',
  'pending',
  'data-gap',
])

/* ------------------------------------------------------------------ *
 * Section A — Catalogue summary
 * ------------------------------------------------------------------ */

/**
 * A catalogue/readiness summary card.
 *
 * The specification stresses these "are not performance targets" — they are
 * counts describing the catalogue itself, so they carry no trend or progress.
 */
export const catalogueSummaryCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  count: z.number().int().min(0),
  breakdown: z.array(
    z.object({
      label: z.string().min(1),
      count: z.number().int().min(0),
    }),
  ),
  provenance: metricProvenanceSchema,
})

/* ------------------------------------------------------------------ *
 * Section B — Catalogue table row
 * ------------------------------------------------------------------ */

export const kpiCatalogueRowSchema = z.object({
  /** Human-facing identifier, e.g. "M300-GEN-004". Shown for traceability. */
  id: z.string().min(1),
  name: z.string().min(1),
  pillar: pillarIdSchema,
  category: z.string().min(1),
  unit: z.string().min(1),
  sourceInstitution: z.string().min(1),
  frequency: z.string().min(1),
  readiness: readinessTierSchema,
  validationStatus: validationStatusSchema,
  lastUpdated: z.iso.datetime(),
})

/* ------------------------------------------------------------------ *
 * Section C — KPI profile (the drill-down)
 * ------------------------------------------------------------------ */

/** One point on the indicator's value history, for the trend chart. */
export const kpiHistoryPointSchema = z.object({
  period: z.string().min(1),
  value: z.number(),
  validationStatus: validationStatusSchema,
})

/** A delivery record linked to the indicator via its identifier. */
export const linkedRecordSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['programme', 'project', 'milestone', 'action']),
  title: z.string().min(1),
  institution: z.string(),
  status: z.string().min(1),
})

/**
 * The full indicator profile. Fetched on demand for one indicator, so it is a
 * separate endpoint rather than being inlined into every catalogue row.
 */
export const kpiProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pillar: pillarIdSchema,

  // Metadata panel — shown "exactly as configured".
  definition: z.string().min(1),
  formula: z.string().min(1),
  unit: z.string().min(1),
  aggregation: z.string(),
  frequency: z.string(),
  disaggregation: z.string(),
  limitations: z.string(),

  // Values panel.
  baseline: z.number().nullable(),
  baselineLabel: z.string(),
  current: z.number().nullable(),
  currentLabel: z.string(),
  target: z.number().nullable(),
  targetLabel: z.string(),
  /** Signed variance against target, following the configured direction. */
  varianceLabel: z.string(),
  direction: improvementDirectionSchema,
  trend: trendSchema.optional(),
  history: z.array(kpiHistoryPointSchema),

  // Traceability panel.
  sourceInstitution: z.string().min(1),
  sourceReference: z.string(),
  reportingPeriod: z.string(),
  validationStatus: validationStatusSchema,
  validationDecision: z.string(),
  version: z.string(),
  confidence: dataConfidenceSchema,
  provenance: metricProvenanceSchema,

  linkedRecords: z.array(linkedRecordSchema),
})

/* ------------------------------------------------------------------ *
 * Section D — Distribution by pillar and readiness
 * ------------------------------------------------------------------ */

export const pillarDistributionSchema = z.object({
  pillar: pillarIdSchema,
  label: z.string().min(1),
  total: z.number().int().min(0),
  /** Value-availability split; the four statuses must sum to `total`. */
  byStatus: z.array(
    z.object({
      status: validationStatusSchema,
      count: z.number().int().min(0),
    }),
  ),
})

export const readinessDistributionSchema = z.object({
  tier: readinessTierSchema,
  label: z.string().min(1),
  count: z.number().int().min(0),
})

/* ------------------------------------------------------------------ *
 * Filters — this module has its own eight
 * ------------------------------------------------------------------ */

export const kpiExplorerFilterOptionsSchema = z.object({
  pillars: z.array(filterOptionSchema),
  categories: z.array(filterOptionSchema),
  readinessTiers: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  sourceInstitutions: z.array(filterOptionSchema),
  reportingPeriods: z.array(filterOptionSchema),
  geographies: z.array(filterOptionSchema),
})

export const kpiExplorerQuerySchema = z.object({
  search: z.string().optional(),
  pillar: z.string().optional(),
  category: z.string().optional(),
  readiness: z.string().optional(),
  validationStatus: z.string().optional(),
  sourceInstitution: z.string().optional(),
  reportingPeriod: z.string().optional(),
  geography: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
})

/* ------------------------------------------------------------------ */

/** Response shape for GET /api/kpi-explorer. */
export const kpiExplorerOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  summary: z.array(catalogueSummaryCardSchema),
  catalogue: paginated(kpiCatalogueRowSchema),
  pillarDistribution: z.array(pillarDistributionSchema),
  readinessDistribution: z.array(readinessDistributionSchema),
})

export type ReadinessTier = z.infer<typeof readinessTierSchema>
export type ValidationStatus = z.infer<typeof validationStatusSchema>
export type CatalogueSummaryCard = z.infer<typeof catalogueSummaryCardSchema>
export type KpiCatalogueRow = z.infer<typeof kpiCatalogueRowSchema>
export type KpiHistoryPoint = z.infer<typeof kpiHistoryPointSchema>
export type LinkedRecord = z.infer<typeof linkedRecordSchema>
export type KpiProfile = z.infer<typeof kpiProfileSchema>
export type PillarDistribution = z.infer<typeof pillarDistributionSchema>
export type ReadinessDistribution = z.infer<typeof readinessDistributionSchema>
export type KpiExplorerOverview = z.infer<typeof kpiExplorerOverviewSchema>
export type KpiExplorerQuery = z.infer<typeof kpiExplorerQuerySchema>
export type KpiExplorerFilterOptions = z.infer<
  typeof kpiExplorerFilterOptionsSchema
>

/* ------------------------------------------------------------------ *
 * Display labels for the closed vocabularies
 * ------------------------------------------------------------------ */

export const READINESS_LABELS: Record<ReadinessTier, string> = {
  core: 'Core / Tier 1',
  supporting: 'Supporting / Tier 2',
  future: 'Future',
}

export const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  confirmed: 'Confirmed',
  provisional: 'Provisional',
  pending: 'Pending',
  'data-gap': 'Data gap',
}

export const READINESS_TIERS = readinessTierSchema.options
export const VALIDATION_STATUSES = validationStatusSchema.options
