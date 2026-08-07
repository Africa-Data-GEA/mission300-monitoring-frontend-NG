import { Link } from 'react-router'
import { resolveTrend } from '@/lib/trend'
import type { HeadlineCards } from '@/features/dashboard/types'
import type { Trend } from '@/types/domain'

/**
 * Plain-text trend, not a badge. The Figma drew this as a bright green
 * rounded pill, but that is the one piece of "SaaS product" colour language
 * on a page that otherwise deliberately avoids it (see the "SQUARE CORNERS"
 * note in public-header.tsx) — a coloured arrow and sentence carries the same
 * information without introducing a shape nothing else on the page uses.
 */
function FigureTrend({ trend }: { trend: Trend }) {
  const { isFlat, isImproving, Icon } = resolveTrend(trend)

  return (
    <p
      className={
        'mt-6 flex items-center gap-1.5 text-[1rem] leading-5 font-medium ' +
        (isFlat ? 'text-text-muted' : isImproving ? 'text-trend-up' : 'text-trend-down')
      }
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {trend.label}
    </p>
  )
}

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

  // Same four categories the "Related Content" list names in the Figma, each
  // pointed at an on-page anchor rather than a route that doesn't exist yet —
  // docs/public-gateway-home.md §10 bans a link to a page that isn't built.
  const relatedContent = [
    { label: 'Access and connections', to: '#delivery-channels' },
    { label: 'Generation and network', to: '#performance-indicators' },
    { label: 'Delivery', to: '#delivery-status' },
    { label: 'Clean Cooking', to: '#pillars' },
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
            {relatedContent.map((item) => (
              <li key={item.label}>
                <a
                  href={item.to}
                  className="text-[1.0625rem] leading-6 font-medium text-link underline underline-offset-4 hover:no-underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/*
        Bordered boxes rather than the dashboard's card component — still
        square-cornered (no border-radius on the box itself, matching the
        "square corners throughout" rule in public-header.tsx), the one
        rounded element is the trend pill, which reuses TrendIndicator's own
        rounded-pill token rather than inventing a new colour.
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
