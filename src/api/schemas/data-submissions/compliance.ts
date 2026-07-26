import { z } from 'zod'
import { pageOf, workflowActionSchema, workflowStatusSchema } from './common'

export const overdueItemSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  dueDate: z.iso.datetime(),
  dueDateLabel: z.string().min(1),
  overdueLabel: z.string().min(1),
  owner: z.string().min(1),
  status: workflowStatusSchema,
  availableActions: z.array(workflowActionSchema),
})

export const overdueListSchema = pageOf(overdueItemSchema)

export const dataGapSchema = z.object({
  id: z.string().min(1),
  kpiId: z.string().min(1),
  kpiName: z.string().min(1),
  pillar: z.string().min(1),
  institution: z.string().min(1),
  reportingPeriod: z.string().min(1),
  category: z.string().min(1),
  readinessTier: z.string().min(1),
  owner: z.string().min(1),
  nextAction: z.string().min(1),
  status: workflowStatusSchema,
  availableActions: z.array(workflowActionSchema),
})

export const dataGapListSchema = pageOf(dataGapSchema)

export type OverdueItem = z.infer<typeof overdueItemSchema>
export type DataGap = z.infer<typeof dataGapSchema>
