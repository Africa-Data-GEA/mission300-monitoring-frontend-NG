import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateLearningLogEntryRequest, LearningLogOptions } from '@/api/schemas/learning-log'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Kind = 'none' | 'kpi' | 'programme' | 'project'

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'none', label: 'Nothing in particular' },
  { value: 'kpi', label: 'A KPI' },
  { value: 'programme', label: 'A programme' },
  { value: 'project', label: 'A project' },
]

const NOUN: Record<Exclude<Kind, 'none'>, string> = { kpi: 'KPI', programme: 'programme', project: 'project' }

function kindOf(value: string, options: LearningLogOptions | undefined): Kind | null {
  if (!value || !options) return null
  if (options.kpis.some((option) => option.value === value)) return 'kpi'
  if (options.programmes.some((option) => option.value === value)) return 'programme'
  if (options.projects.some((option) => option.value === value)) return 'project'
  return null
}

export function RelatedRecordField({
  form,
  options,
}: {
  form: UseFormReturn<CreateLearningLogEntryRequest>
  options: LearningLogOptions | undefined
}) {
  const [chosenKind, setChosenKind] = useState<Kind | null>(null)
  const value = form.watch('relatedRecord') ?? ''
  const detected = kindOf(value, options)
  const legacy = Boolean(value) && Boolean(options) && detected === null
  const kind: Kind = chosenKind ?? detected ?? 'none'
  const choices = kind === 'none' ? [] : (options?.[kind === 'kpi' ? 'kpis' : kind === 'programme' ? 'programmes' : 'projects'] ?? [])

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-default" htmlFor="learning-related-kind">
          Related to <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <Select
          value={kind}
          onValueChange={(next) => {
            setChosenKind(next as Kind)
            form.setValue('relatedRecord', '')
          }}
        >
          <SelectTrigger id="learning-related-kind" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {legacy && chosenKind === null && (
          <p className="text-xs text-text-muted">Earlier reference kept as written: {value}</p>
        )}
      </div>

      {kind !== 'none' && (
        <FormField
          control={form.control}
          name="relatedRecord"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{kind === 'kpi' ? 'KPI' : kind === 'programme' ? 'Programme' : 'Project'}</FormLabel>
              <SearchableSelect
                value={field.value ?? ''}
                options={choices}
                onChange={field.onChange}
                placeholder={`Select a ${NOUN[kind]}`}
                searchPlaceholder={`Search ${NOUN[kind]}s…`}
                aria-label={kind === 'kpi' ? 'KPI' : kind === 'programme' ? 'Programme' : 'Project'}
                className="h-11"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}
