import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrendIndicator } from '@/components/ui/trend-indicator'

describe('TrendIndicator', () => {
  it('renders the supplied label', () => {
    render(
      <TrendIndicator
        trend={{
          change: 2,
          label: 'target 100% by 2027',
          direction: 'higher-is-better',
        }}
      />,
    )

    expect(screen.getByText('target 100% by 2027')).toBeInTheDocument()
  })

  it('colours an improving higher-is-better metric green', () => {
    const { container } = render(
      <TrendIndicator
        trend={{ change: 2, label: 'up', direction: 'higher-is-better' }}
      />,
    )

    expect(container.firstChild).toHaveClass('text-trend-up')
  })

  it('colours a worsening higher-is-better metric red', () => {
    const { container } = render(
      <TrendIndicator
        trend={{ change: -2, label: 'down', direction: 'higher-is-better' }}
      />,
    )

    expect(container.firstChild).toHaveClass('text-trend-down')
  })

  /*
   * The specification case: falling ATC&C losses are an improvement and must
   * render green even though the arrow points down.
   */
  it('colours a falling lower-is-better metric green', () => {
    const { container } = render(
      <TrendIndicator
        trend={{
          change: -1.4,
          label: 'from 42—47% • lower better',
          direction: 'lower-is-better',
        }}
      />,
    )

    expect(container.firstChild).toHaveClass('text-trend-up')
    expect(container.firstChild).not.toHaveClass('text-trend-down')
  })

  it('colours a rising lower-is-better metric red', () => {
    const { container } = render(
      <TrendIndicator
        trend={{ change: 1.4, label: 'losses up', direction: 'lower-is-better' }}
      />,
    )

    expect(container.firstChild).toHaveClass('text-trend-down')
  })

  /*
   * Flat must be neutral for both directions. Without an explicit isFlat
   * branch, a flat lower-is-better metric would render green — see the
   * corresponding note in resolveTrend's tests.
   */
  it('renders flat movement neutrally for both directions', () => {
    for (const direction of ['higher-is-better', 'lower-is-better'] as const) {
      const { container, unmount } = render(
        <TrendIndicator trend={{ change: 0, label: 'no change', direction }} />,
      )

      expect(container.firstChild).toHaveClass('text-status-no-data')
      expect(container.firstChild).not.toHaveClass('text-trend-up')
      unmount()
    }
  })

  describe('accessibility', () => {
    /*
     * Colour alone must not carry meaning. Screen-reader users get the same
     * information from a visually hidden word.
     */
    it('states improvement in words, not only colour', () => {
      render(
        <TrendIndicator
          trend={{ change: 2, label: 'up', direction: 'higher-is-better' }}
        />,
      )

      expect(screen.getByText('Improving:')).toBeInTheDocument()
    })

    it('states worsening in words', () => {
      render(
        <TrendIndicator
          trend={{ change: -2, label: 'down', direction: 'higher-is-better' }}
        />,
      )

      expect(screen.getByText('Worsening:')).toBeInTheDocument()
    })

    it('states no change in words', () => {
      render(
        <TrendIndicator
          trend={{ change: 0, label: 'flat', direction: 'higher-is-better' }}
        />,
      )

      expect(screen.getByText('No change')).toBeInTheDocument()
    })

    it('hides the decorative arrow from assistive technology', () => {
      const { container } = render(
        <TrendIndicator
          trend={{ change: 2, label: 'up', direction: 'higher-is-better' }}
        />,
      )

      expect(container.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
    })
  })
})
