import type { ProgramsHeadlineCards } from '@/api/schemas/programs'
import { ExceptionCard } from './exception-card'
import { MilestoneOnTimeCard } from './milestone-on-time-card'
import { SummaryCard } from './summary-card'

/** Section A — the four headline performance cards. */
export function HeadlineCardsSection({ cards }: { cards: ProgramsHeadlineCards }) {
  return (
    <section
      aria-label="Headline performance cards"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <SummaryCard data={cards.summary} />
      <MilestoneOnTimeCard data={cards.milestoneOnTime} />
      <ExceptionCard data={cards.delayedOrBlocked} />
      <ExceptionCard data={cards.evidenceOverdue} />
    </section>
  )
}
