import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  BOTTLENECK_CATEGORIES,
  CATEGORY_LABELS,
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGES,
  REGISTER_SEVERITIES,
  SEVERITY_LABELS,
  type CreateBottleneckRequest,
} from '@/api/schemas/bottlenecks'
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
import { PILLARS, PILLAR_LABELS } from '@/types/domain'
import type { FilterOption } from '@/types/filters'

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

/** The "raise a bottleneck" form fields, presented inside CreateBottleneckDialog. */
export function CreateBottleneckForm({
  form,
  onSubmit,
  serverError,
  institutions,
}: {
  form: UseFormReturn<CreateBottleneckRequest>
  onSubmit: () => void
  serverError: string
  /** Institutions offered in the picker, from this module's own filters. */
  institutions: readonly FilterOption[]
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="issue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  autoFocus
                  className="min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="Describe the constraint or exception"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGISTER_SEVERITIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {SEVERITY_LABELS[value]}
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
            name="lifecycleStage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lifecycle stage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LIFECYCLE_STAGES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LIFECYCLE_STAGE_LABELS[value]}
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
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsible institution</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {institutions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="linkedRecord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Linked record{' '}
                  <span className="font-normal text-text-muted">(optional)</span>
                </FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className={INPUT_CLASS}
                    placeholder="e.g. IMP-2025-0142"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="followUp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Follow-up{' '}
                <span className="font-normal text-text-muted">(optional)</span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="Next action and who owns it"
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
            {form.formState.isSubmitting ? 'Raising bottleneck…' : 'Raise bottleneck'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
