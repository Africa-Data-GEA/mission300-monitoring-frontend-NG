import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ProgramsPage } from '@/features/programs/programs-page'
import { renderWithProviders } from '@/test/render'

describe('ProgramsPage', () => {
  it('renders the portfolio summary card and the programme table', async () => {
    renderWithProviders(<ProgramsPage />, { route: '/programs' })

    expect(await screen.findByRole('heading', { name: 'Programs' })).toBeInTheDocument()
    expect(screen.getByText('Active programmes and projects')).toBeInTheDocument()

    const table = screen.getByRole('table', {
      name: 'Approved programmes in the Mission 300 portfolio',
    })
    expect(within(table).getByText('PRG-2025-001')).toBeInTheDocument()
  })

  it('links through to the full Implementation Register', async () => {
    renderWithProviders(<ProgramsPage />, { route: '/programs' })

    await screen.findByRole('heading', { name: 'Programs' })

    expect(
      screen.getByRole('link', { name: /Open Implementation Register/ }),
    ).toHaveAttribute('href', '/implementation-register')
  })

  it('opens the advanced filters popover with this page\'s own three filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProgramsPage />, { route: '/programs' })

    await screen.findByRole('heading', { name: 'Programs' })
    await user.click(screen.getByRole('button', { name: /Filters/ }))

    const dialog = screen.getByRole('dialog', { name: 'More filters' })
    expect(within(dialog).getByLabelText('Compact pillar')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Institution')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Status')).toBeInTheDocument()
  })
})
