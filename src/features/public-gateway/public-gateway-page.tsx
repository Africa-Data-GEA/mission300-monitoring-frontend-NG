import { formatDate } from '@/lib/format'
import { useCurrency } from '@/lib/currency'
import { usePublicOverview, usePublicStateCoverage } from './api'
import { AccessDelivery } from './components/access-delivery'
import { DeliveryInMotion } from './components/delivery-in-motion'
import { Institutions } from './components/institutions'
import { ProjectDelivery } from './components/project-delivery'
import { KpiStrip } from './components/kpi-strip'
import { NationalStatement } from './components/national-statement'
import { NationalStatementSkeleton } from './components/national-statement-skeleton'
import { PerformanceEvolution } from './components/performance-evolution'
import { PublicFooter } from './components/public-footer'
import { PublicHeader } from './components/public-header'
import { SafeSection } from './components/safe-section'
import { buildEvolutionSeries } from './lib/evolution-series'
import { buildKpiFigures } from './lib/headline-figures'

/**
 * Public gateway — the front door at `/`, seen before anyone signs in.
 *
 * THE PAGE IS AN ARGUMENT, IN ORDER. Each numbered section answers the next
 * question a reader actually asks, and the numbering is visible so a briefing
 * can cite which part it quotes:
 *
 *   Hero  What is the single most important fact?
 *   01    What are the four figures behind it, and how good is the data?
 *   02    How is that access being delivered?
 *   03    Which direction is each indicator moving?
 *   04    Did my state get anything?
 *   05    Who is accountable for each of these numbers?
 *
 * Structurally: one dark band of claim, everything in between on white as
 * evidence, one dark band to close. No section exists to fill a row.
 *
 * NOT BUILT: the human story (§07 of the build spec), blocked on a real named
 * account from the comms team. A placeholder testimonial is the most
 * generated-looking thing that could appear on this page, and the spec is
 * explicit that the section must not ship without one. Also not built: the
 * Nigeria choropleth — see `DeliveryInMotion` for why the table is the right
 * shipped answer rather than a half-finished map.
 *
 * FAILURE BEHAVIOUR: if the figures cannot be loaded the page still renders its
 * header, framing and footer, and says plainly that the numbers are
 * unavailable. It does not show a stale or invented figure, and it does not
 * blank the page — a government service that returns nothing reads as broken,
 * which costs more trust than an honest gap.
 */
export function PublicGatewayPage() {
  useCurrency()
  const { data, isPending, isError } = usePublicOverview()
  const stateCoverage = usePublicStateCoverage()

  return (
    <div className="font-landing flex min-h-screen flex-col bg-surface">
      <PublicHeader />

      <main className="flex-1">
        {isPending && <NationalStatementSkeleton />}

        {isError && (
          <div className="mx-auto max-w-[96rem] px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="text-[2.25rem] leading-[2.625rem] font-bold tracking-tight text-text-default sm:text-[3rem] sm:leading-[3.25rem]">
              National electrification record
            </h1>
            <p className="mt-6 max-w-[36rem] text-[1.1875rem] leading-7 text-text-default">
              The published figures could not be loaded. Nothing is shown here
              rather than a figure that may be out of date.
            </p>
          </div>
        )}

        {data && (
          <>
            <SafeSection render={() => <NationalStatement cards={data.headlineCards} />} />

            <SafeSection
              render={() => <KpiStrip figures={buildKpiFigures(data.headlineCards)} />}
            />

            <SafeSection
              render={() => (
                <div className="mx-auto max-w-[96rem] px-4 pb-14 sm:px-6">
                  <AccessDelivery channels={data.accessDelivery} />
                </div>
              )}
            />

            <SafeSection
              render={() => <PerformanceEvolution series={buildEvolutionSeries(data)} />}
            />

            <SafeSection
              render={() =>
                stateCoverage.data ? (
                  <DeliveryInMotion
                    rows={stateCoverage.data.rows}
                    asOf={data.headlineCards.peopleWithElectricityAccess.provenance.lastUpdated}
                  />
                ) : null
              }
            />
          </>
        )}

        {/* Fetches its own counts, so it renders independently of the
            headline payload above - it stays out of the `data &&` block
            deliberately. */}
        <SafeSection render={() => <ProjectDelivery />} />

        <SafeSection render={() => <Institutions />} />
      </main>

      <SafeSection
        render={() => (
          <PublicFooter
            lastUpdated={
              data
                ? formatDate(data.headlineCards.peopleWithElectricityAccess.provenance.lastUpdated)
                : undefined
            }
          />
        )}
      />
    </div>
  )
}
