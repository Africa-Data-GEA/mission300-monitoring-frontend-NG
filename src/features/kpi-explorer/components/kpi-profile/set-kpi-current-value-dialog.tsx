import { useState } from 'react'
import type { KpiProfile, SetKpiCurrentValueRequest } from '@/api/schemas/kpi-explorer'
import { VALIDATION_LABELS, VALIDATION_STATUSES } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { useSetKpiCurrentValue } from '../../api'

const inputClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

function toDraft(profile: KpiProfile): SetKpiCurrentValueRequest {
  return {
    value: profile.current ?? 0,
    currentLabel: profile.currentLabel,
    reportingPeriod: profile.reportingPeriod,
    validationStatus: profile.validationStatus,
    note: '',
  }
}

/**
 * Directly sets a KPI's current value and appends a history point — an
 * explicit admin override of the usual rule that a value only ever arrives
 * via an approved data submission (see CreateKpiDialog and
 * KpiMetadataEditDialog's own doc comments). Gated to system-administrator by
 * its callers, not by this component — see role-access.ts.
 */
export function SetKpiCurrentValueDialog({
  open,
  profile,
  onClose,
}: {
  open: boolean
  profile: KpiProfile
  onClose: () => void
}) {
  const setCurrentValue = useSetKpiCurrentValue(profile.id)
  const [draft, setDraft] = useState<SetKpiCurrentValueRequest>(() => toDraft(profile))
  const [error, setError] = useState('')

  function field<K extends keyof SetKpiCurrentValueRequest>(key: K, value: SetKpiCurrentValueRequest[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setError('')
    try {
      await setCurrentValue.mutateAsync({ ...draft, note: draft.note?.trim() || undefined })
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save this value. Please try again.')
    }
  }

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title={`Set current value: ${profile.name}`}
      description={`${profile.id}. Bypasses Data Submissions & Validation. Use only when a value cannot go through the normal submission workflow.`}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-text-default">
            Value
            <input
              type="number"
              value={draft.value}
              onChange={(event) => field('value', Number(event.target.value))}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-text-default">
            Reporting period
            <input
              value={draft.reportingPeriod}
              onChange={(event) => field('reportingPeriod', event.target.value)}
              placeholder="e.g. Q4 2025"
              className={inputClass}
            />
          </label>
        </div>

        <label className="text-sm font-medium text-text-default">
          Display label
          <input
            value={draft.currentLabel}
            onChange={(event) => field('currentLabel', event.target.value)}
            placeholder='e.g. "38.31% (hydro only, NERC Q4 2025 report)"'
            className={inputClass}
          />
        </label>

        <SelectField
          label="Validation status"
          value={draft.validationStatus}
          options={VALIDATION_STATUSES.map((status) => ({ value: status, label: VALIDATION_LABELS[status] }))}
          onChange={(value) => field('validationStatus', value as SetKpiCurrentValueRequest['validationStatus'])}
        />

        <label className="text-sm font-medium text-text-default">
          Note (optional)
          <input
            value={draft.note ?? ''}
            onChange={(event) => field('note', event.target.value)}
            placeholder="Why this was set directly rather than via a submission"
            className={inputClass}
          />
        </label>

        {error && (
          <p className="text-sm text-status-at-risk" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-default pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={setCurrentValue.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={setCurrentValue.isPending}>
            {setCurrentValue.isPending ? 'Saving…' : 'Save value'}
          </Button>
        </div>
      </div>
    </SideDialog>
  )
}
