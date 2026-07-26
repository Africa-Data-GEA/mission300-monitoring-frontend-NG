import { z } from 'zod'
import { pageMetaSchema } from './common'

export const discoComparisonRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rankLabel: z.string().min(1),
  activeCustomers: z.string().min(1),
  meteredCustomers: z.string().min(1),
  unmeteredCustomers: z.string().min(1),
  meteringRate: z.string().min(1),
  energyReceived: z.string().min(1),
  energyBilled: z.string().min(1),
  billingEfficiency: z.string().min(1),
  energyReceivedBarPercent: z.number().min(0).max(100),
  energyBilledBarPercent: z.number().min(0).max(100),
  revenueBilled: z.string().min(1),
  revenueCollected: z.string().min(1),
  collectionEfficiency: z.string().min(1),
  revenueBilledBarPercent: z.number().min(0).max(100),
  revenueCollectedBarPercent: z.number().min(0).max(100),
  remittancePerformance: z.string().min(1),
  validationLabel: z.string().min(1),
})

export const discoComparisonSchema = z.object({
  meta: pageMetaSchema,
  rows: z.array(discoComparisonRowSchema),
})

export type DiscoComparisonRow = z.infer<typeof discoComparisonRowSchema>
