import { z } from 'zod'
import {
  pageOf, submissionMethodSchema, workflowActionSchema, workflowStatusSchema,
} from './common'

export const submissionListItemSchema = z.object({
  id: z.string().min(1),
  obligationId: z.string().nullable().optional(),
  institution: z.string().min(1),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  method: submissionMethodSchema,
  methodLabel: z.string().min(1),
  version: z.number().int().min(1),
  submittedBy: z.string().min(1),
  submittedAt: z.iso.datetime().nullable(),
  submittedAtLabel: z.string().min(1),
  status: workflowStatusSchema,
  validationSummary: z.string().min(1),
  availableActions: z.array(workflowActionSchema),
})

export const submissionListSchema = pageOf(submissionListItemSchema)

export const validationIssueSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  field: z.string().min(1),
  message: z.string().min(1),
  requiredCorrection: z.string().min(1),
})

export const statusHistoryItemSchema = z.object({
  id: z.string().min(1),
  status: workflowStatusSchema.nullable().default(null),
  actor: z.string().min(1),
  occurredAt: z.iso.datetime(),
  occurredAtLabel: z.string().min(1),
  comment: z.string(),
})

export const validationQueueItemSchema = submissionListItemSchema.extend({
  reviewer: z.string().min(1),
  ageLabel: z.string().min(1),
  automatedCheck: workflowStatusSchema,
  issueCount: z.number().int().min(0),
})

export const validationQueueSchema = pageOf(validationQueueItemSchema)

/**
 * One value this submission would publish to a KPI's current value and
 * history, if approved (or accepted provisionally). Shown on the review
 * screen before a decision is made, so a reviewer can see what publishing
 * will affect — and returned again, confirmed, after the decision.
 */
export const kpiExtractionSchema = z.object({
  kpiId: z.string().min(1),
  kpiName: z.string().min(1),
  reportingPeriod: z.string().min(1),
  value: z.number(),
})

const submissionDetailObjectSchema = validationQueueItemSchema.extend({
  fileName: z.string().nullable(),
  sourceReference: z.string(),
  notes: z.string(),
  issues: z.array(validationIssueSchema),
  history: z.array(statusHistoryItemSchema),
  permittedDecisions: z.array(z.enum(['approved', 'provisional', 'returned', 'rejected'])),
  extractedValues: z.array(kpiExtractionSchema),
})

export const submissionDetailSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object' || !('history' in value)) return value

  const detail = value as Record<string, unknown>
  if (!Array.isArray(detail.history)) return value

  return {
    ...detail,
    history: detail.history.map((item, index) => {
      if (!item || typeof item !== 'object') return item
      const historyItem = item as Record<string, unknown>
      const occurredAt = typeof historyItem.occurredAt === 'string'
        ? historyItem.occurredAt
        : `history-${index + 1}`

      return {
        ...historyItem,
        id: historyItem.id ?? `${occurredAt}-${index + 1}`,
        status: historyItem.status ?? null,
        occurredAtLabel: historyItem.occurredAtLabel ?? occurredAt,
      }
    }),
  }
}, submissionDetailObjectSchema)

export const validationDecisionRequestSchema = z.object({
  decision: z.enum(['approved', 'provisional', 'returned', 'rejected']),
  comments: z.string().trim().min(3),
})

export const validationDecisionResponseSchema = z.object({
  submissionId: z.string().min(1),
  status: workflowStatusSchema,
  message: z.string().min(1),
  nextUrl: z.string().min(1),
  /** KPIs actually published to as a result of this decision. Empty when the
   * decision does not publish (returned, rejected) or nothing was extracted. */
  published: z.array(kpiExtractionSchema),
})

export const bulkValidationDecisionRequestSchema = z.object({
  submissionIds: z.array(z.string().min(1)).min(1),
  decision: z.enum(['approved', 'provisional', 'returned', 'rejected']),
  comments: z.string().trim().min(3),
})

export const bulkValidationDecisionResponseSchema = z.object({
  decision: z.enum(['approved', 'provisional', 'returned', 'rejected']),
  approvedCount: z.number(),
  failedCount: z.number(),
  succeeded: z.array(z.string()),
  failed: z.array(z.object({ submissionId: z.string(), message: z.string() })),
  message: z.string().min(1),
})

export type SubmissionListItem = z.infer<typeof submissionListItemSchema>
export type ValidationQueueItem = z.infer<typeof validationQueueItemSchema>
export type KpiExtraction = z.infer<typeof kpiExtractionSchema>
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>
export type ValidationDecisionRequest = z.infer<typeof validationDecisionRequestSchema>
export type BulkValidationDecisionRequest = z.infer<typeof bulkValidationDecisionRequestSchema>
