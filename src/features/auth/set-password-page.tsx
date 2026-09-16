import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthLayout } from './components/auth-layout'
import { setAccountPassword } from './api'
import { authErrorMessage } from './auth-error-message'
import { clearAuthSession } from './auth-session'

export function SetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [token] = useState(() => new URLSearchParams(location.search).get('token') ?? '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  // Reset links carry a one-time secret. Remove it from the visible URL and browser history.
  useEffect(() => {
    if (location.search) navigate(location.pathname, { replace: true })
  }, [location.pathname, location.search, navigate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return setError('This link is missing its token. Request a new link.')
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirmation) return setError('The passwords do not match.')
    setError('')
    setPending(true)
    try {
      const response = await setAccountPassword(token, password)
      clearAuthSession()
      setSuccess(response.message)
      setPassword('')
      setConfirmation('')
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold text-text-default">Set your password</h1>
      {success ? (
        <div role="status" className="mt-4">
          <p>{success}</p>
          <Link to="/account/login" className="mt-4 inline-block font-medium text-brand-700">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-4">
          {!token && <p role="alert" className="text-status-at-risk">This link is missing its token. Request a new link.</p>}
          <label className="block text-sm font-medium text-text-default">
            New password
            <input type="password" autoComplete="new-password" required minLength={8}
              value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending}
              className="mt-2 h-11 w-full rounded-control border border-border-strong bg-surface px-3" />
          </label>
          <label className="block text-sm font-medium text-text-default">
            Confirm new password
            <input type="password" autoComplete="new-password" required minLength={8}
              value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={pending}
              className="mt-2 h-11 w-full rounded-control border border-border-strong bg-surface px-3" />
          </label>
          {error && <p role="alert" className="text-sm text-status-at-risk">{error}</p>}
          <button type="submit" disabled={pending || !token}
            className="h-11 w-full rounded-control bg-brand-700 font-medium text-white disabled:opacity-50">
            {pending ? 'Saving…' : 'Save password'}
          </button>
          <Link to="/account/forgot-password" className="inline-block text-sm text-brand-700">Request a new link</Link>
        </form>
      )}
    </AuthLayout>
  )
}
