import { useEffect, useId, useRef, useState } from 'react'
import Chart from 'react-apexcharts'
import { Link, useNavigate } from 'react-router'
import type { PillarId } from '@/api/schemas/common'
import type { PillarCoreIndicator } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { CHART_BLUE } from '@/config/chart-colors'
import { formatCurrency, getLocale, useCurrency } from '@/lib/currency'
import { getDiscoBreakdown } from '../lib/disco-weights'
import { PillarKpiEditButton } from './pillar-kpi-edit-button'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const UNCONFIRMED_PERIOD_KPI_IDS = new Set(['M300-P4-011', 'M300-P4-012'])

function formatValue(value: number, unit: string): string {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100
  const formatted = rounded.toLocaleString(getLocale())
  if (unit === 'USD') return formatCurrency(formatted)
  if (unit === '%') return `${formatted}%`
  if (unit === 'NGN Billion') return formatCurrency(`${formatted}bn`)
  if (unit === 'NGN/kWh') return formatCurrency(`${formatted}/kWh`)
  if (unit === 'Number' || unit === 'Currency not stated') return formatted
  return `${formatted} ${unit}`
}

/**
 * Same idea as `formatValue`, but with the number itself abbreviated
 * (500,000 → 500K) — for the gauge card's center text, where the full
 * digit string plus a unit word ("500,000 stoves") routinely overflowed
 * the circle for count-style units.
 */
function formatCompactValue(value: number, unit: string): string {
  const compact = new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  if (unit === 'USD') return formatCurrency(compact)
  if (unit === '%') return `${compact}%`
  if (unit === 'NGN Billion') return formatCurrency(`${compact}bn`)
  if (unit === 'NGN/kWh') return formatCurrency(`${compact}/kWh`)
  if (unit === 'Number' || unit === 'Currency not stated') return compact
  return `${compact} ${unit}`
}

/**
 * Same idea as `formatValue`, for text drawn inside an Apex SVG chart
 * specifically: the naira sign doesn't render reliably inside ApexCharts'
 * SVG text nodes (falls back to a bare "N"), so this spells out "NGN"
 * instead, and compacts large customer counts (6,966,584 → "6.97M") so
 * axis ticks and bar-end labels don't overlap or get clipped.
 */
function formatChartLabel(value: number, unit: string): string {
  if (unit === 'customers') {
    return new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 2 }).format(value)
  }
  const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100
  const formatted = rounded.toLocaleString(getLocale())
  if (unit === 'USD') return formatCurrency(formatted, { svgSafe: true })
  if (unit === '%') return `${formatted}%`
  if (unit === 'NGN Billion') return formatCurrency(`${formatted}bn`, { svgSafe: true })
  if (unit === 'NGN/kWh') return formatCurrency(`${formatted}/kWh`, { svgSafe: true })
  if (unit === 'Number' || unit === 'Currency not stated') return formatted
  return `${formatted} ${unit}`
}

type MilestoneStage = 'achieved' | 'in-progress' | 'not-started'

/** Milestone KPIs (`unit: 'status'`) carry no numeric current/target — the
 * profile's own `currentLabel` text ("Not yet achieved", "In progress", or
 * an achieved-style phrase) is the only signal of where the milestone sits. */
function deriveMilestoneStage(currentLabel: string): MilestoneStage {
  const normalized = currentLabel.toLowerCase()
  if (normalized.includes('not yet achieved') || normalized.includes('not achieved')) return 'not-started'
  if (normalized.includes('achieved') || normalized.includes('approved') || normalized.includes('completed')) {
    return 'achieved'
  }
  if (normalized.includes('progress')) return 'in-progress'
  return 'not-started'
}

const MILESTONE_STAGE_STYLES: Record<MilestoneStage, { label: string; dot: string; text: string; track: string }> = {
  achieved: {
    label: 'Achieved',
    dot: 'bg-status-on-track',
    text: 'text-status-on-track',
    track: 'bg-status-on-track',
  },
  'in-progress': {
    label: 'In progress',
    dot: 'bg-status-lagging',
    text: 'text-status-lagging',
    track: 'bg-status-lagging',
  },
  'not-started': {
    label: 'Not started',
    dot: 'bg-status-no-data',
    text: 'text-status-no-data',
    track: 'bg-status-no-data',
  },
}

const MILESTONE_STAGE_ORDER: readonly MilestoneStage[] = ['not-started', 'in-progress', 'achieved']

/**
 * Governance/reform-status indicators — the KPI Matrix's `unit: 'status'`
 * KPIs (e.g. "Audited Annual Financial Statements Published"). These are
 * real KPIs, not Milestone records (see MilestonesSection, a completely
 * separate real-data section on this same page) - named accordingly so the
 * two don't read as the same thing. Per the pillar specs ("use one reform
 * tracker rather than separate cards for each milestone"), they're
 * consolidated into a single tracker card per pillar rather than one tiny
 * card each, and rather than being dropped to the plain KPI table below
 * just because they have no number to gauge or bar-chart.
 */
function GovernanceStatusTrackerCard({ indicators }: { indicators: readonly PillarCoreIndicator[] }) {
  return (
    <Card className="flex h-full flex-col p-4 sm:col-span-2 xl:col-span-4">
      <h3 className="text-sm font-medium text-text-default">Governance & reform status</h3>
      <ul className="mt-3 flex flex-col divide-y divide-border-default">
        {indicators.map((indicator) => {
          const stage = deriveMilestoneStage(indicator.currentLabel)
          const stageIndex = MILESTONE_STAGE_ORDER.indexOf(stage)
          const styles = MILESTONE_STAGE_STYLES[stage]
          return (
            <li key={indicator.kpiId} className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitleLink indicator={indicator} />
                <InfoPopover provenance={indicator.provenance} label={indicator.name} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1" role="img" aria-label={`${indicator.name}: ${styles.label}`}>
                  {MILESTONE_STAGE_ORDER.map((step, index) => (
                    <span
                      key={step}
                      aria-hidden="true"
                      className={`h-1.5 flex-1 rounded-full ${index <= stageIndex ? styles.track : 'bg-surface-sunken'}`}
                    />
                  ))}
                </div>
                <span className={`flex items-center gap-1.5 text-2xs font-medium whitespace-nowrap ${styles.text}`}>
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${styles.dot}`} />
                  {styles.label}
                </span>
              </div>
              <p className="text-2xs text-text-subtle">{indicator.targetLabel}</p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/** Period-on-period movement derived from a history series, for TrendIndicator. */
function deriveTrend(indicator: PillarCoreIndicator) {
  if (indicator.history.length < 2) return null
  const first = indicator.history[0]!
  const last = indicator.history[indicator.history.length - 1]!
  const change = Math.round((last - first) * 100) / 100
  if (change === 0) return null
  return {
    change,
    label: `${change > 0 ? '+' : ''}${formatValue(change, indicator.unit)} since ${indicator.history.length} periods ago`,
    direction: indicator.direction,
  }
}

/** Card title, wrapped as a real link into the KPI's full profile — every
 * card here already has a real kpiId with a full history behind it. */
function CardTitleLink({ indicator }: { indicator: PillarCoreIndicator }) {
  return (
    <Link
      to={`/kpis?kpi=${indicator.kpiId}`}
      title={indicator.name}
      className="line-clamp-2 min-h-9 text-sm text-text-muted underline-offset-2 hover:text-brand-700 hover:underline"
    >
      {indicator.name}
    </Link>
  )
}

/** Expandable illustrative DisCo split, shared by StatCard and GaugeCard. */
/**
 * Renders as a popover rather than an inline expansion — an inline panel
 * would push every card below it further down the grid each time a single
 * toggle opens, throwing off the "perfectly aligned" 2-per-row layout.
 */
function DiscoBreakdownToggle({ indicator }: { indicator: PillarCoreIndicator }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (indicator.current === null) return null
  const current = indicator.current

  return (
    <div ref={containerRef} className="relative mt-2 inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="text-2xs font-medium text-text-subtle underline-offset-2 hover:text-brand-700 hover:underline"
      >
        {open ? 'Hide DisCo split ▴' : 'By DisCo ▾'}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`${indicator.name} by DisCo`}
          className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-control border border-border-default bg-surface p-3 text-left shadow-lg"
        >
          <p className="text-2xs text-text-subtle">
            Illustrative split by relative DisCo size — not yet DisCo-validated data.
          </p>
          <div className="mt-2 space-y-1.5">
            {(() => {
              const rows = getDiscoBreakdown(current, indicator.unit)
              const maxValue = Math.max(...rows.map((row) => row.value))
              return rows.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-2xs text-text-muted" title={row.name}>
                    {row.name}
                  </span>
                  <div className="h-3.5 flex-1 rounded-sm bg-surface-subtle">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${maxValue > 0 ? (row.value / maxValue) * 100 : 0}%`,
                        backgroundColor: CHART_BLUE.dark,
                      }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-2xs font-semibold text-text-default">
                    {formatValue(row.value, indicator.unit)}
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

/** A single indicator with no usable target — shown as a plain figure. */
function StatCard({ indicator, showDiscoBreakdown }: { indicator: PillarCoreIndicator; showDiscoBreakdown: boolean }) {
  const trend = deriveTrend(indicator)

  return (
    <Card className="flex h-full min-h-36 min-w-0 flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <CardTitleLink indicator={indicator} />
        <div className="flex shrink-0 items-center gap-1">
          <InfoPopover
            provenance={indicator.provenance}
            label={indicator.name}
            details={[{ label: 'Baseline', value: indicator.baselineLabel || null }]}
          />
          <PillarKpiEditButton kpiId={indicator.kpiId} name={indicator.name} />
        </div>
      </div>
      <p
        title={indicator.current === null ? undefined : formatValue(indicator.current, indicator.unit)}
        className="mt-2 text-3xl leading-none font-semibold tracking-tight text-text-default"
      >
        {indicator.current === null ? '—' : formatCompactValue(indicator.current, indicator.unit)}
      </p>
      {indicator.period && <p className="text-2xs text-text-subtle">as of {indicator.period}</p>}
      {indicator.unit === 'Currency not stated' && (
        <p className="mt-auto pt-3 text-2xs text-text-subtle">Currency not specified by source</p>
      )}
      {trend && (
        <div className="mt-2">
          <TrendIndicator trend={trend} />
        </div>
      )}
      {/* A StatCard has far less content than its GaugeCard/TargetBarCard
          siblings in the same grid row, so it stretches to match their
          height and leaves a large blank gap below. A filled Apex area chart
          (not a bare line) fills that space and actually communicates
          something on hover — the value at each period — rather than being
          a flat decorative squiggle, and reads as visually distinct from the
          bar and radial charts sitting next to it in the same grid. */}
      {indicator.history.length >= 2 && (
        <div className="mt-4 min-h-24 flex-1">
          <Chart
            type="area"
            height="100%"
            series={[{ name: indicator.name, data: [...indicator.history] }]}
            options={{
              chart: {
                type: 'area',
                animations: { enabled: false },
                sparkline: { enabled: true },
                toolbar: { show: false },
                fontFamily: FONT_FAMILY,
              },
              colors: [CHART_BLUE.dark],
              stroke: { curve: 'smooth', lineCap: 'round', width: 2.5 },
              fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] },
              },
              markers: { size: 0, hover: { size: 5 } },
              tooltip: {
                x: { show: false },
                y: {
                  formatter: (value: number) => formatChartLabel(value, indicator.unit),
                  title: { formatter: () => '' },
                },
              },
            }}
          />
        </div>
      )}
      {showDiscoBreakdown && (
        <div className="mt-auto">
          <DiscoBreakdownToggle indicator={indicator} />
        </div>
      )}
    </Card>
  )
}

/**
 * A single indicator with a meaningful target — shown as two concentric
 * rings: the outer ring is the target (always a full circle, since it's the
 * 100% reference), the inner ring is current progress toward it. The centre
 * value is a plain HTML overlay rather than Apex's own dataLabel — far more
 * reliable to size and guaranteed to render, where Apex's radialBar "total"
 * label silently no-ops in some configurations.
 */
function GaugeCard({ indicator, showDiscoBreakdown }: { indicator: PillarCoreIndicator; showDiscoBreakdown: boolean }) {
  const current = indicator.current ?? 0
  const target = indicator.target ?? 0
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 1000) / 10) : 0
  const trend = deriveTrend(indicator)

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <CardTitleLink indicator={indicator} />
        <div className="flex shrink-0 items-center gap-1">
          <InfoPopover
            provenance={indicator.provenance}
            label={indicator.name}
            details={[{ label: 'Baseline', value: indicator.baselineLabel || null }]}
          />
          <PillarKpiEditButton kpiId={indicator.kpiId} name={indicator.name} />
        </div>
      </div>
      <div className="relative">
        <Chart
          type="radialBar"
          height={190}
          series={[percent, 100]}
          options={{
            chart: { type: 'radialBar', fontFamily: FONT_FAMILY },
            colors: [CHART_BLUE.dark, CHART_BLUE.lightest],
            labels: ['Current', 'Target'],
            plotOptions: {
              radialBar: {
                hollow: { size: '52%' },
                track: { show: false },
                dataLabels: { name: { show: false }, value: { show: false } },
              },
            },
            stroke: { lineCap: 'round' },
            legend: { show: false },
            tooltip: {
              y: {
                formatter: (value: number) => formatChartLabel(value === percent ? current : target, indicator.unit),
              },
            },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="max-w-full truncate text-base leading-tight font-semibold text-text-default">
            {formatCompactValue(current, indicator.unit)}
          </span>
          <span className="mt-0.5 max-w-full truncate text-2xs leading-tight text-text-subtle">
            of {formatCompactValue(target, indicator.unit)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-2xs text-text-subtle">
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: CHART_BLUE.dark }} />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: CHART_BLUE.lightest }} />
          Target
        </span>
        {indicator.period && <span>as of {indicator.period}</span>}
        <span className="ml-auto font-medium text-text-muted">{percent}% to target</span>
      </div>
      {trend && (
        <div className="mt-2">
          <TrendIndicator trend={trend} />
        </div>
      )}
      {showDiscoBreakdown && <DiscoBreakdownToggle indicator={indicator} />}
    </Card>
  )
}

/**
 * A single indicator with a real magnitude target that isn't a 0–100 ratio
 * (states enacted out of 36, mini-grids built toward a count target, meters
 * installed toward a multi-million target) — a horizontal bar for the
 * current value against a dashed target line, rather than forcing every
 * progress-to-target metric into the same radial gauge. GaugeCard stays
 * reserved for genuine percentage-of-100 ratios (collection efficiency,
 * cost recovery) where a dial reads naturally; everything else with a
 * distant numeric target reads more honestly as "how far is the bar from
 * the line" than as a percentage fill.
 */
function TargetBarCard({ indicator, showDiscoBreakdown }: { indicator: PillarCoreIndicator; showDiscoBreakdown: boolean }) {
  const current = indicator.current ?? 0
  const target = indicator.target ?? 0
  // Mirrors HeadlineCard's own percentToTarget fix: for a lower-is-better
  // indicator, current/target is not "progress" (a value already below a
  // falling target reads as >100%) — progress is distance travelled down
  // from the baseline instead.
  const percent = (() => {
    if (indicator.target === null || indicator.current === null) return null
    if (indicator.direction === 'lower-is-better') {
      if (indicator.baseline === null || indicator.baseline === indicator.target) return null
      const travelled = (indicator.baseline - indicator.current) / (indicator.baseline - indicator.target)
      return Math.max(0, Math.min(100, Math.round(travelled * 1000) / 10))
    }
    return target > 0 ? Math.min(100, Math.round((current / target) * 1000) / 10) : null
  })()
  const trend = deriveTrend(indicator)
  const axisMax = Math.max(current, target) * 1.2 || 1

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <CardTitleLink indicator={indicator} />
        <div className="flex shrink-0 items-center gap-1">
          <InfoPopover
            provenance={indicator.provenance}
            label={indicator.name}
            details={[{ label: 'Baseline', value: indicator.baselineLabel || null }]}
          />
          <PillarKpiEditButton kpiId={indicator.kpiId} name={indicator.name} />
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <p className="text-2xl leading-none font-semibold tracking-tight text-text-default">
          {formatValue(current, indicator.unit)}
        </p>
        {percent !== null && <span className="text-2xs font-medium text-text-subtle">{percent}% to target</span>}
      </div>
      {indicator.period && <p className="text-2xs text-text-subtle">as of {indicator.period}</p>}
      <div className="mt-4 flex-1">
        <Chart
          type="bar"
          height={100}
          series={[{ name: indicator.name, data: [current] }]}
          options={{
            chart: {
              type: 'bar',
              toolbar: { show: false },
              fontFamily: FONT_FAMILY,
              animations: { enabled: false },
            },
            plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
            colors: [CHART_BLUE.dark],
            dataLabels: { enabled: false },
            xaxis: {
              categories: [''],
              min: 0,
              max: axisMax,
              labels: { show: false },
              axisTicks: { show: false },
              axisBorder: { show: false },
            },
            yaxis: { labels: { show: false } },
            grid: { show: false, padding: { left: 0, right: 16, top: 24, bottom: 0 } },
            annotations: {
              xaxis: [
                {
                  x: target,
                  strokeDashArray: 4,
                  borderColor: 'var(--color-text-subtle)',
                  label: {
                    text: `Target ${formatCompactValue(target, indicator.unit)}`,
                    orientation: 'horizontal',
                    offsetY: -8,
                    style: {
                      fontSize: '10px',
                      fontFamily: FONT_FAMILY,
                      background: 'transparent',
                      color: 'var(--color-text-subtle)',
                    },
                  },
                },
              ],
            },
            tooltip: { y: { formatter: (value: number) => formatChartLabel(value, indicator.unit) } },
          }}
        />
      </div>
      {trend && (
        <div className="mt-2">
          <TrendIndicator trend={trend} />
        </div>
      )}
      {showDiscoBreakdown && (
        <div className="mt-auto pt-2">
          <DiscoBreakdownToggle indicator={indicator} />
        </div>
      )}
    </Card>
  )
}

/** Two or more same-unit indicators — one comparison bar chart. Each bar
 * routes to its own KPI profile on click, same as every other card here. */
function ComparisonBarCard({ title, indicators }: { title: string; indicators: readonly PillarCoreIndicator[] }) {
  const unit = indicators[0]?.unit ?? ''
  const maxValue = Math.max(...indicators.map((entry) => entry.current ?? 0))
  const navigate = useNavigate()

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-text-muted">{title}</p>
        <InfoPopover
          provenance={indicators[0]!.provenance}
          label={title}
          details={indicators.map((entry) => ({
            label: entry.name,
            value: entry.current === null ? null : formatValue(entry.current, entry.unit),
          }))}
        />
      </div>
      <Chart
        type="bar"
        height={Math.max(160, indicators.length * 64)}
        className="[&_.apexcharts-bar-area]:cursor-pointer"
        series={[{ name: 'Current', data: indicators.map((entry) => entry.current ?? 0) }]}
        options={{
          chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: FONT_FAMILY,
            events: {
              dataPointSelection: (_event, _ctx, config) => {
                const indicator = indicators[config?.dataPointIndex ?? -1]
                if (indicator) navigate(`/kpis?kpi=${indicator.kpiId}`)
              },
            },
          },
          plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '45%' } },
          colors: [CHART_BLUE.dark],
          dataLabels: {
            enabled: true,
            formatter: (value: number) => formatChartLabel(Number(value), unit),
            style: { fontFamily: FONT_FAMILY, fontWeight: 600 },
          },
          // Ticks are hidden rather than reformatted: every bar already
          // carries its own value as an inline label, so a numeric axis
          // underneath just repeats that in a more crowded, harder-to-read
          // form — especially once figures run into the millions.
          xaxis: {
            categories: indicators.map((entry) => entry.name),
            min: 0,
            max: maxValue * 1.25,
            labels: { show: false },
            axisTicks: { show: false },
            axisBorder: { show: false },
          },
          grid: { borderColor: 'var(--border-default)', xaxis: { lines: { show: false } } },
          tooltip: { y: { formatter: (value: number) => formatChartLabel(value, unit) } },
        }}
      />
    </Card>
  )
}

/**
 * KPI Matrix indicators for this pillar beyond the four headline cards —
 * grouped and charted rather than dumped as one long table row, and only
 * ever showing a chart where there's a real current value to chart. Renders
 * nothing for a pillar with no expanded coverage, or where every candidate
 * indicator is still awaiting a confirmed figure.
 */
export function CoreIndicatorsSection({
  indicators,
  pillar,
}: {
  indicators: readonly PillarCoreIndicator[]
  pillar: PillarId
}) {
  useCurrency()
  if (indicators.length === 0) return null
  // These KPI names assert a January 2025 start date that has not been
  // confirmed. Keep them out of this summary until the source is corrected.
  const visibleIndicators = pillar === 'private-sector-participation'
    ? indicators.filter((entry) => !UNCONFIRMED_PERIOD_KPI_IDS.has(entry.kpiId))
    : indicators
  // The DisCo-level split is only meaningful where the underlying metric is
  // genuinely disaggregated by DisCo (grid/utility metering, tariffs,
  // collections). Private-sector capital, cross-border trade and national
  // clean-cooking access aren't DisCo-specific, so the toggle is hidden
  // there rather than showing an arbitrary illustrative split.
  const showDiscoBreakdown = pillar === 'financially-viable-utilities'

  // Milestone-type indicators (unit `status`) never carry a numeric
  // current/target — they get one consolidated tracker card instead of
  // being grouped and gauge/bar-charted like every other indicator.
  const milestoneIndicators = visibleIndicators.filter((entry) => entry.unit === 'status')
  const chartableIndicators = visibleIndicators.filter((entry) => entry.unit !== 'status')

  const groups = new Map<string, PillarCoreIndicator[]>()
  for (const entry of chartableIndicators) {
    const list = groups.get(entry.group) ?? []
    list.push(entry)
    groups.set(entry.group, list)
  }

  // A group with no confirmed value doesn't earn a card — see the loop
  // below. If that leaves every group empty, and there are no milestones
  // either, the whole section (heading included) should disappear rather
  // than show as an empty shell.
  const hasAnyKnownValue = [...groups.values()].some((entries) => entries.some((entry) => entry.current !== null))
  if (!hasAnyKnownValue && milestoneIndicators.length === 0) return null

  return (
    <Card variant="well" className="p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Supporting indicators
      </h2>

      <div className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...groups.entries()].map(([group, entries]) => {
          const known = entries.filter((entry) => entry.current !== null)
          const sameUnit = known.length >= 2 && known.every((entry) => entry.unit === known[0]?.unit)

          if (known.length === 0) return null

          return (
            <div key={group} className="contents">
              {sameUnit ? (
                <ComparisonBarCard title={group} indicators={known} />
              ) : (
                known.map((entry) => {
                  // A radial gauge reads naturally as "percent of the way to
                  // 100%" — reserved for genuine ratio metrics. A distant
                  // magnitude target (states enacted, meters installed) gets
                  // a linear bar with a target line instead; a metric with no
                  // usable target at all falls back to its trend area chart.
                  const isRatioTarget =
                    entry.unit === '%' &&
                    entry.direction === 'higher-is-better' &&
                    entry.target !== null &&
                    entry.target > 0 &&
                    entry.target <= 100
                  if (isRatioTarget) {
                    return <GaugeCard key={entry.kpiId} indicator={entry} showDiscoBreakdown={showDiscoBreakdown} />
                  }
                  if (entry.target !== null && entry.target > 0) {
                    return <TargetBarCard key={entry.kpiId} indicator={entry} showDiscoBreakdown={showDiscoBreakdown} />
                  }
                  return <StatCard key={entry.kpiId} indicator={entry} showDiscoBreakdown={showDiscoBreakdown} />
                })
              )}
            </div>
          )
        })}

        {milestoneIndicators.length > 0 && <GovernanceStatusTrackerCard indicators={milestoneIndicators} />}
      </div>
    </Card>
  )
}
