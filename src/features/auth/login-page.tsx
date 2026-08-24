import { useEffect } from 'react'
import { EmailLoginView } from './components/email-login-view'
import { useEmailLogin } from './use-email-login'

export function LoginPage() {
  const login = useEmailLogin()

  useEffect(() => {
    void import('./password-page')
  }, [])

  return (
    <EmailLoginView
      form={login.form}
      loading={login.isPending}
      onSubmit={login.submit}
      serverError={login.serverError}
    />
  )
}
