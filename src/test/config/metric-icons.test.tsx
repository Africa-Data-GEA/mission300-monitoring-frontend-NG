import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { METRIC_ICONS, MetricIcon } from '@/config/metric-icons'
import type { MetricIconName } from '@/types/domain'

const ALL_NAMES: readonly MetricIconName[] = [
  'access',
  'metering',
  'losses',
  'capital',
  'generation',
  'cooking',
  'milestones',
  'pillars',
  'kpis',
  'escalations',
  'institutions',
  'generic',
]

describe('METRIC_ICONS', () => {
  it('maps every icon name in the domain vocabulary', () => {
    for (const name of ALL_NAMES) {
      expect(METRIC_ICONS[name], name).toBeDefined()
    }
  })

  /*
   * Distinct metrics must not share an icon, or the icon stops carrying
   * meaning — which is the whole reason these are semantic rather than one
   * generic glyph everywhere.
   */
  it('gives each metric a distinct icon', () => {
    const icons = ALL_NAMES.map((name) => METRIC_ICONS[name])

    expect(new Set(icons).size).toBe(ALL_NAMES.length)
  })
})

describe('MetricIcon', () => {
  it.each(ALL_NAMES)('renders an icon for %s', (name) => {
    const { container } = render(<MetricIcon name={name} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies the supplied className', () => {
    const { container } = render(
      <MetricIcon name="access" className="size-4 text-brand-600" />,
    )

    expect(container.querySelector('svg')).toHaveClass('size-4', 'text-brand-600')
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<MetricIcon name="access" />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  describe('fallback behaviour', () => {
    /*
     * A backend sending a new icon name must degrade to a neutral icon rather
     * than rendering a blank space where a card icon should be.
     */
    it('falls back to the generic icon for an undefined name', () => {
      const { container } = render(<MetricIcon name={undefined} />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('falls back to the generic icon for an unknown name', () => {
      const { container } = render(
        <MetricIcon name={'not-a-real-icon' as MetricIconName} />,
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})
