import type { KpiFigure } from '../lib/headline-figures'
import { KpiCard } from './kpi-card'

/** A full-width, colour-blocked national snapshot immediately after the hero. */
export function KpiStrip({ figures }: { figures: readonly KpiFigure[] }) {
  return (
    <section aria-labelledby="latest-figures" className="bg-[#f1f4f7] py-12 sm:py-14">
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.14em] text-landing-blue uppercase">
              National snapshot
            </p>
            <h2
              id="latest-figures"
              className="mt-1.5 text-[1.875rem] leading-9 font-bold tracking-tight text-landing-navy sm:text-[2.25rem] sm:leading-10"
            >
              Latest published figures
            </h2>
          </div>
          <p className="pb-1 text-[0.6875rem] leading-4 font-semibold tracking-[0.06em] text-[#667684] uppercase">
            Compact Progress Report targets
          </p>
        </div>

        <div className="mt-7 grid gap-px overflow-hidden bg-[#d7e0e7] sm:grid-cols-2 xl:grid-cols-4">
          {figures.map((figure) => (
            <KpiCard key={figure.id} figure={figure} />
          ))}
        </div>
      </div>
    </section>
  )
}
