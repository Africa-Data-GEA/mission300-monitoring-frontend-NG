import { useState } from 'react'
import type { KpiHistoryPoint, SetKpiCurrentValueRequest } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { useEditKpiHistoryPoint } from '../../api'
import { buildQuarterOptions, buildYearOptions, detectPeriodKind, type PeriodKind } from '../../lib/period-options'

const inputClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const RESULTING_STATUS_LABELS: Record<'confirmed' | 'provisional', string> = {
  confirmed: 'Confirmed',
  provisional: 'Provisional',
}

const PERIOD_KIND_LABELS: Record<PeriodKind, string> = {
  quarter: 'Quarter',
  year: 'Year',
}

const QUARTER_OPTIONS = buildQuarterOptions()
const YEAR_OPTIONS = buildYearOptions()

/**
 * Corrects a single, previously-set history point — the counterpart to
 * SetKpiCurrentValueDialog for a point that isn't the current one anymore.
 * Only ever shown for `point.editable` points (see values-panel.tsx); the
 * backend independently rejects anything else.
 */
export function EditKpiHistoryPointDialog({
  open,
  kpiId,
  point,
  onClose,
}: {
  open: boolean
  kpiId: string
  point: KpiHistoryPoint
  onClose: () => void
}) {
  const editPoint = useEditKpiHistoryPoint(kpiId)
  const [periodKind, setPeriodKind] = useState<PeriodKind>(() => detectPeriodKind(point.period))
  const [draft, setDraft] = useState<Omit<SetKpiCurrentValueRequest, 'note'>>(() => {
    const options = detectPeriodKind(point.period) === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS
    return {
      value: point.value,
      reportingPeriod: options.includes(point.period) ? point.period : (options[0] ?? point.period),
      resultingStatus: point.validationStatus === 'confirmed' ? 'confirmed' : 'provisional',
    }
  })
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const periodOptions = periodKind === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS

  function field<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function changePeriodKind(kind: PeriodKind) {
    setPeriodKind(kind)
    const options = kind === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS
    field('reportingPeriod', options[0] ?? '')
  }

  async function handleSave() {
    setError('')
    try {
      await editPoint.mutateAsync({ valueId: point.id, ...draft, note: note.trim() || undefined })
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save this value. Please try again.')
    }
  }

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title={`Edit history point: ${point.period}`}
      description="Corrects a value previously set outside the submission workflow."
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <label className="text-sm font-medium text-text-default">
          Value
          <input
            type="number"
            value={draft.value}
            onChange={(event) => field('value', Number(event.target.value))}
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Reporting period type"
            value={periodKind}
            options={(['quarter', 'year'] as const).map((kind) => ({ value: kind, label: PERIOD_KIND_LABELS[kind] }))}
            onChange={(value) => changePeriodKind(value as PeriodKind)}
          />
          <SelectField
            label="Reporting period"
            value={draft.reportingPeriod}
            options={periodOptions.map((period) => ({ value: period, label: period }))}
            onChange={(value) => field('reportingPeriod', value)}
          />
        </div>

        <SelectField
          label="Validation status"
          value={draft.resultingStatus}
          options={(['confirmed', 'provisional'] as const).map((status) => ({
            value: status,
            label: RESULTING_STATUS_LABELS[status],
          }))}
          onChange={(value) => field('resultingStatus', value as SetKpiCurrentValueRequest['resultingStatus'])}
        />

        <label className="text-sm font-medium text-text-default">
          Note (optional)
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why this correction was made"
            className={inputClass}
          />
        </label>

        {error && (
          <p className="text-sm text-status-at-risk" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-default pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={editPoint.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={editPoint.isPending}>
            {editPoint.isPending ? 'Saving…' : 'Save correction'}
          </Button>
        </div>
      </div>
    </SideDialog>
  )
}
