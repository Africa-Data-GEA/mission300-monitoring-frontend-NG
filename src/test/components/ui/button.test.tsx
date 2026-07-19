import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Try again</Button>)

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('calls onClick when activated', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)

    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    )

    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('is operable by keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  describe('variants', () => {
    it('uses the brand colour for primary', () => {
      render(<Button variant="primary">Go</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-brand-700')
    })

    it('uses a bordered surface for secondary', () => {
      render(<Button variant="secondary">Go</Button>)

      expect(screen.getByRole('button')).toHaveClass('border', 'bg-surface')
    })

    it('uses the danger token for danger', () => {
      render(<Button variant="danger">Delete</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-status-at-risk')
    })

    it('defaults to primary when no variant is given', () => {
      render(<Button>Go</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-brand-700')
    })
  })

  describe('sizes', () => {
    it.each([
      ['sm', 'h-8'],
      ['md', 'h-9'],
      ['lg', 'h-10'],
      ['icon', 'size-9'],
    ] as const)('applies the %s size', (size, expectedClass) => {
      render(<Button size={size}>Go</Button>)

      expect(screen.getByRole('button')).toHaveClass(expectedClass)
    })
  })

  /*
   * asChild lets a link be styled as a button without nesting an <a> inside a
   * <button>, which would be invalid HTML and unusable by keyboard.
   */
  it('renders as the child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/reports">Reports</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Reports' })
    expect(link).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(link).toHaveClass('bg-brand-700')
  })

  it('lets callers override conflicting utilities', () => {
    render(<Button className="bg-surface-sunken">Go</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-surface-sunken')
    expect(button).not.toHaveClass('bg-brand-700')
  })
})
