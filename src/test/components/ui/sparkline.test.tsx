import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sparkline } from '@/components/ui/sparkline'

describe('Sparkline', () => {
  it('renders a polyline for a series', () => {
    const { container } = render(<Sparkline points={[1, 5, 3, 8]} />)

    expect(container.querySelector('polyline')).toBeInTheDocument()
  })

  it('plots one coordinate per reading', () => {
    const { container } = render(<Sparkline points={[1, 5, 3, 8]} />)

    const points = container
      .querySelector('polyline')!
      .getAttribute('points')!
      .trim()
      .split(/\s+/)

    expect(points).toHaveLength(4)
  })

  it('spans the full width from first to last reading', () => {
    const { container } = render(
      <Sparkline points={[1, 2, 3]} width={100} height={20} />,
    )

    const points = container.querySelector('polyline')!.getAttribute('points')!
    expect(points).toContain('0.00,')
    expect(points).toContain('100.00,')
  })

  /*
   * A single reading cannot describe a trend, and an empty series would divide
   * by zero when spacing points.
   */
  it('renders nothing for a single reading', () => {
    const { container } = render(<Sparkline points={[5]} />)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders nothing for an empty series', () => {
    const { container } = render(<Sparkline points={[]} />)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  /*
   * A flat series has zero range; without a guard the y coordinate would be
   * NaN and the line would vanish.
   */
  it('centres a flat series instead of dividing by zero', () => {
    const { container } = render(
      <Sparkline points={[5, 5, 5]} width={100} height={20} />,
    )

    const points = container.querySelector('polyline')!.getAttribute('points')!
    expect(points).not.toContain('NaN')
    expect(points).toContain('10.00')
  })

  /*
   * The figure is already stated in text beside the sparkline, and the trend
   * indicator states the direction, so announcing the graphic adds noise.
   */
  it('is hidden from assistive technology', () => {
    const { container } = render(<Sparkline points={[1, 2, 3]} />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('inherits colour from its parent so it can be themed by class', () => {
    const { container } = render(<Sparkline points={[1, 2, 3]} />)

    expect(container.querySelector('polyline')).toHaveAttribute(
      'stroke',
      'currentColor',
    )
  })
})
