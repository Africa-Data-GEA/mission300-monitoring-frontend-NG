import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  StackedStatusBar,
  StatusLegend,
} from '@/components/ui/stacked-status-bar'

const counts = [
  { status: 'completed' as const, count: 2 },
  { status: 'on-track' as const, count: 6 },
  { status: 'delayed' as const, count: 2 },
]

describe('StackedStatusBar', () => {
  it('renders as an image with an accessible description', () => {
    render(<StackedStatusBar counts={counts} total={10} label="Last-mile access" />)

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('states every count and the total in words', () => {
    render(<StackedStatusBar counts={counts} total={10} label="Last-mile access" />)

    const label = screen.getByRole('img').getAttribute('aria-label')
    expect(label).toContain('Last-mile access')
    expect(label).toContain('2 completed')
    expect(label).toContain('6 on track')
    expect(label).toContain('2 delayed')
    expect(label).toContain('10 total')
  })

  it('sizes each segment in proportion to its count', () => {
    render(<StackedStatusBar counts={counts} total={10} label="Pillar" />)

    expect(screen.getByTestId('segment-completed')).toHaveStyle({ width: '20%' })
    expect(screen.getByTestId('segment-on-track')).toHaveStyle({ width: '60%' })
    expect(screen.getByTestId('segment-delayed')).toHaveStyle({ width: '20%' })
  })

  it('gives each status its own fill', () => {
    render(<StackedStatusBar counts={counts} total={10} label="Pillar" />)

    expect(screen.getByTestId('segment-on-track')).toHaveClass(
      'bg-status-on-track',
    )
    expect(screen.getByTestId('segment-delayed')).toHaveClass(
      'bg-status-delayed',
    )
  })

  it('omits statuses with a zero count rather than rendering slivers', () => {
    render(
      <StackedStatusBar
        counts={[...counts, { status: 'blocked', count: 0 }]}
        total={10}
        label="Pillar"
      />,
    )

    expect(screen.queryByTestId('segment-blocked')).not.toBeInTheDocument()
  })

  describe('pillars with no records', () => {
    /*
     * Regional integration has no approved priority records. An empty or
     * full-width bar would both imply a status, so it must say so in words.
     */
    it('renders a message instead of a bar when the total is zero', () => {
      render(<StackedStatusBar counts={[]} total={0} label="Regional integration" />)

      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(
        screen.getByText('No approved priority records'),
      ).toBeInTheDocument()
    })

    it('renders the message when every count is zero', () => {
      render(
        <StackedStatusBar
          counts={[{ status: 'on-track', count: 0 }]}
          total={0}
          label="Pillar"
        />,
      )

      expect(screen.getByText('No approved priority records')).toBeInTheDocument()
    })

    it('accepts a custom empty label', () => {
      render(
        <StackedStatusBar
          counts={[]}
          total={0}
          label="Pillar"
          emptyLabel="Nothing to report"
        />,
      )

      expect(screen.getByText('Nothing to report')).toBeInTheDocument()
    })
  })
})

describe('StatusLegend', () => {
  it('renders a labelled entry per status', () => {
    render(<StatusLegend statuses={['completed', 'on-track', 'blocked']} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('On track')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('renders one item per status', () => {
    render(<StatusLegend statuses={['completed', 'on-track']} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
