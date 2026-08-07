import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AdministrationPage } from '@/features/administration/administration-page'
import { renderWithProviders } from '@/test/render'

describe('AdministrationPage', () => {
  it('renders the administration sections as tabs without summary cards', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdministrationPage />, { route: '/administration' })

    expect(
      await screen.findByRole('heading', {
        name: 'User Access & Administration',
      }),
    ).toBeInTheDocument()

    expect(screen.queryByText('Active users')).not.toBeInTheDocument()
    // 5, not 4: Users, Roles & permissions, Access scope, Audit log, and
    // Customization — the last one shows because no session is set up in
    // this test, and "no session" shows every section, same convention as
    // the main Sidebar (see role-access.ts).
    expect(screen.getAllByRole('tab')).toHaveLength(5)
    expect(screen.getByRole('tab', { name: /Users/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByRole('table', {
        name: 'Dashboard user accounts and institutional links',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Roles & permissions/ }))

    expect(
      screen.getByRole('table', {
        name: 'Permissions granted to each system role',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Actions for System Administrator',
      }),
    ).toBeInTheDocument()
  })

  it('uses a row action to move from a role to its assigned users', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdministrationPage />, { route: '/administration' })

    await screen.findByRole('heading', {
      name: 'User Access & Administration',
    })
    await user.click(screen.getByRole('tab', { name: /Roles & permissions/ }))
    await user.click(
      screen.getByRole('button', {
        name: 'Actions for System Administrator',
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'View assigned users' }))

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Users/ })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    expect(await screen.findByText('Grace Etim')).toBeInTheDocument()
  })

  it('opens advanced filters in a dismissible popover', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdministrationPage />, { route: '/administration' })

    await screen.findByRole('heading', {
      name: 'User Access & Administration',
    })
    await user.click(screen.getByRole('button', { name: 'Filters' }))

    expect(
      screen.getByRole('dialog', {
        name: 'More filters',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View results' }))
    expect(
      screen.queryByRole('dialog', {
        name: 'More filters',
      }),
    ).not.toBeInTheDocument()
  })

  it('opens the large invite-user dialog and sends an invitation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdministrationPage />, { route: '/administration' })

    await screen.findByRole('heading', { name: 'User Access & Administration' })
    await user.click(screen.getByRole('button', { name: 'Invite new user' }))

    const dialog = screen.getByRole('dialog', { name: 'Invite new user' })
    expect(dialog).toHaveClass('sm:w-[70vw]')
    expect(document.querySelector('.water-blur-overlay')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Full name'), 'Test Invitee')
    await user.type(within(dialog).getByLabelText('Work email'), 'invitee@example.gov.ng')
    await user.click(within(dialog).getByRole('combobox', { name: 'Institution' }))
    await user.click(screen.getByRole('option', { name: 'EMRC' }))
    await user.type(within(dialog).getByLabelText('Designation'), 'Monitoring Officer')
    await user.click(screen.getByRole('button', { name: 'Send invitation' }))

    expect(await screen.findByRole('heading', { name: 'Invitation sent' })).toBeInTheDocument()
    expect(screen.getByText(/invitee@example.gov.ng/i)).toBeInTheDocument()
  })
})
