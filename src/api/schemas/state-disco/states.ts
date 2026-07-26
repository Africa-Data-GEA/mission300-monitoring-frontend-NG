import { z } from 'zod'
import { pageMetaSchema } from './common'

export const stateCoverageRowSchema = z.object({
  id: z.string().min(1),
  state: z.string().min(1),
  zone: z.string().min(1),
  miniGridConnections: z.string().min(1),
  solarHomeSystems: z.string().min(1),
  activeProgrammes: z.string().min(1),
  activeProjects: z.string().min(1),
  openBottlenecks: z.string().min(1),
  validationLabel: z.string().min(1),
  coverageBarPercent: z.number().min(0).max(100),
})

export const stateCoverageSchema = z.object({
  meta: pageMetaSchema,
  notice: z.string().min(1),
  rows: z.array(stateCoverageRowSchema),
})

export const stateRecordSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['programme', 'project', 'bottleneck']),
  name: z.string().min(1),
  owner: z.string().min(1),
  status: z.string().min(1),
  deliveryLabel: z.string().min(1),
  sourceLabel: z.string().min(1),
})

export const stateDetailSchema = z.object({
  meta: pageMetaSchema,
  state: stateCoverageRowSchema,
  notice: z.string().min(1),
  records: z.array(stateRecordSchema),
})

export type StateCoverageRow = z.infer<typeof stateCoverageRowSchema>
export type StateDetail = z.infer<typeof stateDetailSchema>
