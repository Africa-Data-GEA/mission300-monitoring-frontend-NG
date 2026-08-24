import type { AccessChannel } from '@/api/schemas/executive-overview'
import { AccessChannelsChart } from './access-channels-chart'
import { SectionHeading } from './section-heading'

/**
 * Section 02 — how the access figure above is actually being delivered.
 *
 * Placed immediately after the headline strip because "how much" without "how"
 * is the shape of a claim rather than a record. The channels are the concrete,
 * Nigeria-specific part of the programme: grid connections, mini-grids and
 * solar home systems, each with a different institution behind it and a
 * different target position. None of that survives being pasted onto another
 * country's page, which is the test every section here has to pass.
 */
export function AccessDelivery({ channels }: { channels: readonly AccessChannel[] }) {
  if (channels.length === 0) return null

  return (
    <section aria-labelledby="access-delivery" className="mt-14">
      <SectionHeading
        id="access-delivery"
        index="02"
        title="How access is being delivered"
        description="Three delivery channels run against the same national target. Each is reported separately, and each is at a different point against its own approved commitment."
      />
      <div className="mt-4">
        <AccessChannelsChart channels={channels} />
      </div>
    </section>
  )
}
