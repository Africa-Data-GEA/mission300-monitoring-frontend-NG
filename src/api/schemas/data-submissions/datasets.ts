import { z } from 'zod'
import { pillarIdSchema } from '../common'
import { submissionTemplateSchema } from './obligations'

/**
 * A dataset an institution is expected to submit — the entity `Obligation`
 * was only ever pointing at by a free-text label (`Obligation.dataset`)
 * matching by convention, not a real record. This is that real record:
 * purpose, required data points, reporting frequency, the pillar it belongs
 * to, the institution that owns it, and its own submission template (no
 * longer one template shared across every dataset).
 */
export const datasetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  pillar: pillarIdSchema,
  requiredDataPoints: z.array(z.string().min(1)),
  frequency: z.string().min(1),
  ownerInstitution: z.string().min(1),
  template: submissionTemplateSchema,
})

export const datasetListSchema = z.array(datasetSchema)

export type Dataset = z.infer<typeof datasetSchema>
