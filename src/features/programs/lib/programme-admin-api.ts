import {
  createProgrammeResponseSchema,
  type CreateProgrammeRequest,
} from '@/api/schemas/programs'
import { api } from '@/lib/api-client'

/** Mock-only admin create for a programme. Create-only for now — no edit or
 * delete affordance exists in the UI yet. Reachable by anyone, same as every
 * other mutation in this app: there is no auth/role enforcement anywhere. */
export function createProgramme(input: CreateProgrammeRequest) {
  return api.post('/programs', input, createProgrammeResponseSchema)
}
