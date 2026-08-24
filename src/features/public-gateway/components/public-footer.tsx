import { Link } from 'react-router'

/**
 * Section 06 — footer.
 *
 * Dark, to bookend the hero band: the record opens and closes on the same
 * colour, and everything in between — the evidence — is on white. That is the
 * whole structural idea of the page, stated twice so it reads as deliberate.
 *
 * The full data-confidence key sits under the headline strip instead of here
 * (see `DataConfidenceKey`), immediately beneath the figures it explains rather
 * than at the bottom of the page separated from them by everything else. This
 * footer points back to it rather than repeating the same paragraph twice on
 * one page.
 */
export function PublicFooter({ lastUpdated }: { lastUpdated: string }) {
  return (
    <footer className="mt-16 bg-brand-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="text-[0.6875rem] leading-4 font-bold tracking-[0.14em] text-white/60 uppercase">
            About these figures
          </h2>
          <p className="mt-3 max-w-[26rem] text-[0.875rem] leading-6 text-white/80">
            Every figure carries the status of the data behind it. See the{' '}
            <a
              href="#data-confidence"
              className="font-semibold text-white underline underline-offset-4 hover:no-underline"
            >
              data-confidence key
            </a>{' '}
            for what Confirmed, Public source, Provisional and Requires
            validation each mean.
          </p>
          <p className="mt-4 text-[0.8125rem] leading-5 text-white/60">
            Last updated {lastUpdated}
          </p>
        </div>

        <div>
          <h2 className="text-[0.6875rem] leading-4 font-bold tracking-[0.14em] text-white/60 uppercase">
            For institutions
          </h2>
          <p className="mt-3 max-w-[26rem] text-[0.875rem] leading-6 text-white/80">
            The monitoring platform behind this record is used by institutions
            submitting data, reviewers and oversight users.
          </p>
          <Link
            to="/account/login"
            className="mt-4 inline-block border-2 border-white/40 px-4 py-2 text-[0.875rem] leading-5 font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-brand-800"
          >
            Sign in to the monitoring platform
          </Link>
        </div>

        <div>
          <h2 className="text-[0.6875rem] leading-4 font-bold tracking-[0.14em] text-white/60 uppercase">
            Published by
          </h2>
          <p className="mt-3 text-[0.875rem] leading-6 text-white/80">
            Federal Republic of Nigeria
            <span className="block">Federal Ministry of Power</span>
          </p>
          <p className="mt-4 max-w-[26rem] text-[0.8125rem] leading-5 text-white/60">
            Mission 300 National Energy Compact. Figures are reproduced as
            reported by the responsible institution and are not adjusted here.
          </p>
        </div>
      </div>
    </footer>
  )
}
