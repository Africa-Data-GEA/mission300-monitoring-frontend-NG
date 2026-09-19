import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createMilestoneRequestSchema,
  type CreateMilestoneRequest,
} from '@/api/schemas/programs'
import { ApiError } from '@/lib/api-client'
import { createMilestone } from './api'

/** Form state and submission for the "add milestone" dialog on a project. */
export function useCreateMilestone(projectId: string, onCreated: () => void) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const form = useForm<CreateMilestoneRequest>({
    resolver: zodResolver(createMilestoneRequestSchema),
    defaultValues: {
      name: '',
      leadInstitution: '',
      expectedDate: '',
      priority: 'standard',
      status: 'on-track',
      risk: '',
      nextAction: '',
      bottleneckCategory: null,
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await createMilestone(projectId, values)
      setSuccessMessage(response.message)
      form.reset()
      onCreated()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The milestone could not be added. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
