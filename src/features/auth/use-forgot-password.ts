import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'react-router'
import { forgotPasswordRequestSchema } from '@/api/schemas/auth'
import { ApiError } from '@/lib/api-client'
import { requestPasswordReset } from './api'

interface ForgotPasswordValues {
  email: string
}

export function useForgotPassword() {
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const previousEmail =
    typeof location.state === 'object' &&
    location.state !== null &&
    'email' in location.state &&
    typeof location.state.email === 'string'
      ? location.state.email
      : ''

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: previousEmail },
  })

  const submit = form.handleSubmit(async ({ email }) => {
    setServerError('')
    try {
      const response = await requestPasswordReset(email.trim())
      setSuccessMessage(response.message)
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
