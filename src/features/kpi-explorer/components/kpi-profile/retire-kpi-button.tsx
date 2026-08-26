import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { useSetKpiActive } from '../../api'

/**
 * Retires an indicator from the registry.
 *
 * Review asked for the ability to deactivate a KPI as well as add one
 * (docs/M300 Monitoring Platform Feedback.pptx, slide 15). This never
 * deletes: an indicator that has already published values must stay
 * traceable, so it is flagged inactive and hidden from the default
 * catalogue, and can be restored.
 *
 * Confirmation is inline rather than a nested dialog — this button already
 * lives inside the profile side-dialog, and stacking a second overlay on top
 * of it traps focus in a way that is hard to escape.
 */
export function RetireKpiButton({ kpiId, name }: { kpiId: string; name: string }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const setActive = useSetKpiActive(kpiId)

  async function retire() {
    setError('')
    try {
      await setActive.mutateAsync({ active: false })
      setConfirming(false)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not retire this indicator.')
    }
  }

  if (!confirming) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(true)}>
        <Archive aria-hidden="true" />
        Retire indicator
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-control bg-surface-sunken px-2.5 py-2">
      <p className="text-xs text-text-muted">
        Retire <span className="font-medium text-text-default">{name}</span>? It is hidden from the
        catalogue but keeps its history and can be restored.
      </p>
      {error && (
        <p className="w-full text-xs text-status-at-risk" role="alert">
          {error}
        </p>
      )}
      <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      <Button type="button" variant="danger" size="sm" onClick={retire} disabled={setActive.isPending}>
        {setActive.isPending ? 'Retiring…' : 'Retire'}
      </Button>
    </div>
  )
}
