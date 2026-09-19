import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { dashboardToast } from '@/lib/dashboard-toast'
import { prefetchExecutiveOverview } from '@/features/dashboard/api'
import { DEFAULT_FILTER_VALUES } from '@/api/schemas/filters'
import { authErrorMessage } from './auth-error-message'
import { authenticate } from './api'
import { clearPendingAccount, readPendingAccount, saveAuthSession } from './auth-session'
import { showPendingState } from './show-pending-state'
import { landingPathForUser } from './role-access'

const passwordFormSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function usePasswordLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
      const landingPath = landingPathForUser(session.user)
      // Starts the landing page's data request in parallel with the route
      // transition instead of after it - by the time DashboardPage mounts
      // and calls useExecutiveOverview, the cache is already warm and the
      // full-page skeleton never shows.
      if (landingPath === '/dashboard') void prefetchExecutiveOverview(queryClient, DEFAULT_FILTER_VALUES)
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
