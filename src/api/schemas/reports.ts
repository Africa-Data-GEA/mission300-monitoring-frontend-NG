import { z } from 'zod'
import { paginated } from './administration'
import { filterOptionSchema } from './filters'

/**
 * Contract for Reports & Exports.
 *
 * Specification: docs/specs/reports-exports.md
 *
 * The specification groups reports into four categories (Section A), each of
 * which contains one or more report types. Report types, not categories, are
 * what a user actually generates (Section B) or finds in Saved Reports
 * (Section C) — the category is a display grouping over them, not a
 * separate identity, so `reportCategorySchema` and `reportTypeSchema` are
 * both closed vocabularies but only the latter identifies a report.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const reportCategorySchema = z.enum([
  'compact',
  'performance',
  'delivery',
  'data-governance',
])

export const reportTypeSchema = z.enum([
  'compact-progress',
  'compact-review',
  'pillar-performance',
  'kpi-indicator',
  'state-disco',
  'implementation',
  'bottleneck',
  'financial',
  'submission-compliance',
  'data-quality',
])

export const exportFormatSchema = z.enum(['pdf', 'xlsx'])

export const REPORT_TYPE_CATEGORY: Record<
  z.infer<typeof reportTypeSchema>,
  z.infer<typeof reportCategorySchema>
> = {
  'compact-progress': 'compact',
  'compact-review': 'compact',
  'pillar-performance': 'performance',
  'kpi-indicator': 'performance',
  'state-disco': 'delivery',
  implementation: 'delivery',
  bottleneck: 'delivery',
  financial: 'delivery',
  'submission-compliance': 'data-governance',
  'data-quality': 'data-governance',
}

/* ------------------------------------------------------------------ *
 * Section A — Report catalogue
 * ------------------------------------------------------------------ */

/** One report definition — the "Report card" the catalogue and info icon
 * both read from, per the spec's Definition / Methodology / Data source
 * columns. */
export const reportCatalogueCardSchema = z.object({
  reportType: reportTypeSchema,
  category: reportCategorySchema,
  title: z.string().min(1),
  definition: z.string().min(1),
  methodology: z.string().min(1),
  dataSource: z.string().min(1),
})

/* ------------------------------------------------------------------ *
 * Section B — Generate report
 * ------------------------------------------------------------------ */

export const reportConfigSchema = z.object({
  reportType: reportTypeSchema,
  /** One or more reporting periods — stakeholder feedback asked for a
   * multi-period comparative report (e.g. Q1 vs Q2 vs Q3 in one output).
   * Only the KPI-indicator and pillar-performance report types have real
   * per-period source data (each KPI's own history[]) to build a genuine
   * comparison from; other report types use the first selected period only,
   * since fabricating variation for data that has no historical axis would
   * misrepresent it. */
  periods: z.array(z.string().min(1)).min(1),
  /** One or more Compact pillars — stakeholder feedback asked for the
   * single-select pillar filter to allow multiple selections. */
  pillars: z.array(z.string()).min(1),
  kpiCategory: z.string(),
  state: z.string(),
  distributionCompany: z.string(),
  programmeOrAgency: z.string(),
  validationStatus: z.string(),
  readinessTier: z.string(),
  format: exportFormatSchema,
})

/** One row of an applied-filter's label/value, for the metadata appendix. */
export const appliedFilterSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

/**
 * Context required to interpret a generated output — the spec requires all
 * of these to accompany every report, not just the data itself.
 */
export const reportMetadataSchema = z.object({
  title: z.string().min(1),
  reportingPeriod: z.string().min(1),
  appliedFilters: z.array(appliedFilterSchema),
  generatedAt: z.iso.datetime(),
  dataVersion: z.string().min(1),
  sourceNotes: z.string().min(1),
  validationStatus: z.string().min(1),
  units: z.string().min(1),
  limitations: z.string().min(1),
})

/** A generic tabular section, shared by the on-screen preview and the
 * generated PDF/Excel output so both are built from the same data. */
export const reportSectionSchema = z.object({
  title: z.string().min(1),
  columns: z.array(z.string().min(1)),
  rows: z.array(z.array(z.string())),
})

export const reportPreviewSchema = z.object({
  metadata: reportMetadataSchema,
  sections: z.array(reportSectionSchema),
})

/* ------------------------------------------------------------------ *
 * Section C — Saved reports
 * ------------------------------------------------------------------ */

export const savedReportSchema = z.object({
  id: z.string().min(1),
  reportType: reportTypeSchema,
  category: reportCategorySchema,
  title: z.string().min(1),
  owner: z.string().min(1),
  filtersSummary: z.string().min(1),
  /** Shown as its own column, not buried inside `filtersSummary` — knowing
   * whether a report includes non-validated data is essential, per
   * stakeholder feedback, not something a reader should have to parse out
   * of a joined filter string. */
  validationStatusLabel: z.string().min(1),
  /** Starts at 1; incremented (not a new row) each time this exact report
   * configuration is regenerated with updated data — stakeholder feedback
   * asked to avoid confusion between regenerated copies of the same report. */
  version: z.number().int().min(1),
  format: exportFormatSchema,
  fileReference: z.string().min(1),
  createdAt: z.iso.datetime(),
  lastGeneratedAt: z.iso.datetime(),
  config: reportConfigSchema,
})

/* ------------------------------------------------------------------ *
 * Section D — CPR and Compact export
 * ------------------------------------------------------------------ */

export const compactExportCardSchema = z.object({
  id: z.enum(['compact-progress-report', 'implementation-register']),
  title: z.string().min(1),
  definition: z.string().min(1),
  methodology: z.string().min(1),
  dataSource: z.string().min(1),
  reportType: reportTypeSchema,
})

/* ------------------------------------------------------------------ *
 * Section E — Filters
 * ------------------------------------------------------------------ */

export const reportsFilterOptionsSchema = z.object({
  reportTypes: z.array(filterOptionSchema),
  reportingPeriods: z.array(filterOptionSchema),
  pillars: z.array(filterOptionSchema),
  kpiCategories: z.array(filterOptionSchema),
  states: z.array(filterOptionSchema),
  distributionCompanies: z.array(filterOptionSchema),
  programmesOrAgencies: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  readinessTiers: z.array(filterOptionSchema),
  exportFormats: z.array(filterOptionSchema),
})

/* ------------------------------------------------------------------ */

export const reportsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
})

/** Response shape for GET /api/reports. */
export const reportsOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  catalogue: z.array(reportCatalogueCardSchema),
  compactExports: z.array(compactExportCardSchema),
  savedReports: paginated(savedReportSchema),
})

/** Response shape for POST /api/reports/generate. */
export const generateReportResponseSchema = z.object({
  preview: reportPreviewSchema,
  savedReport: savedReportSchema,
})

export type ReportCategory = z.infer<typeof reportCategorySchema>
export type ReportType = z.infer<typeof reportTypeSchema>
export type ExportFormat = z.infer<typeof exportFormatSchema>
export type ReportCatalogueCard = z.infer<typeof reportCatalogueCardSchema>
export type ReportConfig = z.infer<typeof reportConfigSchema>
export type AppliedFilter = z.infer<typeof appliedFilterSchema>
export type ReportMetadata = z.infer<typeof reportMetadataSchema>
export type ReportSection = z.infer<typeof reportSectionSchema>
export type ReportPreview = z.infer<typeof reportPreviewSchema>
export type SavedReport = z.infer<typeof savedReportSchema>
export type CompactExportCard = z.infer<typeof compactExportCardSchema>
export type ReportsFilterOptions = z.infer<typeof reportsFilterOptionsSchema>
export type ReportsQuery = z.infer<typeof reportsQuerySchema>
export type ReportsOverview = z.infer<typeof reportsOverviewSchema>
export type GenerateReportResponse = z.infer<typeof generateReportResponseSchema>

export const REPORT_TYPES = reportTypeSchema.options
export const REPORT_CATEGORIES = reportCategorySchema.options
export const EXPORT_FORMATS = exportFormatSchema.options

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  compact: 'Compact reporting',
  performance: 'Performance reporting',
  delivery: 'Delivery reporting',
  'data-governance': 'Data-governance reporting',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  'compact-progress': 'Compact Progress Report',
  'compact-review': 'Compact review export',
  'pillar-performance': 'Pillar performance report',
  'kpi-indicator': 'KPI baseline–current–target report',
  'state-disco': 'State & DisCo report',
  implementation: 'Implementation report',
  bottleneck: 'Bottleneck report',
  financial: 'Financial report',
  'submission-compliance': 'Submission-compliance report',
  'data-quality': 'Data-quality report',
}
