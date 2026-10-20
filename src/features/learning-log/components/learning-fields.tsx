import type { UseFormReturn } from 'react-hook-form'
import type { CreateLearningLogEntryRequest } from '@/api/schemas/learning-log'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle'
const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

export function LearningFields({ form }: { form: UseFormReturn<CreateLearningLogEntryRequest> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="context"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What happened</FormLabel>
            <FormControl>
              <textarea {...field} value={field.value ?? ''} className={TEXTAREA_CLASS} placeholder="The situation or result that prompted this learning" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lesson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What we learned</FormLabel>
            <FormControl>
              <textarea {...field} value={field.value ?? ''} className={TEXTAREA_CLASS} placeholder="The insight, in plain words" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recommendation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              What to do differently <span className="font-normal text-text-muted">(optional)</span>
            </FormLabel>
            <FormControl>
              <textarea {...field} value={field.value ?? ''} className={TEXTAREA_CLASS} placeholder="The change that should follow from this" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="evidence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Evidence or source <span className="font-normal text-text-muted">(optional)</span>
            </FormLabel>
            <FormControl>
              <input {...field} value={field.value ?? ''} className={INPUT_CLASS} placeholder="e.g. Q3 2026 submission data, a stakeholder meeting" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
