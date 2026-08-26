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
  /**
   * The service band this milestone applies to. Review found the Service
   * band filter offered on this tab with no matching column, so a filtered
   * result could not be read back from the table
   * (docs/M300 Monitoring Platform Feedback.pptx, slide 11). The field is
   * now carried on the row and shown as a column, so the filter and the
   * table agree.
   */
  serviceBand: z.enum(['A', 'B', 'C', 'D', 'E']),
  /** Carried so the Validation status filter can narrow this tab too, and be
   * read back from a column — same rule as `serviceBand` above. */
  validationLabel: z.string().min(1),
  /** Sortable ISO date behind `dueDateLabel` — the label ("31 Dec 2025")
   * sorts alphabetically, which puts April before January. */
  dueDate: z.iso.datetime(),
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
