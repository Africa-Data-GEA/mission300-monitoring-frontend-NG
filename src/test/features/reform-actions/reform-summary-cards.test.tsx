import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ReformActionsOverview } from '@/api/schemas/reform-actions'
import { ReformStatusBadge } from '@/features/reform-actions/components/reform-status-badge'
import { ReformSummaryCards } from '@/features/reform-actions/components/reform-summary-cards'

const SUMMARY: ReformActionsOverview['summary'] = {
  total: 6,
  priorityTotal: 2,
  byPillar: [],
  byStatus: {
    priority: { completed: 1, delayed: 1, 'in-progress-on-track': 0 },
    other: { completed: 1, delayed: 1, 'in-progress-on-track': 1, 'in-progress-at-risk': 1 },
  },
}

describe('ReformSummaryCards', () => {
  it('totals the actions and groups the statuses', () => {
    render(<ReformSummaryCards summary={SUMMARY} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('2 priority')).toBeInTheDocument()
    const completed = screen.getByText('Completed').parentElement
    expect(completed).toHaveTextContent('2')
    const inProgress = screen.getByText('In progress').parentElement
    expect(inProgress).toHaveTextContent('2')
    const delayed = screen.getByText('Delayed').parentElement
    expect(delayed).toHaveTextContent('2')
  })
})

describe('ReformStatusBadge', () => {
  it('words each status', () => {
    render(<ReformStatusBadge status="in-progress-minor-delays" />)
    expect(screen.getByText('In progress, minor delays')).toBeInTheDocument()
  })
})
