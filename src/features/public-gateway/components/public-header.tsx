import { Link } from 'react-router'
import { useBrandConfig } from '@/features/branding/api'

/**
 * Public gateway header — one bar, not three.
 *
 * Modelled on how GOV.UK, Eurostat and the French DSFR open a state page: a
 * single dark identity band carrying the crest and the service name, and
 * nothing else competing with it. The earlier version stacked a dark strip on
 * top of a white header on top of a nav, which is three bars of chrome before
 * a reader reaches a single word of content.
 *
 * SQUARE CORNERS, throughout this page. GOV.UK uses no border radius anywhere,
 * and that single decision does more to separate a state service from a
 * commercial template than any amount of colour — rounded cards are the
 * default output of every UI kit.
 *
 * The green rule beneath the bar is the one national note. Nigeria's flag
 * green (#008751) sits within a few degrees of GOV.UK's own #0f7a52, so the
 * page reads as an international government service that happens to be
 * Nigerian, rather than as a themed template.
 *
 * The Figma draft also showed a second nav row beneath the rule (Home / About
 * / Data Access). Cut: About and Data Access have no page to link to yet, and
 * a tab that does nothing when clicked reads as broken rather than deliberate
 * — worse than not showing it. Re-add the row once those pages exist.
 */
export function PublicHeader() {
  const { data: brand } = useBrandConfig()

  return (
    <header>
      <div className="bg-surface-inverse text-text-inverse">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={brand?.logoUrl ?? '/Logos/geapp.png'}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <span className="min-w-0">
              <span className="block text-[1.125rem] leading-6 font-bold tracking-tight">
                Mission 300 {brand?.countryName ?? 'Nigeria'}
              </span>
              <span className="block text-[0.8125rem] leading-4 opacity-70">
                Federal Ministry of Power
              </span>
            </span>
          </Link>

          <Link
            to="/account/login"
            className="ml-auto shrink-0 text-[1rem] leading-6 font-medium underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div aria-hidden="true" className="h-1 bg-brand-600" />
    </header>
  )
}
