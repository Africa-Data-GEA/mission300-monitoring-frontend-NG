import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUSES,
  type CreateProgrammeRequest,
} from '@/api/schemas/programs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

/** The "add programme" form fields. Scoped to the essentials a new
 * programme needs to exist — supporting institutions, priority and
 * bottlenecks are only editable from the full programme record, once that
 * profile view exists. */
export function ProgrammeForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<CreateProgrammeRequest>
  onSubmit: () => void
  serverError: string
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programme name</FormLabel>
              <FormControl>
                <input {...field} autoFocus className={INPUT_CLASS} placeholder="e.g. Feeder Rehabilitation Programme" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leadInstitution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead institution</FormLabel>
              <FormControl>
                <input {...field} className={INPUT_CLASS} placeholder="e.g. Transmission Company of Nigeria" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectives</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="What this programme sets out to achieve"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pillar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compact pillar</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PILLARS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PILLAR_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXECUTION_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {EXECUTION_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projected completion date</FormLabel>
                <FormControl>
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={field.value ? field.value.slice(0, 10) : ''}
                    onChange={(event) =>
                      field.onChange(event.target.value ? new Date(event.target.value).toISOString() : '')
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="financing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Financing <span className="font-normal text-text-muted">(optional)</span>
                </FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. World Bank DARES facility" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError && (
          <p className="text-sm text-status-at-risk" role="alert">
            {serverError}
          </p>
        )}

        <div className="flex justify-end border-t border-border-default pt-5">
          <Button className="h-10 px-5" disabled={form.formState.isSubmitting} type="submit">
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Saving…' : 'Add programme'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
