import { Card } from '@/components/ui/card'
import type { AccessChannel } from '../types'
import { AccessChannelCard } from './access-channel-card'
import { AccessDeliveryChart } from './access-delivery-chart'

/**
 * Section B — Access Delivery by Channel.
 *
 * Grid connections, mini-grid household connections and Solar Home Systems.
 * The chart sits alongside the per-channel cards rather than above them, so
 * the "how are we doing" visual and the exact figures read as one section,
 * not two stacked ones.
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
      <div className="mt-3 grid items-start gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="p-4">
          <h3 className="text-xs font-medium tracking-wide text-text-subtle uppercase">
            Progress to target
          </h3>
          <div className="mt-2">
            <AccessDeliveryChart channels={channels} />
          </div>
        </Card>

        <ul aria-label="Access delivery channels" className="grid grid-cols-2 gap-3">
          {channels.map((channel) => (
            <li key={channel.id}>
              <AccessChannelCard channel={channel} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
