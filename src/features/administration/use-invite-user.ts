import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  inviteUserRequestSchema,
  type InviteUserRequest,
} from '@/api/schemas/administration'
import { ApiError } from '@/lib/api-client'
import { inviteUser } from './api'

export function useInviteUser(onInvited: () => void) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const form = useForm<InviteUserRequest>({
    resolver: zodResolver(inviteUserRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      institution: '',
      designation: '',
      role: 'read-only-user',
      accessScope: 'institution',
      invitationMessage: '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await inviteUser(values)
      setSuccessMessage(response.message)
      form.reset()
      onInvited()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The invitation could not be sent. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
