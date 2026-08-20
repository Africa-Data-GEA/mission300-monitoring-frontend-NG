import { Link } from 'react-router'

/**
 * §09 — footer.
 *
 * The full data-confidence key required by §00 now sits right under the
 * headline strip instead (see NationalStatement's `DataConfidenceKey`) —
 * "immediately beneath the headline strip" per §00, not at the very bottom
 * of the page, separated from the figures it explains by everything else
 * on the page. This footer just points back to it rather than repeating
 * the same paragraph twice on one page.
 */
export function PublicFooter({ lastUpdated }: { lastUpdated: string }) {
  return (
    <footer className="mt-16 border-t-4 border-brand-600 bg-surface-sunken">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-[1.125rem] leading-6 font-bold text-text-default">
          About these figures
        </h2>

        <p className="mt-3 max-w-[42rem] text-[1rem] leading-6 text-text-muted">
          Every figure on this page carries the status of the data behind it —{' '}
          <a href="#data-confidence" className="font-medium text-link underline underline-offset-4 hover:no-underline">
            see the data-confidence key
          </a>{' '}
          at the top of the page for what Confirmed, Public source,
          Provisional and Requires validation each mean.
        </p>

        <p className="mt-6 text-[0.9375rem] leading-6 text-text-muted">
          Last updated {lastUpdated}
        </p>

        <div className="mt-6 border-t border-border-strong pt-6">
          <Link
            to="/account/login"
            className="text-[1rem] leading-6 font-bold text-link underline underline-offset-4 hover:no-underline"
          >
            Sign in to the monitoring platform
          </Link>
          <p className="mt-1 text-[0.9375rem] leading-6 text-text-muted">
            For institutions submitting data, reviewers and oversight users.
          </p>
        </div>

        <p className="mt-8 text-[0.9375rem] leading-6 text-text-muted">
          Federal Republic of Nigeria &middot; Federal Ministry of Power
        </p>
      </div>
    </footer>
  )
}
