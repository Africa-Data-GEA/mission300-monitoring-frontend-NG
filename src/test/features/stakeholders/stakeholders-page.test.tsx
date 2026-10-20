import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { StakeholdersPage } from '@/features/stakeholders/stakeholders-page'
import { clearAuthSession, saveAuthSession } from '@/features/auth/auth-session'
import { renderWithProviders } from '@/test/render'

describe('StakeholdersPage', () => {
  afterEach(() => clearAuthSession())

  it('renders the institution registry and workbook-defined sections', async () => {
    renderWithProviders(<StakeholdersPage />, { route: '/stakeholders' })

    expect(
      await screen.findByRole('heading', { name: 'Stakeholders & Institutions' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Active institutions')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(
      screen.getByRole('table', { name: 'Official Mission 300 institution registry' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Nigerian Electricity Regulatory Commission')).toBeInTheDocument()
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

  it('lets an administrator add an institution', async () => {
    saveAuthSession({
      accessToken: 'test-token',
      user: {
        id: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'system-administrator',
        roles: ['system-administrator'],
      },
    })
    const user = userEvent.setup()
    renderWithProviders(<StakeholdersPage />, { route: '/stakeholders' })

    await screen.findByRole('heading', { name: 'Stakeholders & Institutions' })
    await user.click(screen.getByRole('button', { name: 'Add stakeholder institution' }))
    const dialog = screen.getByRole('dialog', { name: 'Add institution' })
    await user.type(within(dialog).getByLabelText('Institution name'), 'New Energy Agency')
    expect(within(dialog).getByRole('button', { name: 'Save institution' })).toBeDisabled()
    await user.click(within(dialog).getByRole('combobox', { name: 'Institution type' }))
    await user.click(await screen.findByRole('option', { name: 'Federal Agency' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save institution' }))

    expect(await screen.findByText('New Energy Agency')).toBeInTheDocument()
  })
})
