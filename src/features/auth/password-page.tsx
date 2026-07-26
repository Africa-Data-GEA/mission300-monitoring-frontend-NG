import { PasswordLoginView } from './components/password-login-view'
import { usePasswordLogin } from './use-password-login'

export function PasswordPage() {
  const login = usePasswordLogin()
  if (!login.account) return null

  return (
    <PasswordLoginView
      account={login.account}
      form={login.form}
      onBack={login.goBack}
      onShowPasswordChange={login.setShowPassword}
      onSubmit={login.submit}
      serverError={login.serverError}
      showPassword={login.showPassword}
    />
  )
}
