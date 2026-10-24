import { z } from 'zod'
import { paginated } from './administration'
import { pillarIdSchema } from './common'
import { filterOptionSchema } from './filters'

export const reformStatusSchema = z.enum([
  'not-yet-due',
  'in-progress-on-track',
  'in-progress-minor-delays',
  'in-progress-at-risk',
  'delayed',
  'completed',
])

export const REFORM_STATUS_LABELS: Record<z.infer<typeof reformStatusSchema>, string> = {
  'not-yet-due': 'Not yet due',
  'in-progress-on-track': 'In progress, on track',
  'in-progress-minor-delays': 'In progress, minor delays',
  'in-progress-at-risk': 'In progress, at risk',
  delayed: 'Delayed',
  completed: 'Completed',
}

export const REFORM_STATUS_OPTIONS = reformStatusSchema.options.map((value) => ({
  value,
  label: REFORM_STATUS_LABELS[value],
}))

export const reformActionSchema = z.object({
  id: z.string().min(1),
  pillar: pillarIdSchema,
  commitment: z.string(),
  action: z.string(),
  isPriority: z.boolean(),
  programme: z.object({ id: z.string().min(1), name: z.string().min(1) }).nullable(),
  leadInstitution: z.string(),
  referenceDueDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  completedAt: z.string().nullable(),
  status: reformStatusSchema,
  previousStatus: reformStatusSchema.nullable(),
  comment: z.string(),
  updatedAt: z.string().min(1),
})

export const reformStatusChangeSchema = z.object({
  id: z.string().min(1),
  fromStatus: reformStatusSchema.nullable(),
  toStatus: reformStatusSchema,
  comment: z.string(),
  changedBy: z.string(),
  changedAt: z.string().min(1),
})

export const reformActionDetailSchema = reformActionSchema.extend({
  history: z.array(reformStatusChangeSchema),
})

const statusCountsSchema = z.record(z.string(), z.number().int().min(0))

export const reformSummarySchema = z.object({
  total: z.number().int().min(0),
  priorityTotal: z.number().int().min(0),
  byPillar: z.array(z.object({ pillar: z.string(), priority: z.number().int(), other: z.number().int() })),
  byStatus: z.object({ priority: statusCountsSchema, other: statusCountsSchema }),
})

export const reformActionsOverviewSchema = z.object({
  lastUpdated: z.string().min(1),
  summary: reformSummarySchema,
  filters: z.object({
    pillars: z.array(filterOptionSchema),
    statuses: z.array(filterOptionSchema),
    programmes: z.array(filterOptionSchema),
  }),
  actions: paginated(reformActionSchema),
})

export const saveReformActionResponseSchema = z.object({
  action: reformActionDetailSchema,
  message: z.string().min(1),
})

export const deleteReformActionResponseSchema = z.object({ message: z.string().min(1) })

export const reformActionRequestSchema = z.object({
  pillar: z.string().min(1),
  commitment: z.string().min(3),
  action: z.string().min(5),
  isPriority: z.boolean(),
  programmeId: z.string().nullable(),
  leadInstitution: z.string(),
  referenceDueDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: reformStatusSchema,
  comment: z.string(),
  statusNote: z.string().optional(),
})

export type ReformStatus = z.infer<typeof reformStatusSchema>
export type ReformAction = z.infer<typeof reformActionSchema>
export type ReformActionDetail = z.infer<typeof reformActionDetailSchema>
export type ReformActionsOverview = z.infer<typeof reformActionsOverviewSchema>
export type ReformActionRequest = z.infer<typeof reformActionRequestSchema>
