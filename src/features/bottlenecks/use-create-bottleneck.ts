import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createBottleneckRequestSchema,
  type CreateBottleneckRequest,
} from '@/api/schemas/bottlenecks'
import { ApiError } from '@/lib/api-client'
import { createBottleneck } from './api'

/**
 * Form state and submission for the "raise a bottleneck" dialog.
 *
 * Mirrors src/features/administration/use-invite-user.ts: a react-hook-form
 * instance validated against the same zod schema the server enforces, plus
 * server-error and success-message state the dialog reads to decide which
 * view to show.
 */
export function useCreateBottleneck(onCreated: () => void, defaultLinkedRecord = '') {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const form = useForm<CreateBottleneckRequest>({
    resolver: zodResolver(createBottleneckRequestSchema),
    defaultValues: {
      issue: '',
      category: 'coordination',
      severity: 'medium',
      pillar: 'generation-network',
      linkedRecord: defaultLinkedRecord,
      institution: '',
      lifecycleStage: 'identification',
      followUp: '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await createBottleneck(values)
      setSuccessMessage(response.message)
      form.reset()
      onCreated()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The record could not be created. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
