import { z } from 'zod'
import { filterOptionSchema } from '../filters'
import { metricProvenanceSchema, trendSchema } from '../common'

export const stateDiscoFiltersSchema = z.object({
  reportingPeriods: z.array(filterOptionSchema),
  views: z.array(filterOptionSchema),
  distributionCompanies: z.array(filterOptionSchema),
  states: z.array(filterOptionSchema),
  utilityMetrics: z.array(filterOptionSchema),
  serviceBands: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  sources: z.array(filterOptionSchema),
})

export const stateDiscoQuerySchema = z.object({
  reportingPeriod: z.string().optional(),
  view: z.string().optional(),
  distributionCompany: z.string().optional(),
  state: z.string().optional(),
  utilityMetric: z.string().optional(),
  serviceBand: z.string().optional(),
  validationStatus: z.string().optional(),
  source: z.string().optional(),
})

export const performanceMetricSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  value: z.string().min(1),
  supportingLabel: z.string().min(1),
  benchmarkLabel: z.string().min(1),
  varianceLabel: z.string().min(1),
  progressPercent: z.number().min(0).max(100),
  trend: trendSchema,
  provenance: metricProvenanceSchema,
})

export const pageMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  lastUpdatedLabel: z.string().min(1),
  sourceLabel: z.string().min(1),
})

export type StateDiscoFilters = z.infer<typeof stateDiscoFiltersSchema>
export type StateDiscoQuery = z.infer<typeof stateDiscoQuerySchema>
export type PerformanceMetric = z.infer<typeof performanceMetricSchema>
