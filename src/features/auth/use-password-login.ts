import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { dashboardToast } from '@/lib/dashboard-toast'
import { authErrorMessage } from './auth-error-message'
import { authenticate } from './api'
import { clearPendingAccount, readPendingAccount, saveAuthSession } from './auth-session'
import { showPendingState } from './show-pending-state'

const passwordFormSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function usePasswordLogin() {
  const navigate = useNavigate()
  const [account] = useState(readPendingAccount)
  const [isPending, setIsPending] = useState(false)
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
    setIsPending(true)
    await showPendingState()
    try {
      const session = await authenticate(account.email, password)
      saveAuthSession(session)
      // institutional-data-provider can't reach Executive Overview (see
      // role-access.ts's ROLE_MODULE_KEYS) — its landing page is its own
      // institution-scoped Data Submissions overview instead.
      const landingPath =
        session.user.role === 'institutional-data-provider' ? '/data-submissions' : '/dashboard'
      dashboardToast.success(`Welcome back, ${session.user.name}`, {
        description: 'You are now signed in to the M300 Monitoring Platform.',
      })
      navigate(landingPath, { replace: true })
    } catch (error) {
      const message = authErrorMessage(error)
      setServerError(message)
      dashboardToast.error('Sign-in failed', { description: message })
    } finally {
      setIsPending(false)
    }
  })

  function goBack() {
    clearPendingAccount()
    navigate('/account/login', { state: { email: account?.email ?? '' } })
  }

  return { account, form, goBack, isPending, serverError, showPassword, submit, setShowPassword }
}
