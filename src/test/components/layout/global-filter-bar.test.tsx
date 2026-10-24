import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GlobalFilterBar } from '@/components/layout/global-filter-bar'
import { renderWithProviders } from '@/test/render'

async function renderBar(route = '/') {
  renderWithProviders(<GlobalFilterBar />, { route })
  // Options are fetched, so wait for the bar to replace its skeleton.
  return screen.findByRole('combobox', { name: /^Year/ })
}

/** Pillar/institution/technology/priority/DisCo now live behind the "More
 * filters" popover rather than as always-visible selects. */
async function openMoreFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /More filters/ }))
}

describe('GlobalFilterBar', () => {
  it('is exposed as a labelled region', async () => {
    await renderBar()

    expect(
      screen.getByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()
  })

  it('shows every filter the backend can actually apply', async () => {
    const user = userEvent.setup()
    await renderBar()

    for (const name of [/^Year/, /^Quarter/]) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument()
    }

    await openMoreFilters(user)

    for (const name of [/Compact pillar/, /Institution/, /Technology/, /Priority/, /Distribution Company/]) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument()
    }

    // geographicScope has no control - it's an aggregation-level toggle,
    // not a narrowing filter (see GlobalFilterBar's own comment).
    expect(screen.queryByRole('combobox', { name: /Geographic/ })).not.toBeInTheDocument()
  })

  it('does not offer a pillar choice on a pillar page, where the page already is the pillar', async () => {
    const user = userEvent.setup()
    await renderBar('/pillars/generation-network')

    await openMoreFilters(user)

    expect(screen.getByRole('combobox', { name: /Institution/ })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /Compact pillar/ })).not.toBeInTheDocument()
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
      const user = userEvent.setup()
      await renderBar('/?pillar=clean-cooking')
      await openMoreFilters(user)

      expect(
        screen.getByRole('combobox', { name: /Compact pillar/ }),
      ).toHaveTextContent('Clean cooking')
    })

    it('falls back to defaults when the query string is empty', async () => {
      const user = userEvent.setup()
      await renderBar('/')
      await openMoreFilters(user)

      expect(
        screen.getByRole('combobox', { name: /Compact pillar/ }),
      ).toHaveTextContent('All pillars')
    })

    it('updates the selection when a filter changes', async () => {
      const user = userEvent.setup()
      await renderBar()
      await openMoreFilters(user)

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
      await openMoreFilters(user)

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

  describe('More filters popover', () => {
    it('shows a count badge only once a secondary filter is non-default', async () => {
      await renderBar('/?pillar=clean-cooking')

      expect(screen.getByRole('button', { name: /More filters/ })).toHaveTextContent('1')
    })

    it('clears only the secondary filters, leaving the reporting period alone', async () => {
      const user = userEvent.setup()
      await renderBar('/?period=q2-2025&pillar=clean-cooking')
      await openMoreFilters(user)

      await user.click(screen.getByRole('button', { name: 'Clear' }))

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /Compact pillar/ })).toHaveTextContent('All pillars')
      })
      expect(screen.getByRole('combobox', { name: /^Quarter/ })).toHaveTextContent('Q2')
    })
  })

  describe('year/quarter tie', () => {
    it('shows only the quarters that exist for the selected year', async () => {
      await renderBar('/?period=q2-2025')

      expect(screen.getByRole('combobox', { name: /^Year/ })).toHaveTextContent('2025')
      expect(screen.getByRole('combobox', { name: /^Quarter/ })).toHaveTextContent('Q2')
    })

    it('rebuilds the period value when the quarter changes, keeping the year', async () => {
      const user = userEvent.setup()
      await renderBar('/?period=q2-2025')

      await user.click(screen.getByRole('combobox', { name: /^Quarter/ }))
      await user.click(await screen.findByRole('option', { name: 'Q1' }))

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /^Quarter/ })).toHaveTextContent('Q1')
      })
      expect(screen.getByRole('combobox', { name: /^Year/ })).toHaveTextContent('2025')
    })

    it('choosing "Custom range…" from the quarter dropdown reveals the date picker', async () => {
      const user = userEvent.setup()
      await renderBar('/?period=q2-2025')

      await user.click(screen.getByRole('combobox', { name: /^Quarter/ }))
      await user.click(await screen.findByRole('option', { name: 'Custom range…' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Custom range/ })).toBeInTheDocument()
      })
      expect(screen.getByRole('combobox', { name: /^Year/ })).toBeDisabled()
    })
  })

})
