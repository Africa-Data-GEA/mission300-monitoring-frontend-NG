import { z } from 'zod'
import { pageMetaSchema } from './common'

/** One quarter of utility performance. A metric is null when that quarter
 * has no data for it, which the chart draws as a gap rather than a zero. */
export const performanceTrendPointSchema = z.object({
  period: z.string().min(1),
  label: z.string().min(1),
  meteringRate: z.number().nullable(),
  atccLossRate: z.number().nullable(),
  collectionEfficiency: z.number().nullable(),
  remittancePerformance: z.number().nullable(),
  reportingDiscos: z.number().int().min(0),
})

export const performanceTrendsSchema = z.object({
  meta: pageMetaSchema,
  selectedUtility: z.string().min(1),
  points: z.array(performanceTrendPointSchema),
})

export type PerformanceTrendPoint = z.infer<typeof performanceTrendPointSchema>
export type PerformanceTrends = z.infer<typeof performanceTrendsSchema>
export type PerformanceTrendMetric = Exclude<keyof PerformanceTrendPoint, 'period' | 'label' | 'reportingDiscos'>
