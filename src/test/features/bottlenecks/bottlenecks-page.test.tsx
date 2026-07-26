import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BottlenecksPage } from '@/features/bottlenecks/bottlenecks-page'
import { renderWithProviders } from '@/test/render'

describe('BottlenecksPage', () => {
  it('renders the headline alerts and the register table', async () => {
    renderWithProviders(<BottlenecksPage />, { route: '/bottlenecks' })

    expect(
      await screen.findByRole('heading', { name: 'Bottlenecks & Exceptions' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', { name: 'Headline exception alerts' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Open high or critical bottlenecks')).toBeInTheDocument()

    const register = screen.getByRole('table', {
      name: 'Structured record of delivery constraints and exceptions',
    })
    expect(register).toBeInTheDocument()
    // Scoped to the register: the same identifier also appears in the
    // escalation tracker's "linked bottleneck" reference for ESC-2025-004.
    expect(within(register).getByText('BTN-2025-004')).toBeInTheDocument()
  })

  it('renders the category, lifecycle, agency and escalation sections', async () => {
    renderWithProviders(<BottlenecksPage />, { route: '/bottlenecks' })

    await screen.findByRole('heading', { name: 'Bottlenecks & Exceptions' })

    expect(
      screen.getByRole('heading', { name: 'Bottlenecks by category' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Bottlenecks by lifecycle stage' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Open bottlenecks by responsible institution',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('table', {
        name: 'Issues escalated for management or leadership action',
      }),
    ).toBeInTheDocument()
  })

  it('opens the advanced filters popover with the nine module filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BottlenecksPage />, { route: '/bottlenecks' })

    await screen.findByRole('heading', { name: 'Bottlenecks & Exceptions' })
    await user.click(screen.getByRole('button', { name: /Filters/ }))

    const dialog = screen.getByRole('dialog', { name: 'More filters' })
    expect(within(dialog).getByLabelText('Severity')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Escalation status')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Reporting period')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'View results' }))
    expect(screen.queryByRole('dialog', { name: 'More filters' })).not.toBeInTheDocument()
  })

  describe('raising a bottleneck', () => {
    it('opens the dialog, submits, and shows a success message', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BottlenecksPage />, { route: '/bottlenecks' })

      await screen.findByRole('heading', { name: 'Bottlenecks & Exceptions' })
      await user.click(screen.getByRole('button', { name: 'Raise a bottleneck' }))

      const dialog = screen.getByRole('dialog', { name: 'Raise a bottleneck' })

      await user.type(
        within(dialog).getByLabelText('Issue'),
        'Substation upgrade delayed by customs clearance',
      )
      await user.click(
        within(dialog).getByRole('combobox', { name: 'Responsible institution' }),
      )
      await user.click(screen.getByRole('option', { name: 'NERC' }))
      await user.click(within(dialog).getByRole('button', { name: 'Raise bottleneck' }))

      expect(
        await screen.findByRole('heading', { name: 'Bottleneck raised' }),
      ).toBeInTheDocument()
    })

    it('rejects an issue description that is too short', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BottlenecksPage />, { route: '/bottlenecks' })

      await screen.findByRole('heading', { name: 'Bottlenecks & Exceptions' })
      await user.click(screen.getByRole('button', { name: 'Raise a bottleneck' }))

      const dialog = screen.getByRole('dialog', { name: 'Raise a bottleneck' })
      await user.type(within(dialog).getByLabelText('Issue'), 'bad')
      await user.click(within(dialog).getByRole('button', { name: 'Raise bottleneck' }))

      expect(
        await within(dialog).findByText('Describe the issue in a few words'),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: 'Bottleneck raised' }),
      ).not.toBeInTheDocument()
    })
  })
})
