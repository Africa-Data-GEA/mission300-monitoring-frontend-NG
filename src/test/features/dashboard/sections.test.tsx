import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AccessDeliverySection } from '@/features/dashboard/components/access-delivery-section'
import { DeliveryStatusSection } from '@/features/dashboard/components/delivery-status-section'
import { HeadlineCards } from '@/features/dashboard/components/headline-cards/headline-cards'
import { NationalPerformanceSection } from '@/features/dashboard/components/national-performance/national-performance-section'
import { executiveOverview } from '@/mocks/data/executive-overview'
import { renderWithRouter } from '@/test/render'
import type { Bottleneck } from '@/features/dashboard/types'

const {
  headlineCards,
  accessDelivery,
  nationalPerformance,
  deliveryStatus,
} = executiveOverview

/* ---------------- Section A ---------------- */

describe('Section A — headline cards', () => {
  it('renders exactly the four specified cards', () => {
    render(<HeadlineCards cards={headlineCards} />)

    const section = screen.getByRole('region', { name: 'Headline metrics' })
    // Each card carries exactly one information trigger.
    expect(within(section).getAllByRole('button', { name: /^About/ })).toHaveLength(4)
  })

  it('renders the milestone delivery card with its progress bar', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(
      screen.getByText('Priority milestones on time'),
    ).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', {
        name: 'Priority milestones on time',
      }),
    ).toHaveAttribute('aria-valuenow', '15')
  })

  /*
   * The specification requires the source year to be visible at all times:
   * the access rate is an annual official publication and must never be read
   * as current-period data.
   */
  it('always shows the source year on the access rate card', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders the generation capacity card with a sparkline', () => {
    const { container } = render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('5.4 GW')).toBeInTheDocument()
    expect(screen.getByText('of 13.6 GW installed')).toBeInTheDocument()
    expect(container.querySelector('polyline')).toBeInTheDocument()
  })

  it('renders the escalations card with its count and overdue decisions', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(
      screen.getByLabelText('4 unresolved critical escalations'),
    ).toBeInTheDocument()
    expect(screen.getByText(/3 overdue/)).toBeInTheDocument()
  })

  /*
   * A rising escalation count is a worsening, so the trend must be
   * lower-is-better — otherwise "+1 vs Q2" would render green.
   */
  it('treats a rising escalation count as a worsening', () => {
    render(<HeadlineCards cards={headlineCards} />)

    // getByText resolves to the trend pill itself, which carries the colour.
    expect(screen.getByText('+1 vs Q2 2025')).toHaveClass('text-trend-down')
  })

  it('presents a cleared escalation count calmly rather than as an alert', () => {
    render(
      <HeadlineCards
        cards={{
          ...headlineCards,
          escalations: {
            ...headlineCards.escalations,
            unresolvedCritical: 0,
            overdueDecisions: 0,
          },
        }}
      />,
    )

    expect(
      screen.getByLabelText('0 unresolved critical escalations'),
    ).toHaveClass('text-status-on-track')
  })

  it('moves targets and baselines into the information popover, not the card', () => {
    render(<HeadlineCards cards={headlineCards} />)

    // The target text must not be printed on the card face.
    expect(
      screen.queryByText('100% of due priority milestones on time'),
    ).not.toBeInTheDocument()
  })

  it('exposes the target through the information popover', async () => {
    const user = userEvent.setup()
    render(<HeadlineCards cards={headlineCards} />)

    await user.click(
      screen.getByRole('button', { name: /About Priority milestones/ }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('100% of due priority milestones on time')
    expect(dialog).toHaveTextContent('baseline 0% (Jan 2025)')
  })
})

/* ---------------- Section B ---------------- */

describe('Section B — access delivery by channel', () => {
  it('renders all three delivery channels', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(screen.getByText('New grid connections')).toBeInTheDocument()
    expect(
      screen.getByText('Mini-grid household connections'),
    ).toBeInTheDocument()
    expect(screen.getByText('Solar Home Systems deployed')).toBeInTheDocument()
  })

  it('renders a progress bar for channels with an approved target', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(
      screen.getByRole('progressbar', {
        name: 'Mini-grid household connections',
      }),
    ).toHaveAttribute('aria-valuenow', '17.1')
  })

  /*
   * The specification forbids converting the 9% access-rate commitment into a
   * connection-count target. Until one is approved this channel shows trend
   * only — a progress bar here would imply a target that does not exist.
   */
  it('renders no progress bar for a channel with no approved target', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(
      screen.queryByRole('progressbar', { name: 'New grid connections' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Annual target to be confirmed')).toBeInTheDocument()
  })

  it('still shows the period-on-period trend for an untargeted channel', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(screen.getByText('+38,400 vs Q2 2025')).toBeInTheDocument()
  })
})

/* ---------------- Section C ---------------- */

describe('Section C — national performance', () => {
  it('renders all six specified metrics', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    // Scoped to the metric list: the tick-mark legend is also a <ul>.
    const list = screen.getByRole('list', { name: 'National performance metrics' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  })

  it('renders a bullet chart per metric', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(screen.getAllByRole('img')).toHaveLength(6)
  })

  it('renders each metric on its own scale', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    // Metering rate: 55 on a 0–100 scale.
    expect(
      screen.getByRole('img', { name: /National metering rate/ }),
    ).toBeInTheDocument()
    // Tariff shortfall: ₦2.2tn on a 0–3 scale.
    expect(
      screen.getByRole('img', { name: /Tariff shortfall: ₦2.2tn/ }),
    ).toBeInTheDocument()
  })

  it('flags a metric behind its approved trajectory', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    // Metering is at 55 against an expected 68.
    expect(
      screen
        .getByRole('img', { name: /National metering rate/ })
        .getAttribute('aria-label'),
    ).toContain('behind the approved trajectory')
  })

  it('omits the target marker for a metric with no approved target', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(
      screen
        .getByRole('img', { name: /ATC&C loss rate/ })
        .getAttribute('aria-label'),
    ).not.toContain('target')
  })

  it('explains the tick marks in a legend', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(screen.getByText('Baseline')).toBeInTheDocument()
    expect(screen.getByText('Expected this period')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
  })
})

/* ---------------- Section D ---------------- */

describe('Section D — delivery status and exceptions', () => {
  it('renders a stacked bar per pillar', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} />)

    const list = screen.getByRole('list', {
      name: 'Priority delivery status by pillar',
    })
    expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  })

  it('states each pillar record count', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} />)

    expect(screen.getByText('21 records')).toBeInTheDocument()
  })

  it('says so plainly when a pillar has no approved records', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} />)

    expect(screen.getByText('No approved priority records')).toBeInTheDocument()
  })

  it('links to the full bottlenecks module', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} />)

    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/bottlenecks',
    )
  })

  it('renders the ranked exceptions with severity and days unresolved', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} />)

    expect(
      screen.getByText('Tariff shortfall / cost-reflectivity'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Critical')).not.toHaveLength(0)
    expect(screen.getByText(/118 days/)).toBeInTheDocument()
  })

  /*
   * The five-record cap is enforced in the component rather than trusted to
   * the API, so an over-long response cannot break the layout.
   */
  it('caps the exception table at five records', () => {
    const many: Bottleneck[] = Array.from({ length: 9 }, (_, index) => ({
      ...deliveryStatus.exceptions[0]!,
      id: `cpr-${index}`,
      title: `Exception ${index}`,
    }))

    renderWithRouter(
      <DeliveryStatusSection
        panel={{ ...deliveryStatus, exceptions: many }}
      />,
    )

    const list = screen.getByRole('list', { name: 'Priority exceptions' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByText('Exception 5')).not.toBeInTheDocument()
  })

  it('reports a clear state when there are no exceptions', () => {
    renderWithRouter(
      <DeliveryStatusSection panel={{ ...deliveryStatus, exceptions: [] }} />,
    )

    expect(
      screen.getByText('No unresolved priority exceptions.'),
    ).toBeInTheDocument()
  })
})
