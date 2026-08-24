import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

export interface HeroDataRow {
  readonly label: string
  readonly value: string
}

/**
 * The white card that sits inside the hero band, carrying the record's own
 * metadata: what period it covers, who published it, when it was last updated,
 * how many states are represented.
 *
 * WHY IT IS IN THE HERO AND NOT THE FOOTER. On a statistical publication the
 * provenance is not small print, it is the first thing a professional reader
 * checks and the thing that decides whether the rest of the page is usable. A
 * journalist who has to scroll to the footer to find the reporting period will
 * publish without it. Putting the coverage, source and last-updated date beside
 * the headline — before any chart — is the same move a statistical office makes
 * on the cover of a release.
 *
 * This is the one element on the page that carries a shadow and a light fill on
 * a dark ground, because it is the one element that must be found without
 * looking for it.
 */
export function HeroDataCard({
  rows,
  links,
}: {
  rows: readonly HeroDataRow[]
  links: readonly { label: string; to: string }[]
}) {
  return (
    <aside
      aria-label="About this record"
      className="w-full border border-white/10 bg-surface p-6 shadow-[0_18px_40px_rgba(0,0,0,0.28)] lg:w-[22rem] lg:shrink-0"
    >
      <dl className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-brand-600 uppercase">
              {row.label}
            </dt>
            <dd className="mt-1 text-[0.875rem] leading-5 text-text-default">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-border-default pt-4">
        <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-brand-600 uppercase">
          Go to
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {links.map((link) => {
            const className =
              'group inline-flex items-start gap-1.5 text-[0.875rem] leading-5 font-medium text-link underline underline-offset-4 hover:no-underline'
            return (
              <li key={link.label}>
                {link.to.startsWith('#') ? (
                  <a href={link.to} className={className}>
                    <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.to} className={className}>
                    <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    {link.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
