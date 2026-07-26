import { Database, Layers, ListChecks, Star } from 'lucide-react'
import type { CatalogueSummaryCard } from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'

/** One icon per summary card, in the order the API returns them. */
const ICONS = [ListChecks, Star, Layers, Database]

/**
 * Section A — catalogue summary.
 *
 * The specification is explicit that these "are catalogue and data-readiness
 * summaries, not performance targets", so the cards carry no trend or progress
 * — they count what is in the catalogue and how much of it has data.
 */
export function CatalogueSummary({
  cards,
}: {
  cards: readonly CatalogueSummaryCard[]
}) {
  return (
    <section
      aria-label="Catalogue summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = ICONS[index % ICONS.length]!

        return (
          <Card key={card.id} className="flex h-full flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Icon aria-hidden="true" className="size-4 text-brand-600" />
              </span>
              <InfoPopover provenance={card.provenance} label={card.title} />
            </div>

            <p
              title={card.title}
              className="mt-3 line-clamp-2 min-h-9 text-sm text-text-muted"
            >
              {card.title}
            </p>

            <p className="mt-1 text-4xl leading-none font-semibold tracking-tight text-text-default">
              {card.count}
            </p>

            {card.breakdown.length > 0 && (
              <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs text-text-muted">
                {card.breakdown.map((entry) => (
                  <li key={entry.label}>
                    <span className="font-medium text-text-default">
                      {entry.count}
                    </span>{' '}
                    {entry.label}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}
    </section>
  )
}
