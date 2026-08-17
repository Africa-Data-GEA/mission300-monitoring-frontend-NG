import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createProgrammeRequestSchema,
  type CreateProgrammeRequest,
  type ProgrammeRecord,
} from '@/api/schemas/programs'
import { ApiError } from '@/lib/api-client'
import { createProgramme } from './programme-admin-api'

const DEFAULT_VALUES: CreateProgrammeRequest = {
  name: '',
  leadInstitution: '',
  pillar: 'generation-network',
  objectives: '',
  status: 'on-track',
  endDate: '',
  financing: '',
}

/** Form state and submission for the "add programme" page. Mirrors
 * use-upsert-project.ts's create path — no edit mode, since programmes have
 * no edit affordance yet. */
export function useCreateProgramme(onSaved: () => void) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [savedRecord, setSavedRecord] = useState<ProgrammeRecord | null>(null)
  const form = useForm<CreateProgrammeRequest>({
    resolver: zodResolver(createProgrammeRequestSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await createProgramme(values)
      setSuccessMessage(response.message)
      setSavedRecord(response.record)
      form.reset()
      onSaved()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The programme could not be saved. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage, savedRecord }
}
