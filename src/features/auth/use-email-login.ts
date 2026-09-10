import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { identifyAccountRequestSchema } from '@/api/schemas/auth'
import { dashboardToast } from '@/lib/dashboard-toast'
import { authErrorMessage } from './auth-error-message'
import { identifyAccount } from './api'
import { savePendingAccount } from './auth-session'
import { showPendingState } from './show-pending-state'

interface EmailFormValues {
  email: string
}

export function useEmailLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState('')
  const previousEmail =
    typeof location.state === 'object' &&
    location.state !== null &&
    'email' in location.state &&
    typeof location.state.email === 'string'
      ? location.state.email
      : ''
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(identifyAccountRequestSchema),
    defaultValues: { email: previousEmail },
  })

  const submit = form.handleSubmit(async ({ email }) => {
    setServerError('')
    setIsPending(true)
    await showPendingState()
    try {
      const account = await identifyAccount(email.trim())
      savePendingAccount(account)
      navigate('/account/password')
    } catch (error) {
      const message = authErrorMessage(error)
      setServerError(message)
      dashboardToast.error('Account could not be verified', { description: message })
    } finally {
      setIsPending(false)
    }
  })

  return { form, isPending, serverError, submit }
}
