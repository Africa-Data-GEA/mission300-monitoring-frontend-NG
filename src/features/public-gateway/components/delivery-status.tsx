import { EXECUTION_STATUS_LABELS } from '@/api/schemas/programs'
import type { DeliveryStatusPanel } from '@/features/dashboard/types'

/**
 * docs/public-gateway-copy.md §06 — programme and project delivery status.
 *
 * Publishing blocked and delayed counts publicly is a real decision, and it is
 * the one that earns the rest of the page its credibility: a record that only
 * ever reports good news reads as a campaign, not a record.
 *
 * One sentence, not a chart or a table — the UKHSA pattern this page follows
 * throughout: a number and a sentence a screen reader or a printed briefing
 * pack can carry, not a coloured widget.
 */
export function DeliveryStatus({ panel }: { panel: DeliveryStatusPanel }) {
  const counts = panel.statusSummary.filter((entry) => entry.count > 0)
  const total = counts.reduce((sum, entry) => sum + entry.count, 0)

  if (total === 0) return null

  const breakdown = counts
    .map((entry) => `${entry.count} ${EXECUTION_STATUS_LABELS[entry.status].toLowerCase()}`)
    .join(', ')

  return (
    <section aria-labelledby="delivery-status" className="mt-14">
      <h2
        id="delivery-status"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        Programme and project delivery
      </h2>
      <p className="mt-2 max-w-[42rem] text-[1.0625rem] leading-6 text-text-muted">
        Status of the projects delivering the Compact, as reported by the
        institutions responsible for them.
      </p>

      <p className="mt-4 max-w-[42rem] text-[1.375rem] leading-7 font-bold tracking-tight text-text-default">
        {total} project{total === 1 ? '' : 's'} {total === 1 ? 'is' : 'are'} being
        tracked. {breakdown}.
      </p>
    </section>
  )
}
