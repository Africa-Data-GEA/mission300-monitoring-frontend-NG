import type { AlertCard as AlertCardData } from '@/api/schemas/bottlenecks'
import { AlertCard } from './alert-card'

/**
 * Section A — the four headline alert cards.
 *
 * The specification is explicit that operational benchmarks are limited to
 * these four; the API always returns exactly four (enforced by the schema),
 * so this maps over the array rather than naming four fixed slots.
 */
export function AlertCardsSection({ cards }: { cards: readonly AlertCardData[] }) {
  return (
    <section
      aria-label="Headline exception alerts"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <AlertCard key={card.id} data={card} />
      ))}
    </section>
  )
}
