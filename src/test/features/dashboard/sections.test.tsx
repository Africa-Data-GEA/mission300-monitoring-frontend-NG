import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('renders people with electricity access against its baseline and target', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('People with electricity access')).toBeInTheDocument()
    expect(screen.getByText('137.3M')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /People with electricity access/ }),
    ).toHaveAttribute('aria-label', expect.stringContaining('baseline 86.6'))
  })

  /*
   * A headline card plots current against baseline and target only, and passes
   * expected={null} to say so. That must not be reported back to the reader as
   * "No approved trajectory" — Mission 300 has an approved path for these
   * outcomes; this card simply is not the place it is drawn.
   */
  it('never claims a headline outcome has no approved trajectory', async () => {
    const user = userEvent.setup()
    render(<HeadlineCards cards={headlineCards} />)

    const chart = screen.getByRole('img', {
      name: /People with electricity access/,
    })
    expect(chart.getAttribute('aria-label')).not.toContain('trajectory')

    await user.hover(chart)
    expect(screen.getByRole('tooltip')).not.toHaveTextContent('trajectory')
  })

  /*
   * The specification requires the source year to be visible at all times:
   * the access rate is an annual official publication and must never be read
   * as current-period data.
   */
  it('always shows the source year on the access rate card', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('70.0%')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('renders the generation capacity card with a sparkline', async () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('5.4 GW')).toBeInTheDocument()
    // The trend chart is an ApexCharts line chart (GenerationCapacityLineChart),
    // not the plain SVG Sparkline — it exposes itself accessibly as an img.
    expect(
      screen.getByRole('img', { name: 'Available generation capacity trend' }),
    ).toBeInTheDocument()

    // The installed-capacity benchmark lives behind the info popover, not on
    // the card face — see MetricCardFrame's `details` prop.
    fireEvent.click(
      screen.getByRole('button', { name: /About Available generation capacity/ }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('of 13.6 GW installed')
  })

  it('renders clean cooking access against its baseline and target', () => {
    render(<HeadlineCards cards={headlineCards} />)

    expect(screen.getByText('Clean cooking access')).toBeInTheDocument()
    expect(screen.getByText('26.0%')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Clean cooking access/ }),
    ).toHaveAttribute('aria-label', expect.stringContaining('target 100'))
  })

  /*
   * A rising escalation count is a worsening, so the trend must be
   * lower-is-better — otherwise "+1 vs Q2" would render green.
   */
  it('moves targets and baselines into the information popover, not the card', () => {
    render(<HeadlineCards cards={headlineCards} />)

    // The target text must not be printed on the card face.
    expect(
      screen.queryByText(
        'Cumulative number of people with electricity access across grid, mini-grid and solar home system solutions.',
      ),
    ).not.toBeInTheDocument()
  })

  it('exposes the target through the information popover', async () => {
    render(<HeadlineCards cards={headlineCards} />)

    // fireEvent.click rather than userEvent.click: the popover's container
    // opens on hover, and userEvent's click simulates a pointer moving over
    // the trigger first, which would open then immediately toggle it closed
    // again before the click completes.
    fireEvent.click(
      screen.getByRole('button', { name: /About People with electricity access/ }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('236.7M by 2030')
    expect(dialog).toHaveTextContent('86.6M baseline (2024)')
  })
})

/* ---------------- Section B ---------------- */

describe('Section B — access delivery by channel', () => {
  it('renders all three delivery channels', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(screen.getByText('New Grid Connections (Annual)')).toBeInTheDocument()
    expect(
      screen.getByText('Mini-Grid Customer Connections'),
    ).toBeInTheDocument()
    expect(screen.getByText('Solar Home Systems Deployed')).toBeInTheDocument()
  })

  it('renders a progress bar for channels with an approved target', () => {
    render(<AccessDeliverySection channels={accessDelivery} />)

    expect(
      screen.getByRole('progressbar', {
        name: 'Mini-Grid Customer Connections',
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
      screen.getByRole('img', { name: /Metering Rate/ }),
    ).toBeInTheDocument()
    // Tariff shortfall: ₦2.2tn on a 0–3 scale.
    expect(
      screen.getByRole('img', { name: /Subsidy.*Tariff Shortfall/ }),
    ).toBeInTheDocument()
  })

  it('shows only current value and target comparison in the chart', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    const chart = screen.getByRole('img', { name: /Metering Rate/ })
    expect(chart.getAttribute('aria-label')).not.toContain('baseline')
    expect(chart.getAttribute('aria-label')).not.toContain('expected')
    expect(within(chart).queryByTestId('bullet-baseline')).not.toBeInTheDocument()
    expect(within(chart).queryByTestId('bullet-expected')).not.toBeInTheDocument()
  })

  it('omits the target marker for a metric with no approved target', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(
      screen
        .getByRole('img', { name: /ATC&C Loss Rate/ })
        .getAttribute('aria-label'),
    ).not.toContain('target')
  })

  it('explains current progress, remaining range and the target marker', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(screen.queryByText('Baseline')).not.toBeInTheDocument()
    expect(screen.queryByText('Expected this period')).not.toBeInTheDocument()
    expect(screen.getByText('Improving or stable')).toBeInTheDocument()
    expect(screen.getByText('Worsening')).toBeInTheDocument()
    expect(screen.getByText('Remaining range')).toBeInTheDocument()
    expect(screen.getByText('Target marker')).toBeInTheDocument()
  })

  it('uses red only when the reported trend is worsening', () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    const improving = screen.getByRole('img', { name: /Metering Rate/ })
    const worsening = screen.getByRole('img', { name: /DisCo Remittance/ })
    expect(within(improving).getByTestId('bullet-current')).toHaveClass(
      'bg-chart-blue-dark',
    )
    expect(within(worsening).getByTestId('bullet-current')).toHaveClass(
      'bg-status-at-risk',
    )
  })

  it('uses concise institution sources and no validation badges', async () => {
    render(<NationalPerformanceSection metrics={nationalPerformance} />)

    expect(screen.queryByText('Public source')).not.toBeInTheDocument()
    expect(screen.queryByText('Requires validation')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {
      name: /About Renewable Energy Share in Generation Mix/i,
    }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('NERC')).toBeInTheDocument()
    expect(dialog).not.toHaveTextContent('NERC Q3 2025 Report generation-by-source table')
  })
})

/* ---------------- Section D ---------------- */

describe('Section D — delivery status and exceptions', () => {
  it('renders ongoing projects in a paginated table with drill-down links', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    expect(screen.getAllByRole('table')).toHaveLength(2)
    expect(screen.getByText(/Showing 1.*5 of 8 records/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'North East 330kV Line Upgrade' })).toHaveAttribute(
      'href',
      '/programs/projects/PRJ-2025-011',
    )
    expect(screen.getByRole('link', { name: 'Transmission Rehabilitation Programme' })).toHaveAttribute(
      'href',
      '/programs/PRG-2025-001',
    )
  })

  it('paginates the project table', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    const projectsPanel = within(screen.getByRole('tabpanel'))
    await user.click(projectsPanel.getByRole('button', { name: 'Next page' }))

    expect(screen.getByText(/Showing 6.*8 of 8 records/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Feeder Rehabilitation Lots, Lagos' })).toBeInTheDocument()
  })

  it('searches projects and paginates the filtered results', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    await user.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'Lagos')

    expect(screen.getByText('2 projects found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ikeja Franchise Meter Rollout, Phase 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Feeder Rehabilitation Lots, Lagos' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('tabpanel')).getByRole('button', { name: 'Next page' }),
    ).toBeDisabled()
  })

  it('switches to an overall project-status chart', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    await user.click(screen.getByRole('tab', { name: 'Chart' }))

    expect(
      screen.getByRole('img', {
        name: 'Delivery status distribution for 8 ongoing projects',
      }),
    ).toBeInTheDocument()
  })

  it('links to the full bottlenecks module', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    expect(
      screen.getByRole('link', { name: 'Open the full register' }),
    ).toHaveAttribute('href', '/bottlenecks')
  })

  /*
   * Time unresolved is now a sortable column on the row itself rather than a
   * field inside a hover popover — review feedback was that it is one of the
   * two fields that decide whether a bottleneck matters.
   */
  it('renders the bottleneck rows with severity and time unresolved', () => {
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    expect(
      screen.getByText('Tariff shortfall / cost-reflectivity subsidy funding gap'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Critical')).not.toHaveLength(0)
    expect(screen.getByText('118 days')).toBeInTheDocument()
  })

  it('filters the bottleneck table by severity', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DeliveryStatusSection panel={deliveryStatus} onProjectsChanged={() => {}} />)

    expect(
      screen.getByText(`${deliveryStatus.exceptions.length} of ${deliveryStatus.exceptions.length} shown`),
    ).toBeInTheDocument()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search bottlenecks' }),
      'Tariff shortfall',
    )

    expect(screen.getByText(`1 of ${deliveryStatus.exceptions.length} shown`)).toBeInTheDocument()
  })

  /*
   * No longer capped at five: the section became a paginated table so the
   * whole unresolved set is reachable, rather than a ranked sample.
   */
  it('paginates rather than truncating a long bottleneck list', () => {
    const many: Bottleneck[] = Array.from({ length: 9 }, (_, index) => ({
      ...deliveryStatus.exceptions[0]!,
      id: `cpr-${index}`,
      title: `Exception ${index}`,
    }))

    renderWithRouter(
      <DeliveryStatusSection
        panel={{ ...deliveryStatus, exceptions: many }}
        onProjectsChanged={() => {}}
      />,
    )

    expect(screen.getByText('9 of 9 shown')).toBeInTheDocument()
    expect(screen.getByText(/Showing 1.*8 of 9 records/)).toBeInTheDocument()
  })

  it('reports a clear state when there are no exceptions', () => {
    renderWithRouter(
      <DeliveryStatusSection
        panel={{ ...deliveryStatus, exceptions: [] }}
        onProjectsChanged={() => {}}
      />,
    )

    expect(
      screen.getByText('No unresolved delivery bottlenecks.'),
    ).toBeInTheDocument()
  })
})
