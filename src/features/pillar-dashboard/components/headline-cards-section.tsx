import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { HeadlineCard } from './headline-card'

/** The four real KPI-backed headline cards for this pillar. */
export function HeadlineCardsSection({ cards }: { cards: readonly PillarHeadlineCard[] }) {
  return (
    <section
      aria-label="Headline performance cards"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <HeadlineCard key={card.kpiId} card={card} />
      ))}
    </section>
  )
}
