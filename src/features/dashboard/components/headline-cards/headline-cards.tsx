import type { HeadlineCards as HeadlineCardsData } from '../../types'
import { AccessRateCard } from './access-rate-card'
import { EscalationsCard } from './escalations-card'
import { GenerationCapacityCard } from './generation-capacity-card'
import { MilestoneDeliveryCard } from './milestone-delivery-card'

/**
 * Section A of the page specification — exactly four headline cards.
 *
 * The specification states "only four cards appear at the top", so this
 * composes a fixed set of four named cards rather than mapping an array. A
 * fifth card cannot be added by accident. Each card lives in its own file in
 * this folder.
 *
 * TEXT BUDGET: each card shows its value plus at most one supporting line.
 * Definitions, methodology, baselines, targets and sources all live behind the
 * information icon — that is what the specification put it there for.
 */
export function HeadlineCards({ cards }: { cards: HeadlineCardsData }) {
  return (
    <section
      aria-label="Headline metrics"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MilestoneDeliveryCard data={cards.milestoneDelivery} />
      <AccessRateCard data={cards.accessRate} />
      <GenerationCapacityCard data={cards.generationCapacity} />
      <EscalationsCard data={cards.escalations} />
    </section>
  )
}
