import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ProgramsPage } from '@/features/programs/programs-page'
import { ProgrammeDetailPage } from '@/features/programs/programme-detail-page'
import { renderRoutesWithProviders, renderWithProviders } from '@/test/render'

describe('ProgramsPage', () => {
  it('renders the headline cards and the programme table', async () => {
    renderWithProviders(<ProgramsPage />, { route: '/programs' })

    expect(
      await screen.findByRole('heading', { name: 'Programs' }, { timeout: 3000 }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', { name: 'Headline performance cards' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Active programmes and projects')).toBeInTheDocument()

    const table = screen.getByRole('table', {
      name: 'Approved programmes in the Mission 300 portfolio',
    })
    expect(within(table).getByText('PRG-2025-001')).toBeInTheDocument()
  })

  it('navigates to a programme detail page when a programme is clicked', async () => {
    const user = userEvent.setup()
    renderRoutesWithProviders(
      [
        { path: 'programs', element: <ProgramsPage /> },
        { path: 'programs/:programmeId', element: <ProgrammeDetailPage /> },
      ],
      { route: '/programs' },
    )

    await screen.findByRole('heading', { name: 'Programs' }, { timeout: 3000 })
    await user.click(screen.getByRole('button', { name: 'Transmission Rehabilitation Programme' }))

    expect(
      await screen.findByRole('heading', { name: 'Transmission Rehabilitation Programme' }),
    ).toBeInTheDocument()
  })

  it("opens the advanced filters popover with this page's own three filters", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProgramsPage />, { route: '/programs' })

    await screen.findByRole('heading', { name: 'Programs' }, { timeout: 3000 })
    await user.click(screen.getByRole('button', { name: /Filters/ }))

    const dialog = screen.getByRole('dialog', { name: 'More filters' })
    expect(within(dialog).getByLabelText('Compact pillar')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Institution')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Status')).toBeInTheDocument()
  })
})
