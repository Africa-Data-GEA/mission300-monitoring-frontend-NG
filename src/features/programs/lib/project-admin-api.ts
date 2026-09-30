import {
  bulkUploadResultSchema,
  upsertProjectResponseSchema,
  type UpsertProjectRequest,
} from '@/api/schemas/programs'
import { api } from '@/lib/api-client'

export const BULK_UPLOAD_TEMPLATE_URL = '/programs/bulk-upload/template'
export const BULK_UPLOAD_TEMPLATE_FILE_NAME = 'programs-projects-template.xlsx'

/**
 * Mock-only admin CRUD for a priority project — stakeholder feedback asked
 * to be able to add, modify and delete priority items, both from the
 * Overview delivery-status table and from Programs itself. Reachable by
 * anyone, same as every other mutation in this app: there is no auth/role
 * enforcement anywhere yet (see upsertProjectRequestSchema's comment in
 * schemas/programs.ts).
 */
export function createProject(input: UpsertProjectRequest) {
  return api.post('/programs/projects', input, upsertProjectResponseSchema)
}

export function updateProject(projectId: string, input: UpsertProjectRequest) {
  return api.patch(`/programs/projects/${projectId}`, input, upsertProjectResponseSchema)
}

export function deleteProject(projectId: string) {
  return api.delete<{ message: string }>(`/programs/projects/${projectId}`)
}

export function bulkUploadProjects(file: File, dryRun: boolean) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('dryRun', dryRun ? 'true' : 'false')
  return api.post('/programs/bulk-upload', formData, bulkUploadResultSchema)
}
