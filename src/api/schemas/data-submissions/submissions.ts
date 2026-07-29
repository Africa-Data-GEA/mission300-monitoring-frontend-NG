import { z } from 'zod'
import {
  pageOf, submissionMethodSchema, workflowActionSchema, workflowStatusSchema,
} from './common'

export const submissionListItemSchema = z.object({
  id: z.string().min(1),
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
  status: workflowStatusSchema,
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

export const submissionDetailSchema = validationQueueItemSchema.extend({
  fileName: z.string().nullable(),
  sourceReference: z.string(),
  notes: z.string(),
  issues: z.array(validationIssueSchema),
  history: z.array(statusHistoryItemSchema),
  permittedDecisions: z.array(z.enum(['approved', 'provisional', 'returned', 'rejected'])),
  extractedValues: z.array(kpiExtractionSchema),
})

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

export type SubmissionListItem = z.infer<typeof submissionListItemSchema>
export type ValidationQueueItem = z.infer<typeof validationQueueItemSchema>
export type KpiExtraction = z.infer<typeof kpiExtractionSchema>
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>
export type ValidationDecisionRequest = z.infer<typeof validationDecisionRequestSchema>
