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
      {channels.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border-default bg-surface-card px-4 py-8 text-center text-sm text-text-muted">
          No access-delivery channels are owned by the selected institution and pillar.
        </p>
      ) : (
      /*
        Both columns stretch to the same height, and the cards are stacked one
        per row rather than laid out two-up. With three channels a two-column
        grid left a fourth cell empty, and the chart beside it had to stretch
        past its own content to cover the gap. One card per channel, in the
        same order as the chart's bars, means each row of the panel reads
        straight across: bar on the left, its numbers on the right.
      */
      <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="flex flex-col p-4">
          <h3 className="text-xs font-medium tracking-wide text-text-subtle uppercase">
            Progress to target
          </h3>
          {/*
            Anchored to the top rather than centred: the chart is a fixed pixel
            height, so when this card is stretched to match the taller card
            column beside it, centring pushed the plot toward the middle and
            left a large dead gap between the heading and the first bar. Top
            anchoring keeps the heading and bars reading as one block; any
            leftover height falls below the plot instead.
          */}
          <div className="mt-2 flex flex-1 flex-col justify-start">
            <AccessDeliveryChart channels={channels} />
          </div>
        </Card>

        <ul aria-label="Access delivery channels" className="grid gap-3">
          {channels.map((channel) => (
            <li key={channel.id}>
              <AccessChannelCard channel={channel} />
            </li>
          ))}
        </ul>
      </div>
      )}
    </Card>
  )
}
