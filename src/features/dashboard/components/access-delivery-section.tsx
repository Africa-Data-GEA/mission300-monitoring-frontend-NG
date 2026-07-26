import { Card } from '@/components/ui/card'
import type { AccessChannel } from '../types'
import { AccessChannelCard } from './access-channel-card'

/**
 * Section B — Access Delivery by Channel.
 *
 * Grid connections, mini-grid household connections and Solar Home Systems.
 * The per-channel card lives in access-channel-card.tsx.
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

      <ul
        aria-label="Access delivery channels"
        className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {channels.map((channel) => (
          <li key={channel.id}>
            <AccessChannelCard channel={channel} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
