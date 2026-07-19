import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoPopover } from '@/components/ui/info-popover'
import type { MetricProvenance } from '@/types/domain'

const provenance: MetricProvenance = {
  definition: 'Share of priority milestones completed by their due date.',
  methodology: 'Completed divided by due, multiplied by 100.',
  source: 'Compact Progress Report.',
  lastUpdated: '2025-10-14T09:12:00Z',
}

function renderPopover() {
  return render(
    <InfoPopover provenance={provenance} label="Compact milestone delivery" />,
  )
}

describe('InfoPopover', () => {
  it('is closed initially', () => {
    renderPopover()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('gives the trigger an accessible name including the metric', () => {
    renderPopover()

    expect(
      screen.getByRole('button', { name: /About Compact milestone delivery/i }),
    ).toBeInTheDocument()
  })

  it('opens on click', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  /*
   * The page specification requires definition, methodology, source AND the
   * last-updated date to be reachable for every metric. All four are asserted
   * so a future trim of the popover fails loudly.
   */
  it('shows all four required provenance fields', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveTextContent('Definition')
    expect(dialog).toHaveTextContent(provenance.definition)
    expect(dialog).toHaveTextContent('Methodology')
    expect(dialog).toHaveTextContent(provenance.methodology)
    expect(dialog).toHaveTextContent('Data source')
    expect(dialog).toHaveTextContent(provenance.source)
    expect(dialog).toHaveTextContent('Last updated')
  })

  it('renders the last-updated date in a human format, not a raw ISO string', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))
    const dialog = await screen.findByRole('dialog')

    expect(dialog).not.toHaveTextContent('2025-10-14T09:12:00Z')
    expect(dialog).toHaveTextContent('2025')
  })

  it('toggles closed when the trigger is clicked again', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <InfoPopover provenance={provenance} label="Metric" />
        <button type="button">Elsewhere</button>
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /About Metric/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays open when clicking inside the panel', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))
    const dialog = await screen.findByRole('dialog')

    await user.click(dialog)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  describe('accessibility', () => {
    it('reflects open state via aria-expanded', async () => {
      const user = userEvent.setup()
      renderPopover()

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('links the trigger to the panel via aria-controls when open', async () => {
      const user = userEvent.setup()
      renderPopover()

      const trigger = screen.getByRole('button')
      expect(trigger).not.toHaveAttribute('aria-controls')

      await user.click(trigger)

      const dialog = await screen.findByRole('dialog')
      expect(trigger).toHaveAttribute('aria-controls', dialog.id)
    })

    it('is reachable and operable by keyboard alone', async () => {
      const user = userEvent.setup()
      renderPopover()

      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })

    it('generates unique ids across multiple instances', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <InfoPopover provenance={provenance} label="First" />
          <InfoPopover provenance={provenance} label="Second" />
        </div>,
      )

      await user.click(screen.getByRole('button', { name: /About First/i }))
      const firstId = (await screen.findByRole('dialog')).id

      await user.keyboard('{Escape}')
      await user.click(screen.getByRole('button', { name: /About Second/i }))
      const secondId = (await screen.findByRole('dialog')).id

      expect(firstId).not.toBe(secondId)
    })
  })
})
