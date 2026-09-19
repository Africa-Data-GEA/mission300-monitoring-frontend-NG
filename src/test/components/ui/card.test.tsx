import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>content</Card>)

    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('forwards arbitrary div props', () => {
    render(<Card data-testid="panel" aria-label="Panel" />)

    expect(screen.getByTestId('panel')).toHaveAttribute('aria-label', 'Panel')
  })

  describe('variants', () => {
    /*
     * The default variant carries a very light slate border so a card reads
     * as its own surface even against another light background (on top of
     * the existing surface-contrast separation) - see Card's own doc
     * comment. It still carries no shadow: separation is border + surface
     * contrast, not elevation.
     */
    it('renders a default card with a light border and no shadow', () => {
      const { container } = render(<Card />)

      expect(container.firstChild).toHaveClass('bg-surface', 'border', 'border-border-default')
      expect(container.firstChild).not.toHaveClass('shadow-card')
    })

    /*
     * The well is the grey container that groups white cards, as in the
     * Access delivery, National performance and Delivery status sections.
     */
    it('renders a well on the sunken surface', () => {
      const { container } = render(<Card variant="well" />)

      expect(container.firstChild).toHaveClass('bg-surface-sunken')
      expect(container.firstChild).not.toHaveClass('bg-surface')
    })

    it('always applies the card radius', () => {
      for (const variant of ['default', 'well'] as const) {
        const { container, unmount } = render(<Card variant={variant} />)
        expect(container.firstChild).toHaveClass('rounded-card')
        unmount()
      }
    })
  })

  it('lets callers override conflicting utilities', () => {
    const { container } = render(<Card className="bg-surface-sunken" />)

    expect(container.firstChild).toHaveClass('bg-surface-sunken')
    expect(container.firstChild).not.toHaveClass('bg-surface')
  })
})

describe('CardTitle', () => {
  it('renders as a level-2 heading so page structure stays navigable', () => {
    render(<CardTitle>Pillar performance</CardTitle>)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Pillar performance' }),
    ).toBeInTheDocument()
  })
})

describe('CardDescription', () => {
  it('renders muted supporting text', () => {
    render(<CardDescription>Priority bottlenecks</CardDescription>)

    expect(screen.getByText('Priority bottlenecks')).toHaveClass(
      'text-text-muted',
    )
  })
})

describe('CardHeader and CardContent', () => {
  it('compose together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    )

    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
