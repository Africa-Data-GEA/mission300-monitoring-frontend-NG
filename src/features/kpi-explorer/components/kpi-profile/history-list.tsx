import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { KpiHistoryPoint } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { useDeleteKpiHistoryPoint } from '../../api'
import { EditKpiHistoryPointDialog } from './edit-kpi-history-point-dialog'

function DeleteHistoryPointButton({ kpiId, point }: { kpiId: string; point: KpiHistoryPoint }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const deletePoint = useDeleteKpiHistoryPoint(kpiId)

  async function handleDelete() {
    setError('')
    try {
      await deletePoint.mutateAsync(point.id)
      setConfirming(false)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not delete this value.')
    }
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`Delete ${point.period} value`}
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="size-4" />
      </Button>
    )
  }

  return (
    <span className="flex items-center gap-1.5">
      {error && <span className="text-xs text-status-at-risk">{error}</span>}
      <Button type="button" size="sm" variant="secondary" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      <Button type="button" size="sm" variant="danger" onClick={handleDelete} disabled={deletePoint.isPending}>
        {deletePoint.isPending ? 'Deleting…' : 'Confirm delete'}
      </Button>
    </span>
  )
}

/**
 * Lists every value behind the sparkline, not just the current one — a
 * point set via "Set current value" (`editable: true`) can be corrected or
 * removed here; a point that arrived through an approved data submission
 * is read-only, same guard the backend enforces independently.
 */
export function HistoryList({
  kpiId,
  history,
  canEdit,
}: {
  kpiId: string
  history: readonly KpiHistoryPoint[]
  canEdit: boolean
}) {
  const [editingPoint, setEditingPoint] = useState<KpiHistoryPoint | null>(null)

  if (history.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs text-text-muted">Value history</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {[...history].reverse().map((point) => (
          <li
            key={point.id}
            className="flex items-center justify-between gap-2 rounded-control px-1.5 py-1 text-sm hover:bg-surface-sunken"
          >
            <span className="flex items-baseline gap-2">
              <span className="w-16 shrink-0 font-medium text-text-default">{point.period}</span>
              <span className="text-text-muted">{point.value}</span>
            </span>
            {canEdit && point.editable && (
              <span className="flex items-center gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit ${point.period} value`}
                  onClick={() => setEditingPoint(point)}
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteHistoryPointButton kpiId={kpiId} point={point} />
              </span>
            )}
          </li>
        ))}
      </ul>

      {editingPoint && (
        <EditKpiHistoryPointDialog
          open
          kpiId={kpiId}
          point={editingPoint}
          onClose={() => setEditingPoint(null)}
        />
      )}
    </div>
  )
}
