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
     * Cards are borderless by design. Separation comes from surface contrast
     * (a white card on the grey page) plus a soft shadow, which is what the
     * wireframe shows — a border on top of that reads as heavy.
     */
    it('renders a raised card with no border', () => {
      const { container } = render(<Card />)

      expect(container.firstChild).toHaveClass('bg-surface', 'shadow-card')
      expect(container.firstChild).not.toHaveClass('border')
    })

    it('defaults to the raised variant', () => {
      const { container } = render(<Card />)

      expect(container.firstChild).toHaveClass('shadow-card')
    })

    /*
     * The well is the grey container that groups white cards, as in the
     * Pillar performance and Needs attention sections. It must not carry the
     * shadow, or nested cards look like they float on another card.
     */
    it('renders a well with the sunken surface and no shadow', () => {
      const { container } = render(<Card variant="well" />)

      expect(container.firstChild).toHaveClass('bg-surface-sunken')
      expect(container.firstChild).not.toHaveClass('shadow-card')
    })

    it('renders a plain card with no shadow', () => {
      const { container } = render(<Card variant="plain" />)

      expect(container.firstChild).toHaveClass('bg-surface')
      expect(container.firstChild).not.toHaveClass('shadow-card')
    })

    it('always applies the card radius', () => {
      for (const variant of ['raised', 'well', 'plain'] as const) {
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
