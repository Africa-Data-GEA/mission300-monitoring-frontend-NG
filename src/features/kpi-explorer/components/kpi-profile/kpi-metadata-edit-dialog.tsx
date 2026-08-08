import { useState } from 'react'
import type { KpiProfile, UpdateKpiMetadataRequest } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { useUpdateKpiMetadata } from '../../api'

const inputClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
const textareaClass = `${inputClass} h-auto min-h-20 py-2 resize-y`

/** `null` in the number field reads as an empty input, not "0". */
function toDraft(profile: KpiProfile): UpdateKpiMetadataRequest {
  return {
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
    sourceInstitution: profile.sourceInstitution,
    sourceDataset: profile.sourceDataset,
    sourceReference: profile.sourceReference,
  }
}

/**
 * Editor for a KPI's definition metadata — methodology and reference
 * points (baseline/target), never the current value or its history, which
 * only change through a published data submission. Gated to
 * system-administrator by its callers (metadata-panel.tsx / values-panel.tsx),
 * not by this component — see role-access.ts.
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
