import { PILLAR_LABELS } from '@/api/schemas/common'
import type { BulletMetric, HeadlineCards } from '@/features/dashboard/types'
import type { PillarId } from '@/types/domain'
import { FigureTrend } from './figure-trend'
import { MiniProgressBar } from './mini-progress-bar'

/**
 * §05 — the Compact's six pillars, as a grid of cards rather than a numbered
 * text list.
 *
 * The original version was six rows of name + one-line summary and nothing
 * else — no number, no graph, all text. docs/public-gateway-home.md §05
 * always specified more than that ("name, one line of what it covers, and
 * its current headline indicator"); this fills in the indicator half of that
 * spec, using whichever headline card or national-performance metric is
 * already tagged to that pillar, with a progress bar or trend arrow as the
 * graphical element — not a fourth block of prose.
 *
 * A pillar this payload has no number for (currently regional-integration —
 * nothing in `nationalPerformance` is tagged to it yet) still gets a card,
 * name and summary only. An empty state is better than a fabricated one.
 *
 * NO ICONS. A pillar rendered as an icon in a tinted circle is the single
 * most recognisable generated-page pattern there is, and the icons never mean
 * anything — there is no glyph for "viable utilities".
 *
 * Not links yet: the public per-pillar views do not exist, and the
 * authenticated /pillars routes are behind sign-in. Rendering these as links
 * would drop a citizen onto a login wall.
 */
const PILLAR_SUMMARIES: Record<PillarId, string> = {
  'generation-network':
    'Building generation capacity and the transmission network to carry it.',
  'last-mile-access':
    'Reaching households beyond the grid through mini-grids and solar home systems.',
  'financially-viable-utilities':
    'Putting distribution companies on a financially sustainable footing.',
  'private-sector-participation':
    'Bringing private capital into generation, distribution and off-grid delivery.',
  'regional-integration':
    'Connecting Nigeria to regional power markets and cross-border trade.',
  'clean-cooking':
    'Moving households away from firewood and charcoal to cleaner fuels.',
}

interface PillarIndicator {
  value: string
  percent: number | null
  trend?: BulletMetric['trend']
}

/** Picks whichever already-computed figure speaks for a pillar, if any. */
function resolveIndicator(
  pillar: PillarId,
  cards: HeadlineCards,
  metrics: readonly BulletMetric[],
): PillarIndicator | null {
  if (pillar === 'generation-network') {
    return {
      value: cards.generationCapacity.value,
      percent: cards.generationCapacity.availabilityRatio,
      trend: cards.generationCapacity.trend,
    }
  }
  if (pillar === 'last-mile-access') {
    // No numeric scale on the access-rate card (only a display target
    // label), so there is a trend to show but no bar to draw.
    return { value: cards.accessRate.value, percent: null, trend: cards.accessRate.trend }
  }
  if (pillar === 'clean-cooking') {
    const card = cards.cleanCookingAccess
    const percent =
      card.scaleMax > card.scaleMin
        ? ((card.current - card.scaleMin) / (card.scaleMax - card.scaleMin)) * 100
        : null
    return { value: card.value, percent, trend: card.trend }
  }

  const metric = metrics.find((entry) => entry.pillar === pillar)
  if (!metric) return null
  const percent =
    metric.target !== null && metric.scaleMax > metric.scaleMin
      ? ((metric.current - metric.scaleMin) / (metric.scaleMax - metric.scaleMin)) * 100
      : null
  return { value: metric.value, percent, trend: metric.trend }
}

export function Pillars({
  headlineCards,
  nationalPerformance,
}: {
  headlineCards: HeadlineCards
  nationalPerformance: readonly BulletMetric[]
}) {
  const pillars = Object.entries(PILLAR_LABELS) as [PillarId, string][]

  return (
    <section aria-labelledby="pillars-heading" className="mt-14">
      <h2
        id="pillars-heading"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        The six pillars of the Compact
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map(([id, label]) => {
          const indicator = resolveIndicator(id, headlineCards, nationalPerformance)

          return (
            <div key={id} id={`pillar-${id}`} className="border border-border-strong p-5">
              <h3 className="text-[1.125rem] leading-6 font-bold tracking-tight text-link">
                {label}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-5 text-text-muted">
                {PILLAR_SUMMARIES[id]}
              </p>

              {indicator && (
                <div className="mt-5 border-t border-border-strong pt-4">
                  <p className="text-[1.75rem] leading-8 font-bold tracking-tight text-text-default">
                    {indicator.value}
                  </p>
                  {indicator.percent !== null && (
                    <MiniProgressBar percent={indicator.percent} label={label} />
                  )}
                  {indicator.trend && <FigureTrend trend={indicator.trend} className="mt-3" />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
