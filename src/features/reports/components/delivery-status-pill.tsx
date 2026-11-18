import type { DeliveryStatus } from '@/api/schemas/report-schedules'
import { cn } from '@/lib/utils'

const STYLES: Record<DeliveryStatus, { label: string; className: string }> = {
  sent: { label: 'Sent', className: 'bg-status-on-track-bg text-status-on-track' },
  partial: { label: 'Partly sent', className: 'bg-status-at-risk-bg text-status-at-risk' },
  failed: { label: 'Failed', className: 'bg-status-delayed-bg text-status-delayed' },
}

export function DeliveryStatusPill({ status }: { status: DeliveryStatus }) {
  const style = STYLES[status]
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap', style.className)}>
      {style.label}
    </span>
  )
}
