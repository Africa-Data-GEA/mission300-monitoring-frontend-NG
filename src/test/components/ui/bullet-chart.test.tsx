import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BulletChart } from '@/components/ui/bullet-chart'

const base = {
  current: 55,
  baseline: 44,
  expected: 68,
  target: 100,
  scaleMin: 0,
  scaleMax: 100,
  direction: 'higher-is-better' as const,
  label: 'National metering rate',
  valueLabel: '55%',
}

describe('BulletChart', () => {
  it('renders as an image with an accessible description', () => {
    render(<BulletChart {...base} />)

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  /*
   * The bar conveys nothing to a screen reader, so every plotted value has to
   * be stated in words.
   */
  it('states current, baseline, expected and target in the description', () => {
    render(<BulletChart {...base} />)

    const label = screen.getByRole('img').getAttribute('aria-label')
    expect(label).toContain('National metering rate: 55%')
    expect(label).toContain('baseline 44')
    expect(label).toContain('expected 68')
    expect(label).toContain('target 100')
  })

  describe('positioning', () => {
    it('scales the current bar to its position on the metric scale', () => {
      render(<BulletChart {...base} current={55} />)

      expect(screen.getByTestId('bullet-current')).toHaveStyle({ width: '55%' })
    })

    it('respects a scale that does not start at zero', () => {
      render(
        <BulletChart {...base} scaleMin={20} scaleMax={70} current={45} />,
      )

      // (45 − 20) / (70 − 20) = 50%
      expect(screen.getByTestId('bullet-current')).toHaveStyle({ width: '50%' })
    })

    it('places the baseline marker on the same scale', () => {
      render(<BulletChart {...base} baseline={44} />)

      expect(screen.getByTestId('bullet-baseline')).toHaveStyle({ left: '44%' })
    })

    it('clamps a value above the scale maximum', () => {
      render(<BulletChart {...base} current={140} />)

      expect(screen.getByTestId('bullet-current')).toHaveStyle({ width: '100%' })
    })

    it('clamps a value below the scale minimum', () => {
      render(<BulletChart {...base} current={-10} />)

      expect(screen.getByTestId('bullet-current')).toHaveStyle({ width: '0%' })
    })

    it('does not divide by zero on a degenerate scale', () => {
      render(<BulletChart {...base} scaleMin={5} scaleMax={5} current={5} />)

      expect(screen.getByTestId('bullet-current')).toHaveStyle({ width: '0%' })
    })
  })

  describe('optional markers', () => {
    /*
     * Several Compact metrics have no approved target and the specification
     * forbids inventing one, so the marker must simply be absent.
     */
    it('omits the target marker when no target is approved', () => {
      render(<BulletChart {...base} target={null} />)

      expect(screen.queryByTestId('bullet-target')).not.toBeInTheDocument()
    })

    it('omits the expected marker when no trajectory exists', () => {
      render(<BulletChart {...base} expected={null} />)

      expect(screen.queryByTestId('bullet-expected')).not.toBeInTheDocument()
    })

    it('leaves the target out of the description when absent', () => {
      render(<BulletChart {...base} target={null} />)

      expect(screen.getByRole('img').getAttribute('aria-label')).not.toContain(
        'target',
      )
    })

    it('still renders the baseline when both optional markers are absent', () => {
      render(<BulletChart {...base} expected={null} target={null} />)

      expect(screen.getByTestId('bullet-baseline')).toBeInTheDocument()
    })
  })

  describe('progress against the approved trajectory', () => {
    it('flags a higher-is-better metric below its expected value as behind', () => {
      render(<BulletChart {...base} current={55} expected={68} />)

      expect(screen.getByTestId('bullet-current')).toHaveClass(
        'bg-status-lagging',
      )
      expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
        'behind the approved trajectory',
      )
    })

    it('treats a higher-is-better metric at or above expected as on track', () => {
      render(<BulletChart {...base} current={70} expected={68} />)

      expect(screen.getByTestId('bullet-current')).toHaveClass('bg-brand-600')
    })

    /*
     * The comparison flips for lower-is-better metrics: ATC&C losses BELOW the
     * expected value are ahead of trajectory, not behind it.
     */
    it('treats a lower-is-better metric below expected as ahead', () => {
      render(
        <BulletChart
          {...base}
          direction="lower-is-better"
          current={29}
          expected={31}
        />,
      )

      expect(screen.getByTestId('bullet-current')).toHaveClass('bg-brand-600')
      expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
        'at or ahead of the approved trajectory',
      )
    })

    it('flags a lower-is-better metric above expected as behind', () => {
      render(
        <BulletChart
          {...base}
          direction="lower-is-better"
          current={33.3}
          expected={31}
        />,
      )

      expect(screen.getByTestId('bullet-current')).toHaveClass(
        'bg-status-lagging',
      )
    })

    it('makes no trajectory judgement when expected is absent', () => {
      render(<BulletChart {...base} expected={null} />)

      const label = screen.getByRole('img').getAttribute('aria-label')
      expect(label).not.toContain('behind')
      expect(label).not.toContain('ahead')
      expect(screen.getByTestId('bullet-current')).toHaveClass('bg-brand-600')
    })
  })
})
