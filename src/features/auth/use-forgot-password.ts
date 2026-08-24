import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'react-router'
import { forgotPasswordRequestSchema } from '@/api/schemas/auth'
import { ApiError } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import { requestPasswordReset } from './api'
import { showPendingState } from './show-pending-state'

interface ForgotPasswordValues {
  email: string
}

export function useForgotPassword() {
  const location = useLocation()
  const [isPending, setIsPending] = useState(false)
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
    setIsPending(true)
    await showPendingState()
    try {
      const response = await requestPasswordReset(email.trim())
      setSuccessMessage(response.message)
      dashboardToast.success('Reset instructions sent', { description: response.message })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      setServerError(message)
      dashboardToast.error('Reset request failed', { description: message })
    } finally {
      setIsPending(false)
    }
  })

  return { form, isPending, serverError, submit, successMessage }
}
