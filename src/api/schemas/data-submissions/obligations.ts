import { z } from 'zod'
import { filterOptionSchema } from '../filters'
import { pageOf, workflowActionSchema, workflowStatusSchema } from './common'

export const submissionTemplateSchema = z.object({
  id: z.string().min(1),
  // The deployed API currently serialises this as a number while the mock
  // contract uses a string. Keep one string representation in the UI.
  version: z.coerce.string().min(1),
  fileName: z.string().min(1),
  downloadUrl: z.string().min(1),
})

export const obligationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  /** The named person responsible for submitting this obligation — stakeholder
   * feedback asked to see a lead for submitting data, not the institution alone. */
  focalPerson: z.string().min(1).default('Not supplied'),
  /** FK → Dataset.id (see datasets.ts). `dataset` below stays as the
   * display label (mirrors Dataset.name) so every existing column/screen
   * reading it is unaffected — this is the real link that was missing. */
  datasetId: z.string().default(''),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  frequency: z.string().min(1),
  dueDate: z.iso.datetime(),
  dueLabel: z.string().min(1),
  status: workflowStatusSchema,
  template: submissionTemplateSchema,
  acceptedSubmissionId: z.string().nullable(),
  availableActions: z.array(workflowActionSchema),
})

/**
 * Aggregate data-operations indicators shown above the obligations table.
 *
 * Review asked for "count by status; average queue age; average days overdue
 * etc.", filterable by dataset and responsible organisation
 * (docs/M300 Monitoring Platform Feedback.pptx, slide 13). These are computed
 * over the whole filtered set, not the visible page, so the numbers describe
 * the filter rather than the pagination.
 */
export const obligationStatsSchema = z.object({
  total: z.number().int().min(0),
  byStatus: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      tone: z.string().min(1),
      count: z.number().int().min(0),
    }),
  ),
  overdueCount: z.number().int().min(0),
  /** Mean days overdue across overdue obligations; null when none are. */
  averageDaysOverdue: z.number().nullable(),
  /** Obligations still awaiting action (not accepted/approved). */
  openCount: z.number().int().min(0),
})

export const obligationListSchema = pageOf(obligationSchema).extend({
  stats: obligationStatsSchema,
})

export type ObligationStats = z.infer<typeof obligationStatsSchema>

export const entryFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  helpText: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'textarea']),
  required: z.boolean(),
  unit: z.string().nullable(),
  placeholder: z.string(),
  options: z.array(filterOptionSchema),
})

export const entrySectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  fields: z.array(entryFieldSchema),
})

export const manualEntryDefinitionSchema = z.object({
  obligationId: z.string().min(1),
  title: z.string().min(1),
  institution: z.string().min(1),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  frequency: z.string().optional(),
  consolidated: z.boolean().optional(),
  periods: z.array(z.string()).optional(),
  institutions: z.array(z.string()).optional(),
  sections: z.array(entrySectionSchema),
})

export const manualEntryRowSchema = z.object({
  period: z.string().optional(),
  institution: z.string().optional(),
  values: z.record(z.string(), z.string()),
})

export const manualEntryRequestSchema = z.object({
  values: z.record(z.string(), z.string()).optional(),
  rows: z.array(manualEntryRowSchema).optional(),
  sourceReference: z.string(),
  notes: z.string(),
})

export const uploadDefinitionSchema = z.object({
  obligationId: z.string().min(1),
  institution: z.string().min(1),
  dataset: z.string().min(1),
  reportingPeriod: z.string().min(1),
  template: submissionTemplateSchema,
  acceptedFileTypes: z.array(z.string().min(1)),
  acceptedFileTypesLabel: z.string().min(1),
  maxFileSizeMb: z.number().positive(),
})

export const draftSavedSchema = z.object({
  submissionId: z.string().min(1),
  version: z.number().int().min(1),
  status: workflowStatusSchema,
  message: z.string().min(1),
  nextUrl: z.string().min(1),
})

export type Obligation = z.infer<typeof obligationSchema>
export type EntryField = z.infer<typeof entryFieldSchema>
export type ManualEntryDefinition = z.infer<typeof manualEntryDefinitionSchema>
export type ManualEntryRequest = z.infer<typeof manualEntryRequestSchema>
export type UploadDefinition = z.infer<typeof uploadDefinitionSchema>
export type DraftSaved = z.infer<typeof draftSavedSchema>
