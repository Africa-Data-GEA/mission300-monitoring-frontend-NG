import { z } from 'zod'
import { obligationSchema } from './data-submissions/obligations'
import { improvementDirectionSchema, pillarIdSchema } from './common'
import { executionStatusSchema, registerPrioritySchema } from './programs'
import { lifecycleStageSchema } from './bottlenecks'

export const institutionSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
})

export const institutionObligationSummarySchema = z.object({
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
  fulfilledCount: z.number().int().min(0),
})

export const institutionKpiSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  pillar: pillarIdSchema,
  period: z.string().min(1),
  value: z.number(),
  target: z.number().nullable(),
  targetLabel: z.string().nullable(),
  direction: improvementDirectionSchema,
  onTrack: z.boolean().nullable(),
})

export const institutionProgrammeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pillar: pillarIdSchema,
  status: executionStatusSchema,
  priority: registerPrioritySchema,
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  projectCount: z.number().int().min(0),
})

export const institutionProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  programme: z.string().min(1),
  pillar: pillarIdSchema,
  lifecycleStage: lifecycleStageSchema,
  currentStatus: executionStatusSchema,
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime().nullable(),
})

export const institutionOverviewSchema = z.object({
  institution: institutionSummarySchema,
  obligations: z.object({
    summary: institutionObligationSummarySchema,
    recent: z.array(obligationSchema),
  }),
  kpis: z.array(institutionKpiSchema),
  programmes: z.array(institutionProgrammeSchema),
  projects: z.array(institutionProjectSchema),
})

export type InstitutionOverview = z.infer<typeof institutionOverviewSchema>
export type InstitutionKpi = z.infer<typeof institutionKpiSchema>
export type InstitutionProgramme = z.infer<typeof institutionProgrammeSchema>
export type InstitutionProject = z.infer<typeof institutionProjectSchema>
