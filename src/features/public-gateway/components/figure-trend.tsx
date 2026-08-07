import { resolveTrend } from '@/lib/trend'
import type { Trend } from '@/types/domain'

/**
 * Plain-text trend, not a badge. The Figma landing-page draft drew this as a
 * bright green rounded pill, but that is the one piece of "SaaS product"
 * colour language on a page that otherwise deliberately avoids it (see the
 * "SQUARE CORNERS" note in public-header.tsx) — a coloured arrow and sentence
 * carries the same information without introducing a shape nothing else on
 * the page uses. Shared by NationalStatement's figure cards and Pillars'
 * per-pillar cards.
 */
export function FigureTrend({ trend, className = 'mt-6' }: { trend: Trend; className?: string }) {
  const { isFlat, isImproving, Icon } = resolveTrend(trend)

  return (
    <p
      className={
        `${className} flex items-center gap-1.5 text-[1rem] leading-5 font-medium ` +
        (isFlat ? 'text-text-muted' : isImproving ? 'text-trend-up' : 'text-trend-down')
      }
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {trend.label}
    </p>
  )
}
