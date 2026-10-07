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
 * Validation status of an indicator's current value, per the M300 KPI
 * Matrix's own five-value vocabulary (docs/EMRC - M300 KPI Matrix v2-0
 * 2026-06-29.xlsx, "KPI Matrix Field Defination" sheet):
 *
 * - `confirmed`: formally verified and signed off by the responsible
 *   institution — final and traceable to an approved source.
 * - `public-source`: from a credible public institutional report (e.g. a
 *   NERC quarterly publication) but not yet formally confirmed.
 * - `requires-validation`: a credible value exists but needs institutional
 *   sign-off, a more recent update, or reconciliation with another source.
 * - `provisional`: the best available planning/baseline estimate, explicitly
 *   subject to revision once confirmed data is obtained.
 * - `future`: no data is currently available — collection, methodology
 *   agreement or institutional confirmation must happen first.
 */
export const validationStatusSchema = z.enum([
  'confirmed',
  'public-source',
  'requires-validation',
  'provisional',
  'future',
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

/** An Institution record the indicator's free-text `sourceInstitution` was
 * resolved onto. Empty where the source text names a publication or a
 * collective ("DisCos") rather than one registered body - the raw
 * `sourceInstitution` string stays authoritative for display. */
export const resolvedSourceInstitutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
})

export const kpiCatalogueRowSchema = z.object({
  /** Human-facing identifier, e.g. "M300-GEN-004". Shown for traceability. */
  id: z.string().min(1),
  name: z.string().min(1),
  pillar: pillarIdSchema,
  category: z.string().min(1),
  unit: z.string().min(1),
  sourceInstitution: z.string().min(1),
  sourceInstitutions: z.array(resolvedSourceInstitutionSchema).optional(),
  /** The submitted dataset (Data Submissions & Validation) this indicator is
   * measured from, e.g. "Metering performance". Links the two modules so an
   * approved submission can be traced to the indicator it publishes to. */
  sourceDataset: z.string().min(1),
  frequency: z.string().min(1),
  readiness: readinessTierSchema,
  validationStatus: validationStatusSchema,
  lastUpdated: z.iso.datetime(),
  /**
   * False once an indicator has been retired. Optional so every existing
   * fixture and backend response stays valid — absent means active. Retired
   * indicators are hidden from the catalogue by default but never deleted,
   * because published values must remain traceable. See
   * setKpiActiveRequestSchema.
   */
  active: z.boolean().optional(),
})

/* ------------------------------------------------------------------ *
 * Section C — KPI profile (the drill-down)
 * ------------------------------------------------------------------ */

/** One point on the indicator's value history, for the trend chart. */
export const kpiHistoryPointSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  value: z.number(),
  /** Months the value covers when the source period is incomplete, e.g. "Apr–May". */
  coverageNote: z.string().nullable().optional(),
  /** The status name for a status indicator ("Achieved"), null for a numeric one. */
  valueLabel: z.string().nullable().optional(),
  validationStatus: validationStatusSchema,
  /** The submission that published this point, where one did. Null for
   * points seeded before this traceability existed. */
  submissionId: z.string().nullable(),
  /** True only for a point set via the "Set current value" admin override -
   * a point that arrived through an approved data submission is never
   * editable or deletable here, only through Data Submissions review. */
  editable: z.boolean(),
})

/**
 * One periodic target point — e.g. an interim milestone on the way to the
 * final Compact commitment, or a target formally renegotiated at a later
 * date. Distinct from the single `target`/`targetLabel`/`targetDate` fields
 * below: those remain the one primary/final target every existing consumer
 * (bullet charts, headline cards) already renders, unchanged. `targets` is
 * additive — the full periodic history, for anywhere that wants to plot more
 * than one point (e.g. 2026 and 2028 checkpoints on the way to a 2030 goal).
 * Mirrors the backend's own `target_baseline` table, which already supports
 * multiple period-tagged rows per KPI even though this app's edit form
 * previously only ever wrote one.
 */
export const kpiTargetPointSchema = z.object({
  period: z.string().min(1),
  value: z.number(),
  label: z.string().min(1),
})

/**
 * How this indicator relates to an external methodology standard (e.g.
 * SE4ALL's MRL guidance) — added per the SE4ALL MRL alignment review
 * (docs/se4all-mrl-alignment-renewable-private-capital.md), which flagged
 * that EMRC's KPI metadata had no way to record which version of an outside
 * standard a KPI aligns to, or what it deliberately in/excludes relative to
 * that standard. Optional and null for every KPI that has no external
 * standard mapped to it yet — this is not retroactively invented for the
 * other 70-odd KPIs in the registry, only added where a real alignment
 * decision has actually been made.
 */
export const externalStandardAlignmentSchema = z.object({
  /** The standard and version this KPI is checked against, e.g. "SE4ALL MRL
   * Guidance Note v1 (confidential draft, Aug 2026)". */
  standard: z.string().min(1),
  /** What this KPI's figure deliberately counts, per the standard's rules. */
  inclusions: z.array(z.string().min(1)),
  /** What this KPI's figure deliberately excludes, per the standard's rules. */
  exclusions: z.array(z.string().min(1)),
  /** The standard's required reporting cadence for this indicator, e.g.
   * "Annual" or "Quarterly, cumulative since Compact start" — may differ
   * from this KPI's own `frequency` field, which is this indicator's actual
   * reporting cadence today. */
  periodType: z.string().min(1),
  /** Assumptions the current figure relies on that the standard requires be
   * stated explicitly, e.g. an estimation method standing in for data not
   * yet collected at the required granularity. */
  assumptions: z.array(z.string().min(1)),
})

export type ExternalStandardAlignment = z.infer<typeof externalStandardAlignmentSchema>

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
/**
 * The fields on a KPI's definition an admin can edit — methodology and
 * reference-point metadata, set once when the indicator is configured and
 * changed rarely and deliberately (e.g. a target renegotiated with NERC),
 * as opposed to `current`/`history`, which only ever change by a data
 * submission being approved and published. See PATCH /kpi-explorer/kpis/:id.
 */
export const updateKpiMetadataRequestSchema = z.object({
  /** Which pillar this indicator rolls up under. Reassigning it moves the
   * KPI's catalogue row and pillar-dashboard cards to the new pillar. */
  pillar: pillarIdSchema,
  definition: z.string().min(1),
  formula: z.string().min(1),
  unit: z.string().min(1),
  aggregation: z.string(),
  frequency: z.string(),
  disaggregation: z.string(),
  limitations: z.string(),
  baseline: z.number().nullable(),
  baselineLabel: z.string(),
  target: z.number().nullable(),
  targetLabel: z.string(),
  targetDate: z.string().nullable(),
  /** The full periodic target history — see kpiTargetPointSchema on
   * kpiProfileSchema. Optional: omitting it leaves existing periodic targets
   * untouched; sending an array replaces the full list. */
  targets: z.array(kpiTargetPointSchema).optional(),
  /** See externalStandardAlignmentSchema. Optional: omitting it leaves the
   * existing alignment (or lack of one) untouched. */
  externalStandardAlignment: externalStandardAlignmentSchema.nullable().optional(),
  sourceInstitution: z.string().min(1),
  sourceDataset: z.string().min(1),
  sourceReference: z.string(),
})

export type UpdateKpiMetadataRequest = z.infer<typeof updateKpiMetadataRequestSchema>

/**
 * Creating a brand-new indicator.
 *
 * Review noted that existing indicators can be modified but there was no way
 * to add an extra KPI or retire one (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 15). Deliberately scoped to what identifies and
 * defines an indicator — its values arrive later, through an approved data
 * submission, never typed in here. A new indicator therefore starts with no
 * current value and `future` validation status.
 */
export const createKpiRequestSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, 'Give the indicator an identifier, e.g. M300-P1-020')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  name: z.string().trim().min(3, 'Give the indicator a name'),
  pillar: pillarIdSchema,
  category: z.string().trim().min(1, 'Select a category'),
  unit: z.string().trim().min(1, 'State the unit, e.g. % or MW'),
  definition: z.string().trim().min(10, 'Describe what this indicator measures'),
  formula: z.string().trim().min(1, 'State how it is calculated'),
  frequency: z.string().trim().min(1, 'State the reporting frequency'),
  sourceInstitution: z.string().trim().min(1, 'Name the responsible institution'),
  sourceDataset: z.string().trim().min(1, 'Name the dataset it is measured from'),
  readiness: readinessTierSchema,
})

export const createKpiResponseSchema = z.object({
  row: kpiCatalogueRowSchema,
  message: z.string().min(1),
})

/**
 * Retiring or restoring an indicator. Deactivation is reversible and never
 * deletes: an indicator that has already published values must stay
 * traceable, so it is marked inactive and hidden from the default catalogue
 * rather than removed.
 */
export const setKpiActiveRequestSchema = z.object({
  active: z.boolean(),
  reason: z.string().trim().max(500).optional(),
})

/**
 * Directly sets a KPI's current value and appends a history point, bypassing
 * the Data Submissions & Validation workflow. This is an explicit admin
 * override — normally a value only ever arrives via an approved submission
 * (see publishKpiValue in mocks/data/kpi-explorer.ts) — for cases where an
 * administrator needs to record a figure without routing it through that
 * pipeline. Gated to system-administrator in the UI; see role-access.ts.
 *
 * Matches the backend's SetKpiCurrentValueDto exactly, including its two
 * deliberate narrowings from the general KPI profile shape:
 * - No `currentLabel` - the display label is always derived from
 *   value + unit at read time, never stored as free text.
 * - `resultingStatus` is confirmed/provisional only, not the full 5-value
 *   validationStatusSchema vocabulary - those are the only two decisions an
 *   approved submission can ever produce.
 */
export const setKpiCurrentValueRequestSchema = z.object({
  value: z.number(),
  reportingPeriod: z.string().trim().min(1, 'State the reporting period, e.g. Q4 2025'),
  resultingStatus: z.enum(['confirmed', 'provisional']),
  note: z.string().trim().max(500).optional(),
})

export type CreateKpiRequest = z.infer<typeof createKpiRequestSchema>
export type CreateKpiResponse = z.infer<typeof createKpiResponseSchema>
export type SetKpiActiveRequest = z.infer<typeof setKpiActiveRequestSchema>
export type SetKpiCurrentValueRequest = z.infer<typeof setKpiCurrentValueRequestSchema>

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
  /**
   * What kind of thing the target is, so a card can tell three states apart
   * that all previously collapsed into "no confirmed target":
   *
   * - `level` (default): the target is a value in this indicator's own unit,
   *   so progress-to-target is meaningful and a bar can be drawn.
   * - `growth-rate`: a Compact commitment exists, but it is expressed as a
   *   rate of change rather than a level in this indicator's unit. Progress
   *   cannot be drawn, but the commitment must still be shown — review
   *   feedback found an access-rate card reading as though it had no target
   *   when in fact the target was simply in a different unit
   *   (docs/M300 Monitoring Platform Feedback.pptx, slide 6).
   * - `none`: no target has been agreed at all.
   */
  targetBasis: z.enum(['level', 'growth-rate', 'none']).optional(),
  /** Short face label for a `growth-rate` target, e.g. "9%/yr growth". */
  targetBasisLabel: z.string().optional(),
  /**
   * When the target is to be met, e.g. "2030" or "end 2027". Structured
   * separately from `targetLabel` so a target always states its deadline
   * rather than depending on whoever wrote the label remembering to include
   * one — review feedback found targets like "100% market remittance
   * compliance" with no date attached (docs/M300 Monitoring Platform
   * Feedback.pptx, slide 3). Null where no deadline has been agreed; it is
   * then shown as such rather than silently omitted.
   */
  targetDate: z.string().nullable(),
  /** The full periodic target history — see kpiTargetPointSchema. Empty
   * where only the single primary target above has ever been set. */
  targets: z.array(kpiTargetPointSchema).default([]),
  /** See externalStandardAlignmentSchema. Null where no external standard
   * has been mapped to this KPI yet — the common case today. */
  externalStandardAlignment: externalStandardAlignmentSchema.nullable().default(null),
  /** Signed variance against target, following the configured direction. */
  varianceLabel: z.string(),
  direction: improvementDirectionSchema,
  trend: trendSchema.optional(),
  history: z.array(kpiHistoryPointSchema),

  // Traceability panel.
  sourceInstitution: z.string().min(1),
  sourceInstitutions: z.array(resolvedSourceInstitutionSchema).optional(),
  /** Other indicators that record the same measurement: a matrix indicator and the one holding its data. */
  relatedIndicators: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1), relation: z.enum(['canonical', 'alias']) }))
    .optional(),
  sourceDataset: z.string().min(1),
  sourceReference: z.string(),
  reportingPeriod: z.string(),
  /** Months the latest value covers when its period is incomplete; null when complete. */
  reportingPeriodCoverage: z.string().nullable().optional(),
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
export type KpiTargetPoint = z.infer<typeof kpiTargetPointSchema>
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
  future: 'Future / Tier 3',
}

export const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  confirmed: 'Confirmed',
  'public-source': 'Public Source',
  'requires-validation': 'Requires Validation',
  provisional: 'Provisional',
  future: 'Future',
}

export const READINESS_TIERS = readinessTierSchema.options
export const VALIDATION_STATUSES = validationStatusSchema.options
