import type { AccessChannel } from '@/features/dashboard/types'

/**
 * §04 — how access is actually being delivered.
 *
 * Answers "how" straight after "how much". Three named delivery routes, each a
 * real programme rather than a feature: grid connections, mini-grids and solar
 * home systems.
 *
 * A channel with no approved target says so. Publishing the absence of a target
 * is a credibility signal, not an embarrassment — it tells a reader the record
 * is honest about what has not been agreed yet, which is exactly what a
 * sceptical journalist is checking for.
 */
export function DeliveryChannels({
  channels,
}: {
  channels: readonly AccessChannel[]
}) {
  if (channels.length === 0) return null

  return (
    <section aria-labelledby="delivery-channels" className="mt-14">
      <h2
        id="delivery-channels"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        How access is being delivered
      </h2>

      <dl className="mt-4 max-w-[42rem] border-t-2 border-text-default">
        {channels.map((channel) => (
          <div key={channel.id} className="border-b border-border-strong py-4">
            <dt className="text-[1.0625rem] leading-6 text-text-default">
              {channel.title}
            </dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default">
                {channel.value}
              </span>
              <span className="text-[0.9375rem] leading-6 text-text-muted">
                {channel.percentComplete === null
                  ? 'Annual target to be confirmed'
                  : `${channel.percentComplete.toFixed(0)}% of ${channel.targetLabel}`}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
