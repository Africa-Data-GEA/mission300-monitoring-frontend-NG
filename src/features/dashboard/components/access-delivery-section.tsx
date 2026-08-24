import { Card } from '@/components/ui/card'
import type { AccessChannel } from '../types'
import { AccessChannelCard } from './access-channel-card'

/**
 * Section B — Access Delivery by Channel.
 *
 * Grid connections, mini-grid household connections, Solar Home Systems and
 * clean cooking — one card per channel, each carrying its own
 * delivered-against-target progress and trend pill.
 *
 * The side-by-side "progress to target" bar chart that used to sit beside
 * these cards was removed: review feedback was that the cards already say
 * what the chart said, more precisely, and that the space was better spent
 * giving every channel equal weight (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 2).
 */
export function AccessDeliverySection({
  channels,
}: {
  channels: readonly AccessChannel[]
}) {
  return (
    <Card variant="well" className="p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Access delivery by channel
      </h2>
      {channels.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border-default bg-surface-card px-4 py-8 text-center text-sm text-text-muted">
          No access-delivery channels are owned by the selected institution and pillar.
        </p>
      ) : (
      /*
        Four across on a wide screen, one per channel, so no channel reads as
        subordinate to the others. Cards stretch to a shared height via the
        grid, keeping their progress bars on one baseline.
      */
      <ul
        aria-label="Access delivery channels"
        className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {channels.map((channel) => (
          <li key={channel.id}>
            <AccessChannelCard channel={channel} />
          </li>
        ))}
      </ul>
      )}
    </Card>
  )
}
