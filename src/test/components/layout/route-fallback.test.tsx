import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RouteFallback } from '@/components/layout/route-fallback'

describe('RouteFallback', () => {
  it('shows a loading state immediately while the route chunk loads', () => {
    render(<RouteFallback />)

    expect(screen.getByLabelText('Loading page')).toBeInTheDocument()
    expect(screen.getByText('Loading page…')).toBeVisible()
  })
})
