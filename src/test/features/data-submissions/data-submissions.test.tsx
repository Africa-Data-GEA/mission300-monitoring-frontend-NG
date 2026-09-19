import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ObligationsPage } from '@/features/data-submissions/pages/obligations-page'
import { ValidationQueuePage } from '@/features/data-submissions/pages/validation-queue-page'
import { saveAuthSession } from '@/features/auth/auth-session'
import { renderWithProviders } from '@/test/render'

describe('Data submission workflows', () => {
  // ObligationActions hides Enter data/Upload for anyone without the
  // institutional-data-provider role (a reviewer/validator sharing this
  // table would otherwise see a button that only leads to access-denied) -
  // with no session at all, both are hidden.
  beforeEach(() => {
    saveAuthSession({
      accessToken: 'mock-token-usr-001',
      user: {
        id: 'usr-001',
        name: 'Adebayo Ogunlesi',
        email: 'a.ogunlesi@power.gov.ng',
        role: 'institutional-data-provider',
      },
    })
  })
  afterEach(() => sessionStorage.clear())

  it('presents assigned obligations with separate entry methods', async () => {
    renderWithProviders(<ObligationsPage />, {
      route: '/data-submissions/obligations',
    })

    expect((await screen.findAllByText('Metering performance')).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /enter data/i })[0]).toHaveAttribute(
      'href',
      '/data-submissions/obligations/obl-001/entry',
    )
    expect(screen.getAllByRole('link', { name: /upload/i })[0]).toHaveAttribute(
      'href',
      '/data-submissions/obligations/obl-001/upload',
    )
  })

  it('renders server-owned checks and queue metadata', async () => {
    renderWithProviders(<ValidationQueuePage />, {
      route: '/data-submissions/validation',
    })

    // The submission code is deliberately absent from the queue — the row is
    // identified by dataset, institution and period; the code is on the
    // submission's own review page.
    expect(await screen.findByText('Metering performance')).toBeInTheDocument()
    expect(screen.queryByText('SUB-2026-0021')).not.toBeInTheDocument()
    expect(screen.getByText('Awaiting review for 2 days')).toBeInTheDocument()
    // Several queued submissions are clean, so the issue count is scoped to
    // the row under test rather than matched across the whole table.
    const row = screen.getByText('Metering performance').closest('tr')
    expect(row).not.toBeNull()
    expect(within(row!).getByText('0 issues')).toBeInTheDocument()
  })
})
