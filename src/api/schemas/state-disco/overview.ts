import { z } from 'zod'
import { pageMetaSchema, performanceMetricSchema } from './common'

export const stateDiscoOverviewSchema = z.object({
  meta: pageMetaSchema,
  selectedUtility: z.string().min(1),
  metrics: z.array(performanceMetricSchema).length(4),
})

export type StateDiscoOverview = z.infer<typeof stateDiscoOverviewSchema>
