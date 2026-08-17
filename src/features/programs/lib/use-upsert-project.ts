import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  upsertProjectRequestSchema,
  type ProjectRecord,
  type UpsertProjectRequest,
} from '@/api/schemas/programs'
import { ApiError } from '@/lib/api-client'
import { createProject, updateProject } from './project-admin-api'

/**
 * Form state and submission for the "add / edit priority project" page.
 * Mirrors src/features/bottlenecks/use-create-bottleneck.ts: a react-hook-form
 * instance validated against the same zod schema the server enforces, plus
 * server-error and success-message state the page reads to decide which
 * view to show. `editingProjectId` switches submit between create (POST) and
 * update (PATCH) without duplicating the form.
 */
export function useUpsertProject(
  onSaved: () => void,
  editingProjectId: string | null,
  defaultValues: UpsertProjectRequest,
) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [savedRecord, setSavedRecord] = useState<ProjectRecord | null>(null)
  const form = useForm<UpsertProjectRequest>({
    resolver: zodResolver(upsertProjectRequestSchema),
    defaultValues,
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = editingProjectId
        ? await updateProject(editingProjectId, values)
        : await createProject(values)
      setSuccessMessage(response.message)
      setSavedRecord(response.record)
      form.reset()
      onSaved()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The project could not be saved. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage, savedRecord }
}
