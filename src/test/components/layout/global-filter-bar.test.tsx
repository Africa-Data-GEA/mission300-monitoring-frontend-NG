import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GlobalFilterBar } from '@/components/layout/global-filter-bar'
import { renderWithProviders } from '@/test/render'

async function renderBar(route = '/') {
  renderWithProviders(<GlobalFilterBar />, { route })
  // Options are fetched, so wait for the bar to replace its skeleton.
  return screen.findByRole('combobox', { name: /Reporting period/ })
}

describe('GlobalFilterBar', () => {
  it('is exposed as a labelled region', async () => {
    await renderBar()

    expect(
      screen.getByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()
  })

  it('shows only the three executive filters', async () => {
    await renderBar()

    for (const name of [
      /Reporting period/,
      /Compact pillar/,
      /Institution/,
    ]) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument()
    }

    expect(screen.queryByRole('combobox', { name: /Priority/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /More filters/ })).not.toBeInTheDocument()
  })

  /*
   * The removed "Last Updated" block used to live here. Per-metric freshness
   * is still reachable through each information popover, which is where the
   * specification puts it.
   */
  it('does not show a global last-updated stamp', async () => {
    await renderBar()

    expect(screen.queryByText('Last Updated')).not.toBeInTheDocument()
    expect(screen.queryByText(/Data refreshed/)).not.toBeInTheDocument()
  })

  describe('URL-backed selection', () => {
    it('reads the initial selection from the query string', async () => {
      await renderBar('/?pillar=clean-cooking')

      expect(
        screen.getByRole('combobox', { name: /Compact pillar/ }),
      ).toHaveTextContent('Clean cooking')
    })

    it('falls back to defaults when the query string is empty', async () => {
      await renderBar('/')

      expect(
        screen.getByRole('combobox', { name: /Compact pillar/ }),
      ).toHaveTextContent('All pillars')
    })

    it('updates the selection when a filter changes', async () => {
      const user = userEvent.setup()
      await renderBar()

      await user.click(screen.getByRole('combobox', { name: /Compact pillar/ }))
      await user.click(
        await screen.findByRole('option', { name: 'Private sector' }),
      )

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /Compact pillar/ }),
        ).toHaveTextContent('Private sector')
      })
    })

    it('keeps the other filters when one changes', async () => {
      const user = userEvent.setup()
      await renderBar('/?institution=nerc')

      await user.click(screen.getByRole('combobox', { name: /Compact pillar/ }))
      await user.click(
        await screen.findByRole('option', { name: 'Clean cooking' }),
      )

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /Compact pillar/ }),
        ).toHaveTextContent('Clean cooking')
      })
      expect(
        screen.getByRole('combobox', { name: /Institution/ }),
      ).toHaveTextContent('NERC')
    })
  })

})
