import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { ApiError } from '@/lib/api-client'
import { authenticate } from './api'
import { clearPendingAccount, readPendingAccount, saveAuthSession } from './auth-session'

const passwordFormSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function usePasswordLogin() {
  const navigate = useNavigate()
  const [account] = useState(readPendingAccount)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: '' },
  })

  useEffect(() => {
    if (!account) navigate('/account/login', { replace: true })
  }, [account, navigate])

  const submit = form.handleSubmit(async ({ password }) => {
    if (!account) return
    setServerError('')
    try {
      const session = await authenticate(account.email, password)
      saveAuthSession(session)
      // institutional-data-provider can't reach Executive Overview (see
      // role-access.ts's ROLE_MODULE_KEYS) — its landing page is its own
      // institution-scoped Data Submissions overview instead.
      const landingPath =
        session.user.role === 'institutional-data-provider' ? '/data-submissions' : '/dashboard'
      navigate(landingPath, { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      )
    }
  })

  function goBack() {
    clearPendingAccount()
    navigate('/account/login', { state: { email: account?.email ?? '' } })
  }

  return { account, form, goBack, serverError, showPassword, submit, setShowPassword }
}
