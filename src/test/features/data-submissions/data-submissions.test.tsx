import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ObligationsPage } from '@/features/data-submissions/pages/obligations-page'
import { ValidationQueuePage } from '@/features/data-submissions/pages/validation-queue-page'
import { renderWithProviders } from '@/test/render'

describe('Data submission workflows', () => {
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

    expect(await screen.findByText('SUB-2026-0021')).toBeInTheDocument()
    expect(screen.getByText('Awaiting review for 2 days')).toBeInTheDocument()
    expect(screen.getByText('0 issues')).toBeInTheDocument()
  })
})
