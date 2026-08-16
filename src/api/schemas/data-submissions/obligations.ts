import { z } from 'zod'
import { filterOptionSchema } from '../filters'
import { pageOf, workflowActionSchema, workflowStatusSchema } from './common'

export const submissionTemplateSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  fileName: z.string().min(1),
  downloadUrl: z.string().min(1),
})

export const obligationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  /** The named person responsible for submitting this obligation — stakeholder
   * feedback asked to see a lead for submitting data, not the institution alone. */
  focalPerson: z.string().min(1),
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

export const obligationListSchema = pageOf(obligationSchema)

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
  sections: z.array(entrySectionSchema),
})

export const manualEntryRequestSchema = z.object({
  values: z.record(z.string(), z.string()),
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
