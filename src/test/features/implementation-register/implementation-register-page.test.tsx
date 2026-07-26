import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ImplementationRegisterPage } from '@/features/implementation-register/implementation-register-page'
import { renderWithProviders } from '@/test/render'

describe('ImplementationRegisterPage', () => {
  it('renders the headline cards and the programmes table by default', async () => {
    renderWithProviders(<ImplementationRegisterPage />, { route: '/implementation-register' })

    expect(
      await screen.findByRole('heading', { name: 'Implementation Register' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', { name: 'Headline performance cards' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Active programmes and projects')).toBeInTheDocument()

    const table = screen.getByRole('table', {
      name: 'Approved programmes in the Implementation Register',
    })
    expect(table).toBeInTheDocument()
    expect(within(table).getByText('PRG-2025-001')).toBeInTheDocument()
  })

  it('switches to the projects tab and opens a project profile', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ImplementationRegisterPage />, { route: '/implementation-register' })

    await screen.findByRole('heading', { name: 'Implementation Register' })
    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    const table = await screen.findByRole('table', {
      name: "Projects delivering the register's approved programmes",
    })
    const row = within(table).getByText('PRJ-2025-011').closest('tr')
    expect(row).not.toBeNull()

    await user.click(within(row as HTMLElement).getByRole('button', { name: /Profile/ }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Transmission Rehabilitation Programme/)).toBeInTheDocument()
    expect(within(dialog).getByText('Overview')).toBeInTheDocument()
  })

  it('switches to the milestones and actions tabs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ImplementationRegisterPage />, { route: '/implementation-register' })

    await screen.findByRole('heading', { name: 'Implementation Register' })

    await user.click(screen.getByRole('tab', { name: 'Milestones' }))
    expect(
      await screen.findByRole('table', {
        name: 'Expected and actual milestone dates with status, evidence and next action',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Actions' }))
    expect(
      await screen.findByRole('table', {
        name: 'Responsible institution, due date, priority, dependency and evidence for each action',
      }),
    ).toBeInTheDocument()
  })

  it('opens the advanced filters popover with the nine module filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ImplementationRegisterPage />, { route: '/implementation-register' })

    await screen.findByRole('heading', { name: 'Implementation Register' })
    await user.click(screen.getByRole('button', { name: /Filters/ }))

    const dialog = screen.getByRole('dialog', { name: 'More filters' })
    expect(within(dialog).getByLabelText('Record type')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Bottleneck category')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Reporting period')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'View results' }))
    expect(screen.queryByRole('dialog', { name: 'More filters' })).not.toBeInTheDocument()
  })

  describe('importing a register update', () => {
    it('opens the dialog, uploads a file, and shows the validation report', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ImplementationRegisterPage />, { route: '/implementation-register' })

      await screen.findByRole('heading', { name: 'Implementation Register' })
      await user.click(screen.getByRole('button', { name: 'Import register update' }))

      const dialog = screen.getByRole('dialog', { name: 'Import register update' })
      const file = new File(['id,name'], 'register-update.csv', { type: 'text/csv' })
      await user.upload(within(dialog).getByLabelText('Register template'), file)
      await user.click(within(dialog).getByRole('button', { name: 'Upload and validate' }))

      expect(
        await screen.findByRole('heading', { name: 'Validation errors found' }),
      ).toBeInTheDocument()
      expect(screen.getByText(/register-update.csv/)).toBeInTheDocument()
    })
  })
})
