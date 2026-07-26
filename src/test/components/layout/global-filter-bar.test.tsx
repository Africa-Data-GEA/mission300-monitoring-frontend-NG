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

  it('shows the four primary filters up front', async () => {
    await renderBar()

    for (const name of [
      /Reporting period/,
      /Compact pillar/,
      /Institution/,
      /Priority/,
    ]) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument()
    }
  })

  /*
   * Geographic scope, DisCo and Technology sit behind a disclosure because the
   * specification notes they only affect metrics supporting those breakdowns.
   */
  it('hides the three secondary filters behind More filters', async () => {
    await renderBar()

    expect(
      screen.queryByRole('combobox', { name: /Geographic scope/ }),
    ).not.toBeInTheDocument()
  })

  it('reveals the secondary filters when More filters is opened', async () => {
    const user = userEvent.setup()
    await renderBar()

    await user.click(screen.getByRole('button', { name: /More filters/ }))

    for (const name of [
      /Geographic scope/,
      /Distribution Company/,
      /Technology/,
    ]) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument()
    }
  })

  it('explains that the secondary filters have limited reach', async () => {
    const user = userEvent.setup()
    await renderBar()

    await user.click(screen.getByRole('button', { name: /More filters/ }))

    expect(
      screen.getByText('These apply only to metrics that support the breakdown.'),
    ).toBeInTheDocument()
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

  describe('custom reporting period', () => {
    it('hides the date-range picker for preset periods', async () => {
      await renderBar()

      expect(
        screen.queryByRole('button', { name: /Custom range/ }),
      ).not.toBeInTheDocument()
    })

    it('reveals the date-range picker for a custom period', async () => {
      await renderBar('/?period=custom')

      expect(
        screen.getByRole('button', { name: /Custom range/ }),
      ).toBeInTheDocument()
    })
  })
})
