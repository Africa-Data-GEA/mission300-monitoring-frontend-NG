import { useState } from 'react'
import type { CreateKpiRequest } from '@/api/schemas/kpi-explorer'
import { READINESS_LABELS, READINESS_TIERS } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'
import { useCreateKpi } from '../api'

const fieldClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const EMPTY: CreateKpiRequest = {
  id: '',
  name: '',
  pillar: 'generation-network',
  category: 'Output',
  unit: '',
  definition: '',
  formula: '',
  frequency: 'Quarterly',
  sourceInstitution: '',
  sourceDataset: '',
  readiness: 'supporting',
}

/**
 * Registers a new indicator in the Master KPI Registry.
 *
 * Review noted that indicators could be modified but not added or retired
 * (docs/M300 Monitoring Platform Feedback.pptx, slide 15). This form is
 * deliberately limited to what *defines* an indicator — no current value or
 * target is captured, because a KPI's numbers only ever arrive through an
 * approved data submission, never typed in at registration.
 */
export function CreateKpiDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState<CreateKpiRequest>(EMPTY)
  const [error, setError] = useState('')
  const createKpi = useCreateKpi()

  function set<K extends keyof CreateKpiRequest>(key: K, value: CreateKpiRequest[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await createKpi.mutateAsync(draft)
      setDraft(EMPTY)
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not add the indicator. Please try again.')
    }
  }

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title="Add an indicator"
      description="Registers a new KPI. Its value stays empty until a submission is approved against it."
    >
      <form onSubmit={submit} className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-default">
          Identifier
          <input
            value={draft.id}
            onChange={(event) => set('id', event.target.value)}
            placeholder="M300-P1-020"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Name
          <input
            value={draft.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Transmission Availability Factor"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Pillar
          <select
            value={draft.pillar}
            onChange={(event) => set('pillar', event.target.value as CreateKpiRequest['pillar'])}
            className={fieldClass}
          >
            {PILLARS.map((pillar) => (
              <option key={pillar} value={pillar}>
                {PILLAR_LABELS[pillar]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-default">
          Readiness tier
          <select
            value={draft.readiness}
            onChange={(event) => set('readiness', event.target.value as CreateKpiRequest['readiness'])}
            className={fieldClass}
          >
            {READINESS_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {READINESS_LABELS[tier]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-default">
          Category
          <input
            value={draft.category}
            onChange={(event) => set('category', event.target.value)}
            placeholder="Output"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Unit
          <input
            value={draft.unit}
            onChange={(event) => set('unit', event.target.value)}
            placeholder="%"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Reporting frequency
          <input
            value={draft.frequency}
            onChange={(event) => set('frequency', event.target.value)}
            placeholder="Quarterly"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default">
          Responsible institution
          <input
            value={draft.sourceInstitution}
            onChange={(event) => set('sourceInstitution', event.target.value)}
            placeholder="Transmission Company of Nigeria"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default sm:col-span-2">
          Source dataset
          <input
            value={draft.sourceDataset}
            onChange={(event) => set('sourceDataset', event.target.value)}
            placeholder="Transmission performance return"
            className={fieldClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default sm:col-span-2">
          Definition
          <textarea
            value={draft.definition}
            onChange={(event) => set('definition', event.target.value)}
            rows={3}
            placeholder="What this indicator measures, in plain language."
            className={`${fieldClass} h-auto py-2`}
            required
          />
        </label>

        <label className="text-sm font-medium text-text-default sm:col-span-2">
          Formula
          <input
            value={draft.formula}
            onChange={(event) => set('formula', event.target.value)}
            placeholder="(Available capacity ÷ Installed capacity) × 100"
            className={fieldClass}
            required
          />
        </label>

        {error && (
          <p className="text-sm text-status-at-risk sm:col-span-2" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-default pt-4 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createKpi.isPending}>
            {createKpi.isPending ? 'Adding…' : 'Add indicator'}
          </Button>
        </div>
      </form>
    </SideDialog>
  )
}
