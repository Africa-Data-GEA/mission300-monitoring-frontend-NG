import type { BulletMetric } from '@/features/dashboard/types'

/**
 * docs/public-gateway-copy.md §05 — national performance indicators.
 *
 * Six measures of how the power sector itself is performing, sitting behind
 * the access figures above: a household counted as connected still depends on
 * metering, on network losses, and on whether its distribution company is
 * financially viable. This is the single biggest gain available on the public
 * page — it roughly triples the published record at no data cost, which is
 * what separates a national record from a campaign page.
 *
 * Same dl-list pattern as DeliveryChannels and Pillars, not a card grid — see
 * the "banned outright" list in docs/public-gateway-home.md §01.
 *
 * No period field exists on `BulletMetric` (unlike the four Compact outcome
 * cards), so this row shows value, target and caption only, rather than
 * inventing a reporting period the data does not carry.
 */
export function PerformanceIndicators({
  indicators,
}: {
  indicators: readonly BulletMetric[]
}) {
  if (indicators.length === 0) return null

  return (
    <section aria-labelledby="performance-indicators" className="mt-14">
      <h2
        id="performance-indicators"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        National performance indicators
      </h2>
      <p className="mt-2 max-w-[42rem] text-[1.0625rem] leading-6 text-text-muted">
        Six measures of how the power sector itself is performing. These sit
        behind the access figures above: a household counted as connected
        still depends on metering, on network losses, and on whether its
        distribution company is financially viable.
      </p>

      <dl className="mt-4 max-w-[42rem] border-t-2 border-text-default">
        {indicators.map((indicator) => (
          <div key={indicator.id} className="border-b border-border-strong py-4">
            <dt className="text-[1.0625rem] leading-6 text-text-default">
              {indicator.title}
            </dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default">
                {indicator.value}
              </span>
              <span className="text-[0.9375rem] leading-6 text-text-muted">
                target {indicator.targetLabel}
              </span>
            </dd>
            {indicator.caption && (
              <dd className="mt-1 text-[0.9375rem] leading-6 text-text-muted">
                {indicator.caption}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  )
}
