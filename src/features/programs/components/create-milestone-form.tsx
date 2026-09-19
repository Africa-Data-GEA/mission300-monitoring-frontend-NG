import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { BOTTLENECK_CATEGORIES, CATEGORY_LABELS } from '@/api/schemas/bottlenecks'
import {
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUSES,
  REGISTER_PRIORITY_LABELS,
  type CreateMilestoneRequest,
} from '@/api/schemas/programs'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

const REGISTER_PRIORITIES = Object.keys(REGISTER_PRIORITY_LABELS) as (keyof typeof REGISTER_PRIORITY_LABELS)[]

const NO_BOTTLENECK_VALUE = 'none'

/** The "add milestone" form fields, presented inside CreateMilestoneDialog. */
export function CreateMilestoneForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<CreateMilestoneRequest>
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
              <FormLabel>Milestone</FormLabel>
              <FormControl>
                <input
                  {...field}
                  autoFocus
                  className={INPUT_CLASS}
                  placeholder="e.g. Site handover complete"
                />
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
                <input {...field} className={INPUT_CLASS} placeholder="e.g. NISO" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="expectedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected date</FormLabel>
                <FormControl>
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={field.value ? field.value.slice(0, 10) : ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value ? new Date(event.target.value).toISOString() : '',
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGISTER_PRIORITIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {REGISTER_PRIORITY_LABELS[value]}
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
            name="bottleneckCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Bottleneck category{' '}
                  <span className="font-normal text-text-muted">(optional)</span>
                </FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === NO_BOTTLENECK_VALUE ? null : value)
                  }
                  value={field.value ?? NO_BOTTLENECK_VALUE}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_BOTTLENECK_VALUE}>None</SelectItem>
                    {BOTTLENECK_CATEGORIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {CATEGORY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="risk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Risk <span className="font-normal text-text-muted">(optional)</span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-20 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="What could delay or block this milestone"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Next action <span className="font-normal text-text-muted">(optional)</span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-20 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="What happens next and who owns it"
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
          <Button
            className="h-10 px-5"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Adding milestone…' : 'Add milestone'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
