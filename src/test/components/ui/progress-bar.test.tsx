import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '@/components/ui/progress-bar'

describe('ProgressBar', () => {
  it('exposes itself as a progressbar to assistive technology', () => {
    render(<ProgressBar value={15} label="Compact milestone delivery" />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('uses the supplied label as its accessible name', () => {
    render(<ProgressBar value={15} label="Compact milestone delivery" />)

    expect(
      screen.getByRole('progressbar', { name: 'Compact milestone delivery' }),
    ).toBeInTheDocument()
  })

  it('reports the current value and bounds', () => {
    render(<ProgressBar value={15} label="Delivery" />)

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '15')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('sets the fill width to the percentage', () => {
    render(<ProgressBar value={42} label="Delivery" />)

    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
      width: '42%',
    })
  })

  describe('out-of-range values', () => {
    /*
     * Real reporting data overshoots targets and occasionally arrives
     * negative. Neither should produce a bar that renders outside its track.
     */
    it('clamps values above 100', () => {
      render(<ProgressBar value={140} label="Delivery" />)

      const bar = screen.getByRole('progressbar')
      expect(bar).toHaveAttribute('aria-valuenow', '100')
      expect(bar.firstChild).toHaveStyle({ width: '100%' })
    })

    it('clamps negative values to zero', () => {
      render(<ProgressBar value={-20} label="Delivery" />)

      const bar = screen.getByRole('progressbar')
      expect(bar).toHaveAttribute('aria-valuenow', '0')
      expect(bar.firstChild).toHaveStyle({ width: '0%' })
    })

    it('renders zero as an empty but present bar', () => {
      render(<ProgressBar value={0} label="Private capital mobilized" />)

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '0',
      )
    })

    it('renders a complete bar at 100', () => {
      render(<ProgressBar value={100} label="Delivery" />)

      expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
        width: '100%',
      })
    })
  })

  it('accepts className overrides on the track and the fill', () => {
    render(
      <ProgressBar
        value={50}
        label="Delivery"
        className="mt-4"
        barClassName="bg-status-at-risk"
      />,
    )

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveClass('mt-4')
    expect(bar.firstChild).toHaveClass('bg-status-at-risk')
  })
})
