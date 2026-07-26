import { Upload } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { ImportRegisterRequest } from '@/api/schemas/implementation-register'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

/** The "import register update" file picker, presented inside ImportRegisterDialog. */
export function ImportRegisterForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<ImportRegisterRequest>
  onSubmit: () => void
  serverError: string
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Register template</FormLabel>
              <FormControl>
                <input
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  accept=".csv,.xlsx"
                  className="w-full rounded-control border border-border-strong bg-surface px-3.5 py-3 text-sm text-text-default file:mr-3 file:rounded-control file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
                  onChange={(event) => field.onChange(event.target.files?.[0]?.name ?? '')}
                  type="file"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-status-at-risk" role="alert">
            {serverError}
          </p>
        )}

        <div className="flex justify-end border-t border-border-default pt-5">
          <Button className="h-10 px-5" disabled={form.formState.isSubmitting} type="submit">
            <Upload aria-hidden="true" />
            {form.formState.isSubmitting ? 'Validating…' : 'Upload and validate'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
