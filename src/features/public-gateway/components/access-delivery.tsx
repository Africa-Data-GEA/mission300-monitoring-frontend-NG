import type { AccessChannel } from '@/api/schemas/executive-overview'
import { AccessChannelsChart } from './access-channels-chart'

export function AccessDelivery({ channels }: { channels: readonly AccessChannel[] }) {
  if (channels.length === 0) return null

  return (
    <section aria-labelledby="access-delivery" className="mt-14">
      <h2
        id="access-delivery"
        className="text-[1.875rem] leading-9 font-semibold tracking-tight text-landing-blue sm:text-[2.25rem] sm:leading-10"
      >
        How access is being delivered
      </h2>
      <div className="mt-5">
        <AccessChannelsChart channels={channels} />
      </div>
    </section>
  )
}
