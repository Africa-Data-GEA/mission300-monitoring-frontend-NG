import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReportsPage } from '@/features/reports/reports-page'
import { renderWithProviders } from '@/test/render'

describe('ReportsPage', () => {
  it('renders the report builder and saved reports', async () => {
    renderWithProviders(<ReportsPage />)

    expect(await screen.findByRole('heading', { name: 'Reports & Exports' })).toBeInTheDocument()

    // The builder sidebar.
    expect(screen.getByText('Report configuration')).toBeInTheDocument()
    expect(screen.getByText('Page orientation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate & download PDF/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate & download Excel/i })).toBeInTheDocument()

    // The live document preview: cover, then content, then closing page.
    expect(await screen.findByText('End of report', {}, { timeout: 3000 })).toBeInTheDocument()

    const savedReports = screen.getByRole('table', {
      name: 'Saved report configurations and generated-report history',
    })
    expect(within(savedReports).getByText('Compact Progress Report — Q3 2025')).toBeInTheDocument()
  })
})
