import type { UseFormReturn } from 'react-hook-form'
import type { CreateBottleneckRequest } from '@/api/schemas/bottlenecks'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FilterOption } from '@/types/filters'

export type LinkKind = 'pillar' | 'programme' | 'project'

const KIND_OPTIONS: { value: LinkKind; label: string }[] = [
  { value: 'pillar', label: 'Pillar only' },
  { value: 'programme', label: 'A programme' },
  { value: 'project', label: 'A project' },
]

export function BottleneckLinkField({
  form,
  kind,
  onKindChange,
  programmes,
  projects,
}: {
  form: UseFormReturn<CreateBottleneckRequest>
  kind: LinkKind
  onKindChange: (kind: LinkKind) => void
  programmes: readonly FilterOption[]
  projects: readonly FilterOption[]
}) {
  const options = kind === 'programme' ? programmes : projects

  return (
    <>
      <FormItem>
        <label className="text-sm font-medium text-text-default" htmlFor="bottleneck-link-kind">
          Linked to
        </label>
        <Select
          value={kind}
          onValueChange={(value) => {
            onKindChange(value as LinkKind)
            form.setValue('linkedRecord', '')
            form.clearErrors('linkedRecord')
          }}
        >
          <SelectTrigger id="bottleneck-link-kind" className="h-11">
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
      </FormItem>

      {kind !== 'pillar' && (
        <FormField
          control={form.control}
          name="linkedRecord"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{kind === 'programme' ? 'Programme' : 'Project'}</FormLabel>
              <SearchableSelect
                value={field.value ?? ''}
                options={options}
                onChange={field.onChange}
                placeholder={`Select a ${kind}`}
                aria-label={kind === 'programme' ? 'Programme' : 'Project'}
                searchPlaceholder={`Search ${kind === 'programme' ? 'programmes' : 'projects'}…`}
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
