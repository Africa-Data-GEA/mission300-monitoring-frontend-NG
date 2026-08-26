import { z } from 'zod'

export const workflowToneSchema = z.enum(['neutral', 'info', 'warning', 'danger', 'success'])

export const workflowStatusCodeSchema = z.enum([
  'due', 'draft', 'validation-failed', 'ready', 'pending-review',
  'returned', 'rejected', 'provisional', 'approved', 'overdue',
  'missing', 'open', 'in-progress', 'resolved',
  // Automated validation has its own backend states. They share the same
  // badge shape but are not submission workflow states.
  'pass', 'fail', 'pending',
])

export const workflowStatusSchema = z.object({
  code: workflowStatusCodeSchema,
  label: z.string().min(1),
  tone: workflowToneSchema,
})

export const workflowActionSchema = z.enum([
  'enter-data', 'upload-template', 'view', 'review', 'download-template',
  'correct', 'submit', 'contact-owner',
])

export const submissionMethodSchema = z.enum(['manual-entry', 'template-upload', 'api'])

export function pageOf<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  })
}

export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
export type WorkflowAction = z.infer<typeof workflowActionSchema>
export type SubmissionMethod = z.infer<typeof submissionMethodSchema>
