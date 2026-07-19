import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConfidenceDot } from '@/components/ui/confidence-dot'
import type { DataConfidence } from '@/types/domain'

describe('ConfidenceDot', () => {
  const cases: ReadonlyArray<[DataConfidence, string]> = [
    ['confirmed', 'bg-confidence-confirmed'],
    ['requires-validation', 'bg-confidence-validation'],
    ['future-gap', 'bg-confidence-gap'],
  ]

  it.each(cases)('colours %s with %s', (confidence, expectedClass) => {
    const { container } = render(<ConfidenceDot confidence={confidence} />)

    expect(container.firstChild).toHaveClass(expectedClass)
  })

  /*
   * The dot is purely a colour key; the adjacent text label carries the
   * meaning. Announcing it would produce noise for screen-reader users.
   */
  it('is hidden from assistive technology', () => {
    const { container } = render(<ConfidenceDot confidence="confirmed" />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('gives each confidence level a distinct colour', () => {
    const classes = cases.map(([confidence]) => {
      const { container, unmount } = render(
        <ConfidenceDot confidence={confidence} />,
      )
      const className = (container.firstChild as HTMLElement).className
      unmount()
      return className
    })

    expect(new Set(classes).size).toBe(classes.length)
  })

  it('accepts a className override', () => {
    const { container } = render(
      <ConfidenceDot confidence="confirmed" className="size-4" />,
    )

    expect(container.firstChild).toHaveClass('size-4')
  })
})
