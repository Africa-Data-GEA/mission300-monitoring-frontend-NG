import { z } from 'zod'
import { pageOf, workflowActionSchema, workflowStatusSchema } from './common'

export const overdueItemSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  dueDate: z.iso.datetime().nullable().default(null),
  dueDateLabel: z.string().min(1).default('Not supplied'),
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
  institution: z.string().min(1).default('Not supplied'),
  reportingPeriod: z.string().min(1).default('Not supplied'),
  category: z.string().min(1),
  readinessTier: z.string().min(1),
  owner: z.string().min(1),
  nextAction: z.string().min(1),
  status: workflowStatusSchema.nullable().default(null),
  availableActions: z.array(workflowActionSchema).default([]),
})

export const dataGapListSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object' || !('items' in value)) return value

  const page = value as { items?: unknown }
  if (!Array.isArray(page.items)) return value

  return {
    ...value,
    items: page.items.map((item) => {
      if (!item || typeof item !== 'object') return item
      const row = item as Record<string, unknown>
      return { id: row.id ?? row.kpiId, ...row }
    }),
  }
}, pageOf(dataGapSchema))

export type OverdueItem = z.infer<typeof overdueItemSchema>
export type DataGap = z.infer<typeof dataGapSchema>
