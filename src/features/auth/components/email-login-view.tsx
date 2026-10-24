import type { UseFormReturn } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { AuthLayout } from './auth-layout'
import { AuthSubmitButton } from './auth-submit-button'

interface EmailFormValues {
  email: string
}

export function EmailLoginView({
  form,
  loading,
  onSubmit,
  serverError,
}: {
  readonly form: UseFormReturn<EmailFormValues>
  readonly loading: boolean
  readonly onSubmit: () => void
  readonly serverError: string
}) {
  return (
    <AuthLayout>
      <div className="auth-step-enter">
        <h1 className="text-3xl font-semibold text-text-default">Sign in</h1>
        <p className="mt-2 text-base text-text-muted">
          Enter your work email to continue to the Mission 300 Compact Monitoring Platform.
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
                        fieldState.error ? 'border-status-at-risk' : 'border-border-strong hover:border-text-subtle',
                      )}
                      disabled={loading}
                      inputMode="email"
                      placeholder="name@organisation.gov.ng"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError ? <p className="mt-2 text-sm text-status-at-risk" role="alert">{serverError}</p> : null}
            <div className="mt-6">
              <AuthSubmitButton loading={loading} loadingLabel="Checking account…">
                Next
              </AuthSubmitButton>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}
