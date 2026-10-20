import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createLearningLogEntryRequestSchema,
  type CreateLearningLogEntryRequest,
  type LearningLogType,
} from '@/api/schemas/learning-log'
import { ApiError } from '@/lib/api-client'
import { useCreateLearningLogEntry } from './api'

/** Form state and submission for the "log a decision" dialog, mirroring
 * use-create-bottleneck.ts. */
export function useCreateLearningLogForm(entryType: LearningLogType, onCreated: () => void) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const mutation = useCreateLearningLogEntry()

  const form = useForm<CreateLearningLogEntryRequest>({
    resolver: zodResolver(createLearningLogEntryRequestSchema),
    defaultValues: {
      entryType,
      title: '',
      area: 'kpi-methodology',
      decision: '',
      rationale: '',
      context: '',
      lesson: '',
      recommendation: '',
      evidence: '',
      relatedRecord: '',
      reviewCycle: '',
      status: entryType === 'learning' ? 'captured' : 'proposed',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await mutation.mutateAsync(values)
      setSuccessMessage(response.message)
      form.reset()
      onCreated()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The entry could not be logged. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
