import { useState } from 'react'
import type { ReportSchedule, ReportScheduleInput } from '@/api/schemas/report-schedules'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import {
  CADENCE_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  HOUR_OPTIONS,
  WEEKDAY_OPTIONS,
  emptyScheduleForm,
  formFromSchedule,
  inputFromForm,
  parseRecipients,
  validateScheduleForm,
  type ScheduleFormValues,
} from '../lib/schedule-form'
import { useScheduleAudiences } from '../schedules-api'

const FIELD_CLASS = 'rounded-control border border-border-strong bg-surface px-3 text-sm text-text-default'

export function ReportScheduleForm({
  schedule,
  isSaving,
  onSave,
  onCancel,
}: {
  schedule: ReportSchedule | null
  isSaving: boolean
  onSave: (input: ReportScheduleInput) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<ScheduleFormValues>(() => (schedule ? formFromSchedule(schedule) : emptyScheduleForm()))
  const [error, setError] = useState<string | null>(null)
  const recipientCount = parseRecipients(values.recipients).valid.length
  const audiences = useScheduleAudiences()
  const audienceOptions = [
    { value: 'all', label: 'Everyone (national brief)' },
    ...(audiences.data ?? []).map((agency) => ({ value: agency.id, label: agency.name })),
  ]

  function update<K extends keyof ScheduleFormValues>(key: K, value: ScheduleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  function submit() {
    const problem = validateScheduleForm(values)
    if (problem) {
      setError(problem)
      return
    }
    onSave(inputFromForm(values))
  }

  return (
    <div className="flex max-w-xl flex-col gap-5 p-5 sm:p-7">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted" htmlFor="schedule-name">
          Name
        </label>
        <input
          id="schedule-name"
          className={`h-10 ${FIELD_CLASS}`}
          maxLength={120}
          placeholder="Weekly brief for the Minister"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <SelectField
          label="Report for"
          value={values.institutionId}
          options={audienceOptions}
          onChange={(value) => update('institutionId', value)}
        />
        <p className="text-xs text-text-muted">
          {values.institutionId === 'all'
            ? 'The national brief covering every agency.'
            : 'Only this agency’s indicators, projects, bottlenecks and the actions it leads.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Frequency"
          value={values.cadence}
          options={CADENCE_OPTIONS}
          onChange={(value) => update('cadence', value as ScheduleFormValues['cadence'])}
        />
        {values.cadence === 'weekly' ? (
          <SelectField label="Day" value={values.dayOfWeek} options={WEEKDAY_OPTIONS} onChange={(value) => update('dayOfWeek', value)} />
        ) : (
          <SelectField label="Day of month" value={values.dayOfMonth} options={DAY_OF_MONTH_OPTIONS} onChange={(value) => update('dayOfMonth', value)} />
        )}
        <SelectField label="Time (Lagos)" value={values.hourLagos} options={HOUR_OPTIONS} onChange={(value) => update('hourLagos', value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted" htmlFor="schedule-recipients">
          Recipients
        </label>
        <textarea
          id="schedule-recipients"
          className={`min-h-28 py-2 ${FIELD_CLASS}`}
          placeholder={'minister@example.gov.ng\nadviser@example.gov.ng'}
          value={values.recipients}
          onChange={(event) => update('recipients', event.target.value)}
        />
        <p className="text-xs text-text-muted">
          One email address per line, or separated by commas. Recipients do not need a platform account.
          {recipientCount > 0 ? ` ${recipientCount} ${recipientCount === 1 ? 'recipient' : 'recipients'}.` : ''}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-default">
        <input type="checkbox" checked={values.isActive} onChange={(event) => update('isActive', event.target.checked)} />
        Send automatically on this schedule
      </label>

      {error && (
        <p role="alert" className="text-sm text-status-delayed">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button disabled={isSaving} onClick={submit} type="button">
          {isSaving ? 'Saving…' : schedule ? 'Save changes' : 'Create schedule'}
        </Button>
        <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  )
}
