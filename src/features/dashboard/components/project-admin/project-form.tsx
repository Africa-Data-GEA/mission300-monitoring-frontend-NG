import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUSES,
  PIPELINE_READINESS_LABELS,
  PIPELINE_READINESS_TIERS,
  type UpsertProjectRequest,
} from '@/api/schemas/programs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'
import type { FilterOption } from '@/types/filters'

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

/** The "add / edit priority project" form fields, presented inside
 * UpsertProjectDialog. Scoped to the fields shown on the Overview
 * delivery-status table — funding, contacts and documents are only
 * editable from the full project profile in Programs. */
export function ProjectForm({
  form,
  onSubmit,
  serverError,
  programmes,
  isEditing,
}: {
  form: UseFormReturn<UpsertProjectRequest>
  onSubmit: () => void
  serverError: string
  /** Programmes offered in the picker, from the Programs module's own register. */
  programmes: readonly FilterOption[]
  isEditing: boolean
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <input {...field} autoFocus className={INPUT_CLASS} placeholder="e.g. Feeder Rehabilitation Lots, Lagos" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="programmeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programme</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select programme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programmes.map((option) => (
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

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner (accountable institution)</FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. Transmission Company of Nigeria" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project lead</FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. Ahmed Bello" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <input {...field} className={INPUT_CLASS} placeholder="e.g. Lagos State" />
                </FormControl>
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
            name="currentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current status</FormLabel>
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
                {isEditing && (
                  <p className="text-2xs text-text-subtle">
                    Changing this adds a new entry to the project&apos;s status evolution trail.
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pipelineReadiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipeline readiness</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'active' ? null : value)}
                  value={field.value ?? 'active'}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Not applicable — already active</SelectItem>
                    {PIPELINE_READINESS_TIERS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PIPELINE_READINESS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-2xs text-text-subtle">
                  Only for a project not yet in active delivery — leave as &quot;Not applicable&quot; once it is.
                </p>
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
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Comment <span className="font-normal text-text-muted">(optional)</span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="Issues, main risk or bottlenecks"
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
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add project'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
