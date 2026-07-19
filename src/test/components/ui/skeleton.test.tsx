import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  /*
   * The surrounding region carries aria-busy and an accessible label, so the
   * individual placeholders must stay silent to avoid announcing noise.
   */
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('animates to signal loading', () => {
    const { container } = render(<Skeleton />)

    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('accepts sizing via className', () => {
    const { container } = render(<Skeleton className="h-48 rounded-card" />)

    expect(container.firstChild).toHaveClass('h-48', 'rounded-card')
  })
})
