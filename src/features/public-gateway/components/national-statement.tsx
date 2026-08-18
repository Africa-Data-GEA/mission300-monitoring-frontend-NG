import { Link } from 'react-router'
import type { HeadlineCards } from '@/features/dashboard/types'
import { FigureTrend } from './figure-trend'

/**
 * The opening of the public gateway, per the approved Figma draft
 * (see docs/public-gateway-home.md §02 and §03 for the copy this implements).
 *
 * ONE HEADING, ONE SENTENCE, ONE ACTION. GOV.UK service pages are built this
 * way round: a large short heading, a single line of context, then the
 * action — everything else below the fold. The figure sits inside the
 * sentence (bold) rather than floating at display size on its own, matching
 * how Our World in Data and Eurostat actually write.
 *
 * "See national progress" is a plain underlined link, not a button — the
 * Figma draws it as text, so the earlier `StartButton` component (GOV.UK
 * green start button) was removed rather than left unused.
 *
 * TYPE SCALE. This page sets its own, larger than the dashboard's 13px base:
 * GOV.UK runs 19px body and 48px headings because a public page is read once,
 * by anyone, often on a phone. The arbitrary values here are that scale and
 * are intentional — do not "fix" them back to the app tokens. The one
 * deliberate exception is the opening sentence under the H1, set to 16px on
 * request rather than the larger scale the rest of the page uses.
 */
export function NationalStatement({ cards }: { cards: HeadlineCards }) {
  const headline = cards.peopleWithElectricityAccess

  const figures = [
    {
      id: 'people',
      label: cards.peopleWithElectricityAccess.title,
      period: cards.peopleWithElectricityAccess.reportingPeriod,
      value: cards.peopleWithElectricityAccess.value,
      trend: cards.peopleWithElectricityAccess.trend,
    },
    {
      id: 'access-rate',
      label: cards.accessRate.title,
      period: cards.accessRate.sourceYear,
      value: cards.accessRate.value,
      trend: cards.accessRate.trend,
    },
    {
      id: 'generation',
      label: cards.generationCapacity.title,
      period: cards.generationCapacity.reportingPeriod,
      value: cards.generationCapacity.value,
      trend: cards.generationCapacity.trend,
    },
    {
      id: 'clean-cooking',
      label: cards.cleanCookingAccess.title,
      period: cards.cleanCookingAccess.reportingPeriod,
      value: cards.cleanCookingAccess.value,
      trend: cards.cleanCookingAccess.trend,
    },
  ]

  // Same four categories the "Related Content" list names in the Figma.
  // Two point at the sections that actually carry that content now (the
  // Pillars card grid these originally anchored into was removed on
  // request); "Delivery" and "Clean Cooking" have no on-page section of
  // their own, so they go to /progress instead — a route that exists —
  // rather than an anchor to nowhere (docs/public-gateway-home.md §10 bans
  // exactly that).
  const relatedContent = [
    { label: 'Access and connections', to: '#access-channels' },
    { label: 'Generation and network', to: '#performance-evolution' },
    { label: 'Delivery', to: '/progress' },
    { label: 'Clean Cooking', to: '/progress' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="max-w-[36rem]">
          <h1 className="text-[2.25rem] leading-[2.625rem] font-bold tracking-tight text-text-default sm:text-[3rem] sm:leading-[3.25rem]">
            National electrification record
          </h1>

          <p className="mt-6 text-base leading-6 text-text-default">
            <span className="font-bold">{headline.value}</span> people in
            Nigeria have electricity access, against a national target of{' '}
            <span className="font-bold">{headline.targetLabel}</span>.
          </p>

          <div className="mt-8">
            <Link
              to="/progress"
              className="text-[1.1875rem] leading-6 font-medium text-link underline underline-offset-4 hover:no-underline"
            >
              See National Progress
            </Link>
          </div>
        </div>

        <nav
          aria-labelledby="related-content"
          className="max-w-[23rem] border-t-2 border-text-default pt-4 lg:w-[23rem] lg:shrink-0"
        >
          <h2
            id="related-content"
            className="text-[1.125rem] leading-6 font-semibold text-text-default"
          >
            Related Content
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {relatedContent.map((item) => {
              const linkClassName =
                'text-[1.0625rem] leading-6 font-medium text-link underline underline-offset-4 hover:no-underline'
              return (
                <li key={item.label}>
                  {item.to.startsWith('#') ? (
                    <a href={item.to} className={linkClassName}>
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} className={linkClassName}>
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/*
        One continuous panel, modelled on the IEA electricity data explorer's
        "Key figures" block — not four separate floating cards. A title bar
        (matching IEA's "Key figures for May 2026, OECD Total") sits above a
        grid of stat cells separated by hairline dividers rather than gaps,
        so the whole thing reads as a single dense report card. Still
        square-cornered (see public-header.tsx's "SQUARE CORNERS" note) —
        the departure from this page's GOV.UK restraint is the fill, not the
        shape.
        Two nested divide-y/divide-x grids, not one 2-column grid with
        divide-y: Tailwind's `divide-*` puts a border on every child but the
        first in DOM order, which only produces a correct crosshair on a true
        2D grid if each row is its own divide-x group and the rows themselves
        are stacked in a divide-y wrapper — a single grid-cols-2 + divide-y
        would wrongly put a top border on the top-right cell too.
      */}
      <section aria-labelledby="latest-figures" className="mt-14 bg-brand-700">
        <h2
          id="latest-figures"
          className="border-b border-white/15 px-6 py-5 text-[1.5rem] leading-8 font-bold tracking-tight text-white"
        >
          Latest published figures
        </h2>

        <div className="divide-y divide-white/15">
          {[figures.slice(0, 2), figures.slice(2, 4)].map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 divide-y divide-white/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              {row.map((figure) => (
                <div key={figure.id} className="p-6">
                  <p className="text-[1.125rem] leading-6 font-bold tracking-tight text-white">
                    {figure.label}
                  </p>
                  <div className="mt-6">
                    <p className="text-[1rem] leading-5 text-white/70">
                      {figure.period}
                    </p>
                    <p className="mt-1.5 text-[2.75rem] leading-none font-bold tracking-tight text-white">
                      {figure.value}
                    </p>
                  </div>
                  {figure.trend && <FigureTrend trend={figure.trend} tone="inverted" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
