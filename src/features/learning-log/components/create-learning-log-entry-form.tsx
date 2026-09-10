import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  LEARNING_LOG_AREA_LABELS,
  LEARNING_LOG_AREAS,
  LEARNING_LOG_STATUS_LABELS,
  LEARNING_LOG_STATUSES,
  type CreateLearningLogEntryRequest,
} from '@/api/schemas/learning-log'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'
const TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle'

/** The "log a decision" form fields, presented inside CreateLearningLogEntryDialog. */
export function CreateLearningLogEntryForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<CreateLearningLogEntryRequest>
  onSubmit: () => void
  serverError: string
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <input {...field} autoFocus className={INPUT_CLASS} placeholder="e.g. Split renewable share into two KPIs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEARNING_LOG_AREAS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LEARNING_LOG_AREA_LABELS[value]}
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
                    {LEARNING_LOG_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LEARNING_LOG_STATUS_LABELS[value]}
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
            name="reviewCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review cycle</FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. Q4 2026 review" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relatedRecord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Related record <span className="font-normal text-text-muted">(optional)</span>
                </FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. M300-P1-015" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What was decided or proposed</FormLabel>
              <FormControl>
                <textarea {...field} className={TEXTAREA_CLASS} placeholder="What changed, or what's being proposed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rationale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rationale</FormLabel>
              <FormControl>
                <textarea {...field} className={TEXTAREA_CLASS} placeholder="Why — what prompted this" />
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
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Logging…' : 'Log entry'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
