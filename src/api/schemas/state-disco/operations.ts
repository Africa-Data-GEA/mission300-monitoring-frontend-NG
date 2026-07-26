import { z } from 'zod'
import { pageMetaSchema } from './common'

export const serviceBandCellSchema = z.object({
  band: z.enum(['A', 'B', 'C', 'D', 'E']),
  supplyHours: z.string().min(1),
  tariff: z.string().min(1),
  intensityPercent: z.number().min(0).max(100),
})

export const utilityOperationsRowSchema = z.object({
  id: z.string().min(1),
  utility: z.string().min(1),
  effectiveOrder: z.string().min(1),
  bands: z.array(serviceBandCellSchema).length(5),
})

export const supplyTariffSchema = z.object({
  meta: pageMetaSchema,
  rows: z.array(utilityOperationsRowSchema),
})

export const deliveryRowSchema = z.object({
  id: z.string().min(1),
  utility: z.string().min(1),
  milestone: z.string().min(1),
  dueDateLabel: z.string().min(1),
  executionStatus: z.string().min(1),
  achievedLabel: z.string().min(1),
  evidenceLabel: z.string().min(1),
  reportingCompliance: z.string().min(1),
  bottleneck: z.string(),
})

export const utilityDeliverySchema = z.object({
  meta: pageMetaSchema,
  rows: z.array(deliveryRowSchema),
})

export type UtilityOperationsRow = z.infer<typeof utilityOperationsRowSchema>
export type DeliveryRow = z.infer<typeof deliveryRowSchema>
