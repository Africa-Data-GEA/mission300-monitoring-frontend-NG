import { useState } from 'react'
import type { KpiProfile, KpiTargetPoint, UpdateKpiMetadataRequest } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'
import { useUpdateKpiMetadata } from '../../api'

const inputClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
const textareaClass = `${inputClass} h-auto min-h-20 py-2 resize-y`

/**
 * A target's `period` is still just a plain string on the wire (e.g. "2026"
 * or "2026-Q1") — these two helpers are the only place that string gets
 * built and read apart, so the picker below can offer a period-type choice
 * (Year vs Quarter) without changing the underlying data shape.
 */
type PeriodType = 'year' | 'quarter'

const PERIOD_TYPE_OPTIONS = [
  { value: 'year', label: 'Year' },
  { value: 'quarter', label: 'Quarter' },
]

const QUARTER_OPTIONS = [
  { value: '1', label: 'Q1' },
  { value: '2', label: 'Q2' },
  { value: '3', label: 'Q3' },
  { value: '4', label: 'Q4' },
]

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, index) => {
  const year = String(2020 + index)
  return { value: year, label: year }
})

function parsePeriod(period: string): { type: PeriodType; year: string; quarter: string } {
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(period)
  if (quarterMatch) return { type: 'quarter', year: quarterMatch[1]!, quarter: quarterMatch[2]! }
  const yearMatch = /^(\d{4})$/.exec(period)
  return { type: 'year', year: yearMatch ? yearMatch[1]! : '', quarter: '1' }
}

function buildPeriod(type: PeriodType, year: string, quarter: string): string {
  if (!year) return ''
  return type === 'quarter' ? `${year}-Q${quarter}` : year
}

/** `null` in the number field reads as an empty input, not "0". */
function toDraft(profile: KpiProfile): UpdateKpiMetadataRequest {
  return {
    pillar: profile.pillar,
    definition: profile.definition,
    formula: profile.formula,
    unit: profile.unit,
    aggregation: profile.aggregation,
    frequency: profile.frequency,
    disaggregation: profile.disaggregation,
    limitations: profile.limitations,
    baseline: profile.baseline,
    baselineLabel: profile.baselineLabel,
    target: profile.target,
    targetLabel: profile.targetLabel,
    targetDate: profile.targetDate,
    targets: profile.targets,
    sourceInstitution: profile.sourceInstitution,
    sourceDataset: profile.sourceDataset,
    sourceReference: profile.sourceReference,
  }
}

/**
 * Editor for a KPI's definition — pillar assignment, methodology, and
 * reference points (baseline/target). Never the current value or its
 * history; see SetKpiCurrentValueDialog for that. Gated to
 * system-administrator by its callers (kpi-profile-dialog.tsx /
 * pillar-kpi-edit-button.tsx), not by this component — see role-access.ts.
 */
export function KpiMetadataEditDialog({
  open,
  profile,
  onClose,
}: {
  open: boolean
  profile: KpiProfile
  onClose: () => void
}) {
  const updateMetadata = useUpdateKpiMetadata(profile.id)
  const [draft, setDraft] = useState<UpdateKpiMetadataRequest>(() => toDraft(profile))
  const [error, setError] = useState('')

  function field<K extends keyof UpdateKpiMetadataRequest>(key: K, value: UpdateKpiMetadataRequest[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const targets = draft.targets ?? []

  function updateTargetRow(index: number, patch: Partial<KpiTargetPoint>) {
    setDraft((prev) => ({
      ...prev,
      targets: (prev.targets ?? []).map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    }))
  }

  function addTargetRow() {
    setDraft((prev) => ({
      ...prev,
      targets: [...(prev.targets ?? []), { period: '', value: 0, label: '' }],
    }))
  }

  function removeTargetRow(index: number) {
    setDraft((prev) => ({
      ...prev,
      targets: (prev.targets ?? []).filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  async function handleSave() {
    setError('')
    try {
      await updateMetadata.mutateAsync(draft)
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save this indicator. Please try again.')
    }
  }

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title={`Edit ${profile.name}`}
      description={`${profile.id} — definition, baseline and target. Applies immediately once saved.`}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <SelectField
          label="Pillar"
          value={draft.pillar}
          options={PILLARS.map((pillar) => ({ value: pillar, label: PILLAR_LABELS[pillar] }))}
          onChange={(value) => field('pillar', value as UpdateKpiMetadataRequest['pillar'])}
        />

        <label className="text-sm font-medium text-text-default">
          Definition
          <textarea
            value={draft.definition}
            onChange={(event) => field('definition', event.target.value)}
            className={textareaClass}
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Formula
          <textarea
            value={draft.formula}
            onChange={(event) => field('formula', event.target.value)}
            className={`${textareaClass} font-mono`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-text-default">
            Unit
            <input value={draft.unit} onChange={(event) => field('unit', event.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-text-default">
            Frequency
            <input
              value={draft.frequency}
              onChange={(event) => field('frequency', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-text-default">
            Aggregation
            <input
              value={draft.aggregation}
              onChange={(event) => field('aggregation', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-text-default">
            Disaggregation
            <input
              value={draft.disaggregation}
              onChange={(event) => field('disaggregation', event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="text-sm font-medium text-text-default">
          Limitations
          <textarea
            value={draft.limitations}
            onChange={(event) => field('limitations', event.target.value)}
            className={textareaClass}
          />
        </label>

        <div className="border-t border-border-default pt-5">
          <h3 className="text-sm font-semibold text-text-default">Baseline &amp; target</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-text-default">
              Baseline value
              <input
                type="number"
                value={draft.baseline ?? ''}
                onChange={(event) => field('baseline', event.target.value === '' ? null : Number(event.target.value))}
                className={inputClass}
                placeholder="No baseline"
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Baseline label
              <input
                value={draft.baselineLabel}
                onChange={(event) => field('baselineLabel', event.target.value)}
                className={inputClass}
                placeholder="e.g. Approx. 42% (2024 Compact baseline)"
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Target value
              <input
                type="number"
                value={draft.target ?? ''}
                onChange={(event) => field('target', event.target.value === '' ? null : Number(event.target.value))}
                className={inputClass}
                placeholder="No target"
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Target label
              <input
                value={draft.targetLabel}
                onChange={(event) => field('targetLabel', event.target.value)}
                className={inputClass}
                placeholder="e.g. Metering gap closed by 2027"
              />
            </label>
            {/*
              Held separately from the label so every target states a
              deadline even when whoever wrote the label omitted one — see
              `targetDate` in api/schemas/kpi-explorer.ts. Free text rather
              than a date picker: Compact targets are agreed by year or
              half-year ("2030", "end 2027"), not to a calendar day.
            */}
            <label className="text-sm font-medium text-text-default">
              Target date
              <input
                value={draft.targetDate ?? ''}
                onChange={(event) =>
                  field('targetDate', event.target.value.trim() === '' ? null : event.target.value)
                }
                className={inputClass}
                placeholder="e.g. 2030, or end 2027 — blank if none agreed"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-border-default pt-5">
          <h3 className="text-sm font-semibold text-text-default">Interim targets over time</h3>
          <p className="mt-1 text-xs text-text-muted">
            Optional milestones on the way to the target above — e.g. a 2026 and a 2028 checkpoint before a
            2030 final target. The target above stays the one figure every chart already renders; this list is
            additive.
          </p>

          <div className="mt-3 flex flex-col gap-3">
            {targets.map((row, index) => {
              const parsed = parsePeriod(row.period)
              return (
                <div key={index} className="rounded-control border border-border-default p-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <SelectField
                      label="Period type"
                      value={parsed.type}
                      options={PERIOD_TYPE_OPTIONS}
                      onChange={(value) =>
                        updateTargetRow(index, {
                          period: buildPeriod(value as PeriodType, parsed.year, parsed.quarter),
                        })
                      }
                      className="w-32"
                    />
                    <SelectField
                      label="Year"
                      value={parsed.year}
                      options={YEAR_OPTIONS}
                      onChange={(value) => updateTargetRow(index, { period: buildPeriod(parsed.type, value, parsed.quarter) })}
                      placeholder="Select year"
                      className="w-28"
                    />
                    {parsed.type === 'quarter' && (
                      <SelectField
                        label="Quarter"
                        value={parsed.quarter}
                        options={QUARTER_OPTIONS}
                        onChange={(value) => updateTargetRow(index, { period: buildPeriod(parsed.type, parsed.year, value) })}
                        className="w-24"
                      />
                    )}
                    <label className="w-32 shrink-0 text-xs font-medium text-text-default">
                      Value
                      <input
                        type="number"
                        value={row.value}
                        onChange={(event) => updateTargetRow(index, { value: Number(event.target.value) })}
                        className={inputClass}
                      />
                    </label>
                    <label className="min-w-40 flex-1 text-xs font-medium text-text-default">
                      Label
                      <input
                        value={row.label}
                        onChange={(event) => updateTargetRow(index, { label: event.target.value })}
                        className={inputClass}
                        placeholder="e.g. 2026 checkpoint"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeTargetRow(index)}
                      aria-label={`Remove ${row.period || 'this'} target`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}

            <Button type="button" variant="secondary" size="sm" onClick={addTargetRow} className="self-start">
              Add interim target
            </Button>
          </div>
        </div>

        <div className="border-t border-border-default pt-5">
          <h3 className="text-sm font-semibold text-text-default">Source</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-text-default">
              Source institution
              <input
                value={draft.sourceInstitution}
                onChange={(event) => field('sourceInstitution', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Source dataset
              <input
                value={draft.sourceDataset}
                onChange={(event) => field('sourceDataset', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-text-default sm:col-span-2">
              Source reference
              <input
                value={draft.sourceReference}
                onChange={(event) => field('sourceReference', event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="text-sm text-status-at-risk" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-default pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateMetadata.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateMetadata.isPending}>
            {updateMetadata.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </SideDialog>
  )
}
