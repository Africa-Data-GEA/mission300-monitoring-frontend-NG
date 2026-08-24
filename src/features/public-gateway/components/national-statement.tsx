import { Link } from 'react-router'
import type { HeadlineCards } from '@/api/schemas/executive-overview'
import { formatDate } from '@/lib/format'
import { CONFIDENCE_LABELS } from '../lib/headline-figures'
import { HeroBackdrop } from './hero-backdrop'
import { HeroDataCard } from './hero-data-card'

/**
 * The opening band of the public gateway.
 *
 * THE HEADLINE IS A NUMBER, NOT A SLOGAN. Per §02 of the build spec: the single
 * most important fact about Mission 300 in Nigeria, stated before the reader
 * scrolls, as the figure itself at display size. "Powering Nigeria's future"
 * would survive being pasted onto Ghana's version of this page; "137.3M
 * Nigerians have electricity access, against a target of 236.7M" cannot be.
 * That is the test every section here has to pass.
 *
 * WHY A DARK BAND. The previous build opened on white and read as a document
 * with no cover. A field of the platform's own navy gives the record a masthead
 * and, more usefully, separates the *claim* from the *evidence*: one dark band of
 * assertion, then everything below it on white is chart, source and table.
 *
 * The band carries a photograph behind a heavy navy scrim — see `HeroBackdrop`
 * for where the file goes, why the scrim is weighted to the left, and why the
 * hero still reads as finished on the days no photograph has been cleared for
 * publication.
 *
 * TYPE SCALE. This page sets its own, larger than the dashboard's 13px base,
 * because a public page is read once, by anyone, often on a phone. The arbitrary
 * values here are that scale and are intentional — do not "fix" them back to the
 * app tokens.
 */
export function NationalStatement({
  cards,
  statesCovered,
}: {
  cards: HeadlineCards
  /** Number of states with an approved coverage breakdown, for the record's
   * own metadata. Null while the state payload has not loaded — the row is
   * dropped rather than showing a zero that reads as "no states covered". */
  statesCovered: number | null
}) {
  const headline = cards.peopleWithElectricityAccess

  const metadataRows = [
    { label: 'Reporting period', value: headline.reportingPeriod },
    { label: 'Data confidence', value: CONFIDENCE_LABELS[headline.source] },
    ...(statesCovered === null
      ? []
      : [{ label: 'Coverage', value: `${statesCovered} states with an approved delivery breakdown` }]),
    { label: 'Published by', value: headline.provenance.source },
    { label: 'Last updated', value: formatDate(headline.provenance.lastUpdated) },
  ]

  return (
    <section aria-labelledby="national-statement" className="relative isolate bg-brand-800">
      <HeroBackdrop />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-start lg:gap-14">
        <div className="min-w-0 flex-1">
          <p className="text-[0.75rem] leading-4 font-bold tracking-[0.16em] text-white/60 uppercase">
            Federal Republic of Nigeria · National Energy Compact
          </p>

          <h1
            id="national-statement"
            className="mt-4 max-w-[38rem] text-[2.25rem] leading-[2.625rem] font-bold tracking-tight text-white sm:text-[3rem] sm:leading-[3.25rem]"
          >
            {headline.value} Nigerians have electricity access
          </h1>

          <p className="mt-5 max-w-[36rem] text-[1.0625rem] leading-7 text-white/80">
            Up from a baseline of {headline.baselineLabel}, against a national
            target of {headline.targetLabel}. This page publishes the figures
            behind that number, each with the institution responsible for it and
            the status of the data.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/progress"
              className="border-2 border-white bg-white px-5 py-2.5 text-[1rem] leading-6 font-bold text-brand-800 transition-colors hover:bg-transparent hover:text-white"
            >
              See national progress
            </Link>
            <p className="text-[0.875rem] leading-5 text-white/70">
              <Link
                to="/account/login"
                className="font-semibold text-white underline underline-offset-4 hover:no-underline"
              >
                Sign in
              </Link>{' '}
              — for institutions submitting data, reviewers and oversight users.
            </p>
          </div>
        </div>

        <HeroDataCard
          rows={metadataRows}
          links={[
            { label: 'Latest published figures', to: '#latest-figures' },
            { label: 'How access is being delivered', to: '#access-delivery' },
            { label: 'Delivery by state', to: '#delivery-in-motion' },
            { label: 'Who reports these figures', to: '#institutions' },
          ]}
        />
      </div>
    </section>
  )
}
