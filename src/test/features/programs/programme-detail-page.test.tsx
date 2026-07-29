import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ProgrammeDetailPage } from '@/features/programs/programme-detail-page'
import { ProjectDetailPage } from '@/features/programs/project-detail-page'
import { renderRoutesWithProviders, renderWithProviders } from '@/test/render'

describe('ProgrammeDetailPage', () => {
  it('renders the programme header and its projects', async () => {
    renderWithProviders(<ProgrammeDetailPage />, { route: '/programs/PRG-2025-001' })

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Transmission Rehabilitation Programme' },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Rehabilitate ageing transmission infrastructure/)).toBeInTheDocument()

    const table = screen.getByRole('table', { name: 'Projects delivering this programme' })
    expect(within(table).getByText('North East 330kV Line Upgrade')).toBeInTheDocument()
    expect(within(table).getByText('PRJ-2025-011')).toBeInTheDocument()
  })

  it("navigates to a project's detail page when a project is clicked", async () => {
    const user = userEvent.setup()
    renderRoutesWithProviders(
      [
        { path: 'programs/:programmeId', element: <ProgrammeDetailPage /> },
        { path: 'programs/projects/:projectId', element: <ProjectDetailPage /> },
      ],
      { route: '/programs/PRG-2025-001' },
    )

    await screen.findByRole(
      'heading',
      { name: 'Transmission Rehabilitation Programme' },
      { timeout: 3000 },
    )
    await user.click(screen.getByRole('button', { name: 'North East 330kV Line Upgrade' }))

    expect(
      await screen.findByRole('heading', { name: 'North East 330kV Line Upgrade' }, { timeout: 3000 }),
    ).toBeInTheDocument()
  })
})
