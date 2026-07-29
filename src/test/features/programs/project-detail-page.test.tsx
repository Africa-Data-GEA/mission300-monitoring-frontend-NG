import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ProjectDetailPage } from '@/features/programs/project-detail-page'
import { renderRoutesWithProviders } from '@/test/render'

describe('ProjectDetailPage', () => {
  it('renders the project overview, milestones and linked bottlenecks', async () => {
    renderRoutesWithProviders(
      [{ path: 'programs/projects/:projectId', element: <ProjectDetailPage /> }],
      { route: '/programs/projects/PRJ-2025-011' },
    )

    expect(
      await screen.findByRole('heading', { name: 'North East 330kV Line Upgrade' }, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Upgrade of the 330kV North East evacuation line/),
    ).toBeInTheDocument()

    const milestones = screen.getByRole('table', { name: 'Milestones for this project' })
    expect(within(milestones).getByText('MST-2025-101')).toBeInTheDocument()

    const bottlenecks = screen.getByRole('table', {
      name: 'Structured record of delivery constraints and exceptions',
    })
    expect(within(bottlenecks).getByText('BTN-2025-022')).toBeInTheDocument()
  })

  describe('raising a bottleneck scoped to this project', () => {
    it('prefills the linked record with this project and shows a success message', async () => {
      const user = userEvent.setup()
      renderRoutesWithProviders(
        [{ path: 'programs/projects/:projectId', element: <ProjectDetailPage /> }],
        { route: '/programs/projects/PRJ-2025-011' },
      )

      await screen.findByRole('heading', { name: 'North East 330kV Line Upgrade' }, { timeout: 3000 })
      await user.click(screen.getByRole('button', { name: 'Raise a bottleneck' }))

      const dialog = screen.getByRole('dialog', { name: 'Raise a bottleneck' })
      expect(within(dialog).getByDisplayValue('PRJ-2025-011')).toBeInTheDocument()

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
  })
})
