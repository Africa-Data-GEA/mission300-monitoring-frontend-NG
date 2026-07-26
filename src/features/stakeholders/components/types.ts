import type { z } from 'zod'
import { stakeholderFilterOptionsSchema } from '@/api/schemas/stakeholders'

export type StakeholderFilterOptions = z.infer<typeof stakeholderFilterOptionsSchema>
