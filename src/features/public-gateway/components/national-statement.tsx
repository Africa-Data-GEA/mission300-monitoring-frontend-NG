import { useBrandIdentity } from '@/features/branding/use-brand-identity'
import { Link } from 'react-router'
import type { HeadlineCards } from '@/api/schemas/executive-overview'
import { formatDate } from '@/lib/format'
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
export function NationalStatement({ cards }: { cards: HeadlineCards }) {
  const headline = cards.peopleWithElectricityAccess
  const identity = useBrandIdentity()

  /*
   * Three rows, not five. A metadata card is only read if it can be taken in
   * at a glance; at five rows it becomes a second paragraph wearing a border.
   * Period, source and date are what a journalist needs to cite the figure —
   * confidence is already on every card as a labelled dot, and the state count
   * is stated by the state table itself.
   */
  const metadataRows = [
    { label: 'Period', value: headline.reportingPeriod },
    { label: 'Source', value: headline.provenance.source },
    { label: 'Updated', value: formatDate(headline.provenance.lastUpdated) },
  ]

  return (
    <section
      aria-labelledby="national-statement"
      className="relative isolate flex min-h-[60vh] items-center bg-landing-deep-navy"
    >
      <HeroBackdrop />
      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-start lg:gap-14">
        <div className="min-w-0 flex-1">
          <p className="text-[0.75rem] leading-4 font-medium tracking-[0.16em] text-white/70 uppercase">
            {identity.officialName}
          </p>

          <h1
            id="national-statement"
            className="mt-4 max-w-[38rem] text-[2.25rem] leading-[2.625rem] font-semibold tracking-tight text-white sm:text-[3rem] sm:leading-[3.25rem]"
          >
            {/* Only the figure itself switches face — see .font-landing-figure's
                note in index.css. The surrounding sentence stays on the page's
                normal type so it reads as one heading, not two fonts stitched
                together. */}
            <span className="font-landing-figure text-landing-gold tabular-nums">{headline.value}</span> people in {identity.country}{' '}
            have electricity access
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/progress"
              className="rounded-[0.375rem] border-2 border-white bg-white px-5 py-2.5 text-[1rem] leading-6 font-semibold text-landing-navy transition-colors hover:bg-transparent hover:text-white"
            >
              See national progress
            </Link>
            {/* The header already carries a Sign in button; this is the one
                place that says who it is for, in six words rather than a
                sentence. */}
            <p className="text-[0.875rem] leading-5 text-white/70">
              <Link
                to="/account/login"
                className="font-semibold text-white underline underline-offset-4 hover:no-underline"
              >
                Sign in
              </Link>{' '}
              — for reporting institutions
            </p>
          </div>
        </div>

        {/* No jump-links here: the header's Figures / Delivery / About menus
            already reach every section, and repeating them cost four more
            lines of text in the one place that should be scannable. */}
        <HeroDataCard rows={metadataRows} />
      </div>
    </section>
  )
}
