import { useState } from 'react'
import type { KpiProfile, SetKpiCurrentValueRequest } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { useSetKpiCurrentValue } from '../../api'
import { buildQuarterOptions, buildYearOptions, detectPeriodKind, type PeriodKind } from '../../lib/period-options'
import { isStatusUnit, STATUS_LEVELS } from '../../lib/status-values'

const inputClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const RESULTING_STATUS_LABELS: Record<SetKpiCurrentValueRequest['resultingStatus'], string> = {
  confirmed: 'Confirmed',
  provisional: 'Provisional',
}

const PERIOD_KIND_LABELS: Record<PeriodKind, string> = {
  quarter: 'Quarter',
  year: 'Year',
}

const QUARTER_OPTIONS = buildQuarterOptions()
const YEAR_OPTIONS = buildYearOptions()

function toDraft(profile: KpiProfile): SetKpiCurrentValueRequest {
  return {
    value: profile.current ?? 0,
    reportingPeriod: profile.reportingPeriod,
    resultingStatus: profile.validationStatus === 'confirmed' ? 'confirmed' : 'provisional',
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
  const [periodKind, setPeriodKind] = useState<PeriodKind>(() => detectPeriodKind(profile.reportingPeriod))
  const [draft, setDraft] = useState<SetKpiCurrentValueRequest>(() => {
    const draft = toDraft(profile)
    const options = detectPeriodKind(profile.reportingPeriod) === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS
    // A period outside the dropdown's own window (e.g. "Latest available",
    // an old year, or free text from before this became a picker) has
    // nothing to match - fall back to the most recent option rather than
    // leaving the select showing nothing selected.
    if (!options.includes(draft.reportingPeriod)) draft.reportingPeriod = options[0] ?? draft.reportingPeriod
    return draft
  })
  const [error, setError] = useState('')

  const periodOptions = periodKind === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS

  function changePeriodKind(kind: PeriodKind) {
    setPeriodKind(kind)
    const options = kind === 'quarter' ? QUARTER_OPTIONS : YEAR_OPTIONS
    field('reportingPeriod', options[0] ?? '')
  }

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
          {isStatusUnit(profile.unit) ? (
            <SelectField
              label="Status"
              value={String(STATUS_LEVELS.some((level) => level.value === draft.value) ? draft.value : 0)}
              options={STATUS_LEVELS.map((level) => ({ value: String(level.value), label: level.label }))}
              onChange={(value) => field('value', Number(value))}
            />
          ) : (
            <label className="text-sm font-medium text-text-default">
              Value
              <input
                type="number"
                value={draft.value}
                onChange={(event) => field('value', Number(event.target.value))}
                className={inputClass}
              />
            </label>
          )}
        </div>

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
        <p className="-mt-3 text-xs text-text-muted">
          The period this value applies to, picked from a fixed list rather than typed — it must match the
          vocabulary the rest of the platform reads periods by (a quarter like "Q4 2025" or a plain year like
          "2025").
        </p>

        <SelectField
          label="Validation status"
          value={draft.resultingStatus}
          options={(['confirmed', 'provisional'] as const).map((status) => ({
            value: status,
            label: RESULTING_STATUS_LABELS[status],
          }))}
          onChange={(value) => field('resultingStatus', value as SetKpiCurrentValueRequest['resultingStatus'])}
        />
        <p className="-mt-3 text-xs text-text-muted">
          Confirmed and provisional are the only two outcomes a value can have here — the same two an approved
          submission can produce. There is no display label to set: it's always built from the value and this KPI's
          unit, the same way an approved submission's value is.
        </p>

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
