import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  FilterBar,
  type FilterValues,
} from '@/features/dashboard/components/filter-bar'
import { executiveOverview } from '@/mocks/data/executive-overview'

const filters = executiveOverview.filters

const DEFAULTS: FilterValues = {
  period: 'q3-2025',
  pillar: 'all',
  institution: 'all',
  priority: 'priority',
  geographicScope: 'national',
  distributionCompany: 'all',
  technology: 'all',
}

function renderBar(overrides: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const onChange = vi.fn()
  const onDateRangeChange = vi.fn()

  render(
    <FilterBar
      filters={filters}
      value={DEFAULTS}
      onChange={onChange}
      dateRange={undefined}
      onDateRangeChange={onDateRangeChange}
      lastUpdated="2025-10-14T09:12:00Z"
      {...overrides}
    />,
  )

  return { onChange, onDateRangeChange }
}

describe('FilterBar', () => {
  it('is exposed as a labelled region', () => {
    renderBar()

    expect(
      screen.getByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()
  })

  describe('the seven specified filters', () => {
    it('shows the four primary filters up front', () => {
      renderBar()

      expect(
        screen.getByRole('combobox', { name: /Reporting period/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /Compact pillar/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /Institution/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /Priority/ }),
      ).toBeInTheDocument()
    })

    /*
     * Geographic scope, DisCo and Technology sit behind a disclosure because
     * the specification notes they only affect metrics supporting those
     * breakdowns.
     */
    it('hides the three secondary filters behind More filters', () => {
      renderBar()

      expect(
        screen.queryByRole('combobox', { name: /Geographic scope/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('combobox', { name: /Distribution Company/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('combobox', { name: /Technology/ }),
      ).not.toBeInTheDocument()
    })

    it('reveals the secondary filters when More filters is opened', async () => {
      const user = userEvent.setup()
      renderBar()

      await user.click(screen.getByRole('button', { name: /More filters/ }))

      expect(
        screen.getByRole('combobox', { name: /Geographic scope/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /Distribution Company/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /Technology/ }),
      ).toBeInTheDocument()
    })

    it('reflects the disclosure state via aria-expanded', async () => {
      const user = userEvent.setup()
      renderBar()

      const toggle = screen.getByRole('button', { name: /More filters/ })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')

      await user.click(toggle)

      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('explains that the secondary filters have limited reach', async () => {
      const user = userEvent.setup()
      renderBar()

      await user.click(screen.getByRole('button', { name: /More filters/ }))

      expect(
        screen.getByText('These apply only to metrics that support the breakdown.'),
      ).toBeInTheDocument()
    })
  })

  describe('emitting changes', () => {
    it('preserves the other six filters when one changes', async () => {
      const user = userEvent.setup()
      const { onChange } = renderBar()

      await user.click(screen.getByRole('combobox', { name: /Compact pillar/ }))
      await user.click(
        await screen.findByRole('option', { name: 'Last-mile access' }),
      )

      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        ...DEFAULTS,
        pillar: 'last-mile-access',
      })
    })

    it('emits a priority change', async () => {
      const user = userEvent.setup()
      const { onChange } = renderBar()

      await user.click(screen.getByRole('combobox', { name: /Priority/ }))
      await user.click(
        await screen.findByRole('option', { name: 'Complete portfolio' }),
      )

      expect(onChange).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ priority: 'all' }),
      )
    })
  })

  describe('custom reporting period', () => {
    it('hides the date-range picker for preset periods', () => {
      renderBar()

      expect(
        screen.queryByRole('button', { name: /Custom range/ }),
      ).not.toBeInTheDocument()
    })

    it('reveals the date-range picker when the custom period is selected', () => {
      renderBar({ value: { ...DEFAULTS, period: 'custom' } })

      expect(
        screen.getByRole('button', { name: /Custom range/ }),
      ).toBeInTheDocument()
    })
  })

  it('renders the last-updated time as a relative label', () => {
    renderBar()

    expect(screen.getByText('Last Updated')).toBeInTheDocument()
    expect(screen.getByText(/Data refreshed/)).toBeInTheDocument()
  })
})
