import type { UseFormReturn } from 'react-hook-form'
import type { CreateLearningLogEntryRequest } from '@/api/schemas/learning-log'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle'

export function DecisionFields({ form }: { form: UseFormReturn<CreateLearningLogEntryRequest> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="decision"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What was decided or proposed</FormLabel>
            <FormControl>
              <textarea {...field} value={field.value ?? ''} className={TEXTAREA_CLASS} placeholder="What changed, or what's being proposed" />
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
              <textarea {...field} value={field.value ?? ''} className={TEXTAREA_CLASS} placeholder="Why — what prompted this" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
