import { CheckCircle2 } from 'lucide-react'

/**
 * Shown on the validation queue after a decision published values to the KPI
 * Explorer — read from router state set by ValidationDetailPage's decision
 * handler, mirroring how the auth flow passes an email between steps.
 */
export function PublishConfirmationBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-control bg-status-on-track-bg px-3.5 py-3 text-sm text-status-on-track"
    >
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
