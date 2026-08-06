import { Link } from 'react-router'

/**
 * §09 — footer.
 *
 * Carries the data-confidence key required by §00: because every figure is
 * published regardless of validation status, the page owes the reader a plain
 * explanation of what those statuses mean. It sits in body text rather than a
 * tooltip or a legend of coloured dots, because readers skip chrome and this is
 * the one caveat on the page that has to land.
 *
 * If a provisional figure is ever quoted as final, this paragraph is what the
 * correction points back to.
 */
export function PublicFooter({ lastUpdated }: { lastUpdated: string }) {
  return (
    <footer className="mt-16 border-t-4 border-brand-600 bg-surface-sunken">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="text-[1.125rem] leading-6 font-bold text-text-default">
          About these figures
        </h2>

        <p className="mt-3 max-w-[42rem] text-[1rem] leading-6 text-text-muted">
          Every figure on this page carries the status of the data behind it.
          <strong className="font-bold text-text-default"> Confirmed</strong>{' '}
          means validated by the institution responsible for it.
          <strong className="font-bold text-text-default"> Public source</strong>{' '}
          means published elsewhere, such as by the World Bank.
          <strong className="font-bold text-text-default"> Provisional</strong>{' '}
          and
          <strong className="font-bold text-text-default">
            {' '}
            requires validation
          </strong>{' '}
          are early figures that may change as data is checked. They are shown
          so the record is complete, not because they are final.
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
