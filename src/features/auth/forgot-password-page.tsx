import { ForgotPasswordView } from './components/forgot-password-view'
import { useForgotPassword } from './use-forgot-password'

export function ForgotPasswordPage() {
  const passwordReset = useForgotPassword()
  return (
    <ForgotPasswordView
      form={passwordReset.form}
      onSubmit={passwordReset.submit}
      serverError={passwordReset.serverError}
      successMessage={passwordReset.successMessage}
    />
  )
}
