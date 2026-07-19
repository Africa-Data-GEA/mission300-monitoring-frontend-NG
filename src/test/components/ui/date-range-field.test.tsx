import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateRangeField } from '@/components/ui/date-range-field'

describe('DateRangeField', () => {
  it('renders the visible label', () => {
    render(
      <DateRangeField label="Custom range" value={undefined} onChange={vi.fn()} />,
    )

    expect(screen.getByText('Custom range')).toBeInTheDocument()
  })

  it('shows the placeholder when no range is selected', () => {
    render(
      <DateRangeField
        label="Custom range"
        value={undefined}
        onChange={vi.fn()}
        placeholder="Select date range"
      />,
    )

    expect(screen.getByRole('button')).toHaveTextContent('Select date range')
  })

  it('shows a single date when only the start is chosen', () => {
    render(
      <DateRangeField
        label="Custom range"
        value={{ from: new Date('2025-07-01T00:00:00Z'), to: undefined }}
        onChange={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('2025')
    expect(trigger).not.toHaveTextContent('—')
  })

  it('shows both dates once a full range is chosen', () => {
    render(
      <DateRangeField
        label="Custom range"
        value={{
          from: new Date('2025-07-01T00:00:00Z'),
          to: new Date('2025-09-30T00:00:00Z'),
        }}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button')).toHaveTextContent('—')
  })

  it('does not render the calendar until opened', () => {
    render(
      <DateRangeField label="Custom range" value={undefined} onChange={vi.fn()} />,
    )

    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('opens the calendar on click', async () => {
    const user = userEvent.setup()
    render(
      <DateRangeField label="Custom range" value={undefined} onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button'))

    expect(await screen.findAllByRole('grid')).not.toHaveLength(0)
  })

  it('emits the chosen date', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateRangeField
        label="Custom range"
        value={{ from: new Date('2025-07-15T00:00:00Z'), to: undefined }}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Custom range/ }))
    await screen.findAllByRole('grid')

    // Day buttons carry a full-date accessible name, so match the visible
    // day number within its grid cell instead.
    const cell = screen
      .getAllByRole('gridcell')
      .find((candidate) => candidate.textContent?.trim() === '18')
    expect(cell).toBeDefined()

    await user.click(within(cell!).getByRole('button'))

    expect(onChange).toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(
      <DateRangeField label="Custom range" value={undefined} onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button'))
    await screen.findAllByRole('grid')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('associates the label with the trigger', () => {
    render(
      <DateRangeField label="Custom range" value={undefined} onChange={vi.fn()} />,
    )

    expect(
      screen.getByRole('button', { name: /Custom range/ }),
    ).toBeInTheDocument()
  })
})
