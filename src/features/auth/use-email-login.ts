import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { identifyAccountRequestSchema } from '@/api/schemas/auth'
import { ApiError } from '@/lib/api-client'
import { identifyAccount } from './api'
import { savePendingAccount } from './auth-session'

interface EmailFormValues {
  email: string
}

export function useEmailLogin() {
  const navigate = useNavigate()
  const location = useLocation()
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
    try {
      const account = await identifyAccount(email.trim())
      savePendingAccount(account)
      navigate('/account/change-password')
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      )
    }
  })

  return { form, serverError, submit }
}
