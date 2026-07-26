import { z } from 'zod'
import { filterOptionSchema } from './filters'

export const institutionStatusSchema = z.enum(['active', 'pending-onboarding', 'inactive'])
export const institutionTypeSchema = z.enum([
  'ministry',
  'agency',
  'regulator',
  'utility',
  'disco',
  'programme-team',
  'partner',
])

export const institutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  type: institutionTypeSchema,
  status: institutionStatusSchema,
  coverage: z.string().min(1),
  roles: z.array(z.string().min(1)),
  datasets: z.array(z.string().min(1)),
  programmes: z.array(z.string().min(1)),
  lastUpdated: z.iso.datetime(),
})

export const custodianAssignmentSchema = z.object({
  id: z.string().min(1),
  dataset: z.string().min(1),
  custodian: z.string().min(1),
  focalPerson: z.string().min(1),
  frequency: z.string().min(1),
  template: z.string().min(1),
  reviewer: z.string().min(1),
  validator: z.string().min(1),
  status: z.enum(['active', 'pending']),
})

export const stakeholderSummarySchema = z.object({
  activeInstitutions: z.number().int().min(0),
  dataCustodians: z.number().int().min(0),
  pendingOnboarding: z.number().int().min(0),
})

export const stakeholderFilterOptionsSchema = z.object({
  institutionTypes: z.array(filterOptionSchema),
  roles: z.array(filterOptionSchema),
  statuses: z.array(filterOptionSchema),
  datasets: z.array(filterOptionSchema),
  kpis: z.array(filterOptionSchema),
  programmes: z.array(filterOptionSchema),
  coverageAreas: z.array(filterOptionSchema),
})

export const stakeholdersOverviewSchema = z.object({
  summary: stakeholderSummarySchema,
  institutions: z.array(institutionSchema),
  custodians: z.array(custodianAssignmentSchema),
  filters: stakeholderFilterOptionsSchema,
  lastUpdated: z.iso.datetime(),
})

export interface StakeholdersQuery {
  search?: string
  institutionType?: string
  role?: string
  status?: string
  dataset?: string
  kpi?: string
  programme?: string
  coverage?: string
}

export type Institution = z.infer<typeof institutionSchema>
export type CustodianAssignment = z.infer<typeof custodianAssignmentSchema>
