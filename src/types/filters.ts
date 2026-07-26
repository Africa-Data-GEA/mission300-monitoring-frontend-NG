/**
 * Global dashboard filters.
 *
 * Inferred from the zod schemas in src/api/schemas/filters.ts.
 */
export {
  CUSTOM_PERIOD,
  DEFAULT_FILTER_VALUES,
  FILTER_KEYS,
  dashboardFilterOptionsSchema,
  dashboardFilterValuesSchema,
  filterOptionSchema,
} from '@/api/schemas/filters'

export type {
  DashboardFilterOptions,
  DashboardFilterValues,
  FilterOption,
} from '@/api/schemas/filters'
