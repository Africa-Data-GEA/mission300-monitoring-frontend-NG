import { z } from 'zod'
import { filterOptionSchema } from '../filters'

export const dataSubmissionFiltersSchema = z.object({
  institutions: z.array(filterOptionSchema),
  datasets: z.array(filterOptionSchema),
  reportingPeriods: z.array(filterOptionSchema),
  submissionStatuses: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  reviewers: z.array(filterOptionSchema),
  readinessTiers: z.array(filterOptionSchema),
  overdueStatuses: z.array(filterOptionSchema),
})

export const dataSubmissionQuerySchema = z.object({
  search: z.string().optional(),
  institution: z.string().optional(),
  dataset: z.string().optional(),
  reportingPeriod: z.string().optional(),
  submissionStatus: z.string().optional(),
  validationStatus: z.string().optional(),
  reviewer: z.string().optional(),
  readinessTier: z.string().optional(),
  overdueStatus: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
})

export type DataSubmissionFilters = z.infer<typeof dataSubmissionFiltersSchema>
export type DataSubmissionQuery = z.infer<typeof dataSubmissionQuerySchema>
