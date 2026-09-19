import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router'
import type { IdentifiedAccount } from '@/api/schemas/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { AuthLayout } from './auth-layout'
import { AuthSubmitButton } from './auth-submit-button'

interface PasswordFormValues {
  password: string
}

export function PasswordLoginView({
  account,
  form,
  loading,
  onBack,
  onShowPasswordChange,
  onSubmit,
  serverError,
  showPassword,
}: {
  readonly account: IdentifiedAccount
  readonly form: UseFormReturn<PasswordFormValues>
  readonly loading: boolean
  readonly onBack: () => void
  readonly onShowPasswordChange: (visible: boolean) => void
  readonly onSubmit: () => void
  readonly serverError: string
  readonly showPassword: boolean
}) {
  return (
    <AuthLayout>
      <div className="auth-step-enter">
        <button
          className="-ml-2 mb-5 inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-default"
          disabled={loading}
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back
        </button>
        <h1 className="text-3xl font-semibold text-text-default">
          Enter your password
        </h1>
        <button
          className="mt-3 inline-flex max-w-full items-center gap-2 rounded-pill border border-border-default bg-surface-sunken px-3 py-2 text-sm text-text-muted transition-colors hover:border-border-strong"
          disabled={loading}
          onClick={onBack}
          title="Use a different account"
          type="button"
        >
          <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
          <span className="truncate">{account.email}</span>
        </button>
        <Form {...form}>
          <form className="mt-7" noValidate onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Password</FormLabel>
                    <Link
                      className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
                      state={{ email: account.email }}
                      to="/account/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-text-subtle" />
                    <FormControl>
                      <input
                        {...field}
                        autoComplete="current-password"
                        autoFocus
                        className={cn(
                          'h-11 w-full rounded-control border bg-surface py-2 pl-10 pr-11 text-base text-text-default transition-[border-color,box-shadow] placeholder:text-text-subtle',
                          fieldState.error ? 'border-status-at-risk' : 'border-border-strong hover:border-text-subtle',
                        )}
                        disabled={loading}
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                      />
                    </FormControl>
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-default"
                      onClick={() => onShowPasswordChange(!showPassword)}
                      type="button"
                    >
                      {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError ? <p className="mt-2 text-sm text-status-at-risk" role="alert">{serverError}</p> : null}
            <div className="mt-6">
              <AuthSubmitButton loading={loading} loadingLabel="Signing in…">
                Sign in
              </AuthSubmitButton>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}
