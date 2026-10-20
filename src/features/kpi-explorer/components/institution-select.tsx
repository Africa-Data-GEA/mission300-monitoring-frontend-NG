import { SelectField } from '@/components/ui/select-field'
import { useInstitutionOptions } from '@/features/administration/api'

export function InstitutionSelect({
  label,
  value,
  onChange,
  labelClassName,
  triggerClassName,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  labelClassName?: string
  triggerClassName?: string
}) {
  const institutions = useInstitutionOptions()
  const names = (institutions.data ?? []).map((institution) => institution.name)
  const options = (value && !names.includes(value) ? [value, ...names] : names).map((name) => ({
    value: name,
    label: name,
  }))

  return (
    <SelectField
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={institutions.isLoading ? 'Loading institutions...' : 'Select an institution'}
      disabled={institutions.isLoading}
      searchable
      labelClassName={labelClassName}
      triggerClassName={triggerClassName}
    />
  )
}
