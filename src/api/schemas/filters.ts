import { z } from 'zod'

/**
 * Global dashboard filters.
 *
 * Application-wide, not page-specific: the specification's filter set narrows
 * every module that supports the breakdown, so values live in one place and
 * every page's query reads from them.
 */

export const filterOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
})

/** Response shape for GET /api/filters. */
export const dashboardFilterOptionsSchema = z.object({
  reportingPeriods: z.array(filterOptionSchema),
  pillars: z.array(filterOptionSchema),
  institutions: z.array(filterOptionSchema),
  priorities: z.array(filterOptionSchema),
  geographicScopes: z.array(filterOptionSchema),
  distributionCompanies: z.array(filterOptionSchema),
  technologies: z.array(filterOptionSchema),
})

/** The currently selected values. Every key is required so a query is total. */
export const dashboardFilterValuesSchema = z.object({
  period: z.string(),
  pillar: z.string(),
  institution: z.string(),
  priority: z.string(),
  geographicScope: z.string(),
  distributionCompany: z.string(),
  technology: z.string(),
})

export type FilterOption = z.infer<typeof filterOptionSchema>
export type DashboardFilterOptions = z.infer<typeof dashboardFilterOptionsSchema>
export type DashboardFilterValues = z.infer<typeof dashboardFilterValuesSchema>

export const DEFAULT_FILTER_VALUES: DashboardFilterValues = {
  period: '2026',
  pillar: 'all',
  institution: 'all',
  priority: 'priority',
  geographicScope: 'national',
  distributionCompany: 'all',
  technology: 'all',
}

/** Reporting-period value that reveals the custom date-range picker. */
export const CUSTOM_PERIOD = 'custom'

export const FILTER_KEYS = Object.keys(
  dashboardFilterValuesSchema.shape,
) as ReadonlyArray<keyof DashboardFilterValues>
