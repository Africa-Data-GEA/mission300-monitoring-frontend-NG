import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { AuthLayout } from './auth-layout'
import { AuthSubmitButton } from './auth-submit-button'

interface ForgotPasswordValues {
  email: string
}

export function ForgotPasswordView({
  form,
  onSubmit,
  serverError,
  successMessage,
}: {
  readonly form: UseFormReturn<ForgotPasswordValues>
  readonly onSubmit: () => void
  readonly serverError: string
  readonly successMessage: string
}) {
  return (
    <AuthLayout>
      <div className="auth-step-enter">
        <Link
          className="-ml-2 mb-5 inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-default"
          to="/account/login"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to sign in
        </Link>

        {successMessage ? (
          <div aria-live="polite">
            <CheckCircle2 aria-hidden="true" className="mb-5 size-10 text-brand-600" />
            <h1 className="text-3xl font-semibold text-text-default">Check your email</h1>
            <p className="mt-3 text-base text-text-muted">{successMessage}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-text-default">Forgot password?</h1>
            <p className="mt-2 text-base text-text-muted">
              Enter your work email and we will send password reset instructions.
            </p>
            <Form {...form}>
              <form className="mt-7" noValidate onSubmit={onSubmit}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          autoComplete="email"
                          autoFocus
                          className={cn(
                            'h-11 w-full rounded-control border bg-surface px-3.5 text-base text-text-default transition-[border-color,box-shadow] placeholder:text-text-subtle',
                            fieldState.error
                              ? 'border-status-at-risk'
                              : 'border-border-strong hover:border-text-subtle',
                          )}
                          disabled={form.formState.isSubmitting}
                          inputMode="email"
                          placeholder="name@organisation.gov.ng"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError ? (
                  <p className="mt-2 text-sm text-status-at-risk" role="alert">
                    {serverError}
                  </p>
                ) : null}
                <div className="mt-6">
                  <AuthSubmitButton loading={form.formState.isSubmitting}>
                    Send reset instructions
                  </AuthSubmitButton>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
