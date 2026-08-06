import { formatDate } from '@/lib/format'
import { usePublicOverview } from './api'
import { Institutions } from './components/institutions'
import { NationalStatement } from './components/national-statement'
import { NationalStatementSkeleton } from './components/national-statement-skeleton'
import { Pillars } from './components/pillars'
import { PublicFooter } from './components/public-footer'
import { PublicHeader } from './components/public-header'

/**
 * Public gateway — the front door at `/`, seen before anyone signs in.
 *
 * Sections:
 *   §02  National statement and latest figures
 *   §05  The six pillars (home.md)
 *   §08  Who reports these figures
 *   §09  Footer, carrying the data-confidence key
 *
 * Not built: home.md §06 delivery-in-motion, which needs either a Nigeria map
 * or a ranked list of states, and §07 the human story, which is blocked on a
 * real named account from the comms team — a placeholder testimonial is the
 * most generated-looking thing that could appear on this page.
 *
 * FAILURE BEHAVIOUR: if the figures cannot be loaded the page still renders its
 * header, framing and footer, and says plainly that the numbers are
 * unavailable. It does not show a stale or invented figure, and it does not
 * blank the page — a government service that returns nothing reads as broken,
 * which costs more trust than an honest gap.
 */
export function PublicGatewayPage() {
  const { data, isPending, isError } = usePublicOverview()

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />

      <main className="flex-1">
        {isPending && <NationalStatementSkeleton />}

        {isError && (
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
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
            <NationalStatement cards={data.headlineCards} />

            <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
              <Pillars />
              <Institutions />
            </div>
          </>
        )}
      </main>

      {data && (
        <PublicFooter
          lastUpdated={formatDate(
            data.headlineCards.peopleWithElectricityAccess.provenance
              .lastUpdated,
          )}
        />
      )}
    </div>
  )
}
