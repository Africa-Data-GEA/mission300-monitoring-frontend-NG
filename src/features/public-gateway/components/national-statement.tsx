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
 * are intentional — do not "fix" them back to the app tokens.
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

  // Same four categories the "Related Content" list names in the Figma. Three
  // point at their specific pillar card below (see the `id` on each card in
  // Pillars); "Delivery" has no on-page section of its own since delivery
  // status isn't part of this payload, so it goes to /progress instead — a
  // route that exists — rather than an anchor to nowhere
  // (docs/public-gateway-home.md §10 bans exactly that).
  const relatedContent = [
    { label: 'Access and connections', to: '#pillar-last-mile-access' },
    { label: 'Generation and network', to: '#pillar-generation-network' },
    { label: 'Delivery', to: '/progress' },
    { label: 'Clean Cooking', to: '#pillar-clean-cooking' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="max-w-[36rem]">
          <h1 className="text-[2.25rem] leading-[2.625rem] font-bold tracking-tight text-text-default sm:text-[3rem] sm:leading-[3.25rem]">
            National electrification record
          </h1>

          <p className="mt-6 text-[1.5rem] leading-[2rem] text-text-default">
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
        Bordered boxes rather than the dashboard's card component — square
        corners throughout (see public-header.tsx), including the trend line
        below each figure, which is plain coloured text rather than a pill.
      */}
      <section aria-labelledby="latest-figures" className="mt-14">
        <h2
          id="latest-figures"
          className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
        >
          Latest published figures
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {figures.map((figure) => (
            <div
              key={figure.id}
              className="border border-border-strong p-5"
            >
              <p className="text-[1.125rem] leading-6 font-bold tracking-tight text-link">
                {figure.label}
              </p>
              <div className="mt-6">
                <p className="text-[1rem] leading-5 text-text-muted">
                  {figure.period}
                </p>
                <p className="mt-1.5 text-[2.5rem] leading-none font-bold tracking-tight text-text-default">
                  {figure.value}
                </p>
              </div>
              {figure.trend && <FigureTrend trend={figure.trend} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
