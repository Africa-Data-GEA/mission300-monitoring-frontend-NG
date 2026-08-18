import { usePublicOverview } from './api'
import { NationalStatementSkeleton } from './components/national-statement-skeleton'
import { PublicHeader } from './components/public-header'

/**
 * `/progress` — the public, read-only cut of the national figures.
 *
 * Deliberately minimal for now. It exists because the gateway's primary action
 * points here, and a start button that 404s is worse than no start button.
 * docs/public-gateway-home.md specifies the full version: delivery channels,
 * the six pillars and the data-confidence key.
 */
export function ProgressPage() {
  const { data, isPending, isError } = usePublicOverview()

  const cards = data?.headlineCards
  const rows = cards
    ? [
        {
          label: cards.peopleWithElectricityAccess.title,
          value: cards.peopleWithElectricityAccess.value,
          period: cards.peopleWithElectricityAccess.reportingPeriod,
          target: cards.peopleWithElectricityAccess.targetLabel,
        },
        {
          label: cards.accessRate.title,
          value: cards.accessRate.value,
          period: cards.accessRate.sourceYear,
          target: cards.accessRate.targetLabel,
        },
        {
          label: cards.generationCapacity.title,
          value: cards.generationCapacity.value,
          period: cards.generationCapacity.reportingPeriod,
          target: cards.generationCapacity.benchmarkLabel,
        },
        {
          label: cards.cleanCookingAccess.title,
          value: cards.cleanCookingAccess.value,
          period: cards.cleanCookingAccess.reportingPeriod,
          target: cards.cleanCookingAccess.targetLabel,
        },
      ]
    : []

  return (
    <div className="font-landing min-h-screen bg-surface">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-[2.25rem] leading-[2.625rem] font-bold tracking-tight text-text-default sm:text-[3rem] sm:leading-[3.25rem]">
          National progress
        </h1>

        {isPending && <NationalStatementSkeleton />}

        {isError && (
          <p className="mt-6 max-w-[36rem] text-[1.1875rem] leading-7 text-text-default">
            The published figures could not be loaded. Nothing is shown here
            rather than a figure that may be out of date.
          </p>
        )}

        {cards && (
          <>
            <p className="mt-6 max-w-[36rem] text-[1.1875rem] leading-7 text-text-muted">
              Nigeria&rsquo;s position against the Mission 300 National Energy
              Compact, as reported by the responsible institutions.
            </p>

            <dl className="mt-10 max-w-[42rem] border-t-2 border-text-default">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-border-strong py-4"
                >
                  <dt className="text-[1.0625rem] leading-6 text-text-default">
                    {row.label}
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-[1.75rem] leading-9 font-bold tracking-tight text-text-default">
                      {row.value}
                    </span>
                    <span className="text-[0.9375rem] leading-6 text-text-muted">
                      {row.period}
                      {row.target ? ` · target ${row.target}` : ''}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 max-w-[42rem] text-[0.9375rem] leading-6 text-text-muted">
              Source:{' '}
              {cards.peopleWithElectricityAccess.provenance.source}
            </p>
          </>
        )}
      </main>
    </div>
  )
}
