import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StakeholdersPage } from '@/features/stakeholders/stakeholders-page'
import { renderWithProviders } from '@/test/render'

describe('StakeholdersPage', () => {
  it('renders the institution registry and workbook-defined sections', async () => {
    renderWithProviders(<StakeholdersPage />, { route: '/stakeholders' })

    expect(
      await screen.findByRole('heading', { name: 'Stakeholders & Institutions' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Active institutions')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      screen.getByRole('table', { name: 'Official Mission 300 institution registry' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Nigerian Electricity Regulatory Commission')).toBeInTheDocument()
  })

  it('uses an institution row action to focus its data assignments', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StakeholdersPage />, { route: '/stakeholders' })

    await screen.findByRole('heading', { name: 'Stakeholders & Institutions' })
    await user.click(screen.getByRole('button', { name: 'Actions for NERC' }))
    await user.click(screen.getByRole('menuitem', { name: 'View data assignments' }))

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Data custodians/ })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    const assignmentsTable = await screen.findByRole('table', {
        name: 'Dataset and institutional reporting assignments',
      })
    expect(assignmentsTable).toBeInTheDocument()
    expect(within(assignmentsTable).getByText('DisCo performance')).toBeInTheDocument()
  })

  it('keeps search visible and opens advanced filters in a popover', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StakeholdersPage />, { route: '/stakeholders' })

    await screen.findByRole('heading', { name: 'Stakeholders & Institutions' })
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filters' }))

    const filters = screen.getByRole('dialog', { name: 'More filters' })
    expect(within(filters).getByRole('combobox', { name: 'Institution type' })).toBeInTheDocument()
    expect(within(filters).getByRole('combobox', { name: 'Dataset' })).toBeInTheDocument()
  })
})
