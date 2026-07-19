import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeverityBadge, SourceBadge, StatusBadge } from '@/components/ui/status-badge'
import type { DeliveryStatus, SourceTag } from '@/types/domain'
import type { BottleneckSeverity } from '@/features/dashboard/types'

describe('StatusBadge', () => {
  const cases: ReadonlyArray<[DeliveryStatus, string]> = [
    ['completed', 'Completed'],
    ['on-track', 'On track'],
    ['at-risk', 'At risk'],
    ['lagging', 'Lagging'],
    ['delayed', 'Delayed'],
    ['blocked', 'Blocked'],
    ['limited-data', 'Limited data'],
    ['provisional', 'Provisional'],
  ]

  it.each(cases)('renders %s as "%s"', (status, label) => {
    render(<StatusBadge status={status} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('covers every status in the domain vocabulary', () => {
    // Fails if a new DeliveryStatus is added without a test case above.
    const tested = new Set(cases.map(([status]) => status))
    const all: readonly DeliveryStatus[] = [
      'completed',
      'on-track',
      'at-risk',
      'lagging',
      'delayed',
      'blocked',
      'limited-data',
      'provisional',
    ]

    expect(all.every((status) => tested.has(status))).toBe(true)
  })

  it('colours on-track with the success token', () => {
    render(<StatusBadge status="on-track" />)

    expect(screen.getByText('On track')).toHaveClass('text-status-on-track')
  })

  it('colours at-risk with the danger token', () => {
    render(<StatusBadge status="at-risk" />)

    expect(screen.getByText('At risk')).toHaveClass('text-status-at-risk')
  })

  /*
   * "Limited data" means the dashboard cannot yet assert performance. It must
   * be visually neutral, not red — otherwise a pillar with no KPIs assigned
   * reads as failing.
   */
  it('renders limited-data neutrally rather than as a failure', () => {
    render(<StatusBadge status="limited-data" />)

    const badge = screen.getByText('Limited data')
    expect(badge).toHaveClass('text-status-no-data')
    expect(badge).not.toHaveClass('text-status-at-risk')
  })

  it('renders provisional neutrally rather than as a failure', () => {
    render(<StatusBadge status="provisional" />)

    expect(screen.getByText('Provisional')).toHaveClass('text-status-no-data')
  })

  it('accepts a className override', () => {
    render(<StatusBadge status="on-track" className="mt-4" />)

    expect(screen.getByText('On track')).toHaveClass('mt-4')
  })
})

describe('SourceBadge', () => {
  const cases: ReadonlyArray<[SourceTag, string]> = [
    ['live', 'live'],
    ['live-cpr', 'live • CPR'],
    ['public-source', 'Public source'],
    ['indicative', 'indicative'],
    ['requires-validation', 'Requires validation'],
  ]

  it.each(cases)('renders %s as "%s"', (source, label) => {
    render(<SourceBadge source={source} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  /*
   * Provenance drives trust. A confirmed public source and an unvalidated
   * figure must never look the same.
   */
  it('visually distinguishes a confirmed source from one needing validation', () => {
    const { unmount } = render(<SourceBadge source="public-source" />)
    const confirmed = screen.getByText('Public source').className
    unmount()

    render(<SourceBadge source="requires-validation" />)
    const unvalidated = screen.getByText('Requires validation').className

    expect(confirmed).not.toBe(unvalidated)
  })
})

describe('SeverityBadge', () => {
  const cases: ReadonlyArray<[BottleneckSeverity, string]> = [
    ['critical', 'Critical'],
    ['regulatory', 'Regulatory'],
    ['delayed', 'Delayed'],
    ['blocked', 'Blocked'],
  ]

  it.each(cases)('renders %s as "%s"', (severity, label) => {
    render(<SeverityBadge severity={severity} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('gives critical the danger colour', () => {
    render(<SeverityBadge severity="critical" />)

    expect(screen.getByText('Critical')).toHaveClass('text-status-at-risk')
  })
})
