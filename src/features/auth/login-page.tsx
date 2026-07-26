import { EmailLoginView } from './components/email-login-view'
import { useEmailLogin } from './use-email-login'

export function LoginPage() {
  const login = useEmailLogin()
  return (
    <EmailLoginView
      form={login.form}
      onSubmit={login.submit}
      serverError={login.serverError}
    />
  )
}
