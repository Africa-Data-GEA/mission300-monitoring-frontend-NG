import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { formatDate } from '@/lib/format'
import { ChartDownloadBar } from './chart-download-bar'
import type { EvolutionSeries } from './evolution-chart'
import { formatSeriesValue } from '../lib/evolution-target'
import { periodToDate } from '../lib/evolution-series'
import { LANDING_FONT_FAMILY, compactNumber } from '../lib/landing-chart-theme'

const NAVY = '#065a89'
const GOLD = '#ffb800'
const GRID = '#d7e0e7'
const SLATE = '#667684'
// A full-year composite reading (e.g. an annual Compact Progress Report
// figure) can land in the same series as quarterly readings from a
// different pipeline entirely - see periodToDate/reportingPeriodKey, which
// sort a bare year after that year's own quarters. Distinct from GOLD
// (which marks the chronologically latest point, quarterly or not) so the
// two meanings don't collide when the latest point happens to be annual.
const ANNUAL = '#8a5a00'

/** A bare "YYYY" period, as opposed to "Q# YYYY" or a monthly period -
 * signals this one reading is a full-year composite, not part of the same
 * quarterly cadence as its neighbours. */
function isAnnualPeriod(period: string): boolean {
  return /^\d{4}$/.test(period.trim())
}

export type EvolutionChartView = 'area' | 'bar'

export function EvolutionTrackerChart({
  series,
  view,
}: {
  series: EvolutionSeries
  view: EvolutionChartView
}) {
  const chartId = `landing-tracker-${series.id}-${view}`
  const lastPointIndex = series.points.length - 1
  const annualIndexes = series.points
    .map((point, index) => (isAnnualPeriod(point.period) ? index : -1))
    .filter((index) => index !== -1)
  // Only worth calling out when the series actually mixes cadences - a
  // KPI reported quarterly throughout, or annually throughout, has nothing
  // to disambiguate.
  const hasMixedCadence = annualIndexes.length > 0 && annualIndexes.length < series.points.length
  const options: ApexOptions = {
    chart: {
      id: chartId,
      type: view,
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: LANDING_FONT_FAMILY,
      parentHeightOffset: 0,
    },
    colors: [NAVY],
    // Straight, not smoothed - same rule EvolutionChart already documents
    // for its own line: a cubic-spline curve through sparse quarterly
    // points (as few as 3 here) mathematically overshoots between and past
    // them, drawing values that were never reported - visibly contradicting
    // the real "latest reading" figure shown next to this chart.
    stroke: { curve: 'straight', width: view === 'area' ? 2 : 0, lineCap: 'round' },
    fill:
      view === 'area'
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 0,
              type: 'vertical',
              opacityFrom: 0.28,
              opacityTo: 0,
              stops: [0, 95],
            },
          }
        : { type: 'solid', opacity: 0.92 },
    ...(view === 'bar'
      ? { plotOptions: { bar: { columnWidth: '42%', borderRadius: 4, borderRadiusApplication: 'end' as const } } }
      : {}),
    markers: {
      size: 0,
      discrete:
        view === 'area'
          ? [
              // Every annual reading gets its own marker, ringed in ANNUAL
              // to flag "full-year composite, different pipeline than its
              // quarterly neighbours" - independent of whether it's also
              // the chronologically latest point.
              ...annualIndexes.map((dataPointIndex) => ({
                seriesIndex: 0,
                dataPointIndex,
                fillColor: dataPointIndex === lastPointIndex ? GOLD : '#ffffff',
                strokeColor: ANNUAL,
                size: dataPointIndex === lastPointIndex ? 7 : 5,
              })),
              // The latest point still gets its own gold marker when it's
              // NOT annual - the existing "this is the current reading"
              // convention, unchanged for an all-quarterly series.
              ...(annualIndexes.includes(lastPointIndex)
                ? []
                : [
                    {
                      seriesIndex: 0,
                      dataPointIndex: lastPointIndex,
                      fillColor: GOLD,
                      strokeColor: '#ffffff',
                      size: 6,
                    },
                  ]),
            ]
          : [],
    },
    grid: {
      borderColor: GRID,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 10, top: 6, bottom: 0 },
    },
    xaxis: {
      type: 'datetime',
      axisBorder: { show: true, color: GRID },
      axisTicks: { show: false },
      labels: {
        datetimeUTC: true,
        style: { colors: SLATE, fontFamily: LANDING_FONT_FAMILY, fontSize: '11px' },
      },
    },
    yaxis: {
      labels: {
        formatter: compactNumber,
        style: { colors: SLATE, fontFamily: LANDING_FONT_FAMILY, fontSize: '11px' },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
      x: { format: 'MMM yyyy' },
      y: {
        formatter: (value: number, opts) => {
          const formatted = formatSeriesValue(value, series)
          const index = opts?.dataPointIndex
          return typeof index === 'number' && annualIndexes.includes(index)
            ? `${formatted} (full-year figure)`
            : formatted
        },
      },
    },
  }

  return (
    <>
      <div className="mt-6">
        <Chart
          key={`${series.id}-${view}`}
          type={view}
          height={290}
          series={[
            {
              name: series.title,
              data: series.points.map((point, index) => ({
                x: periodToDate(point.period),
                y: point.value,
                ...(view === 'bar'
                  ? {
                      fillColor: annualIndexes.includes(index)
                        ? ANNUAL
                        : index === lastPointIndex
                          ? GOLD
                          : NAVY,
                    }
                  : {}),
              })),
            },
          ]}
          options={options}
        />
      </div>

      {hasMixedCadence && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[0.6875rem] leading-4 text-[#667684]">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block size-2 rounded-full" style={{ background: NAVY }} />
            Quarterly reading
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full border-2"
              style={{ borderColor: ANNUAL, background: '#ffffff' }}
            />
            Full-year figure — a separate, annual report, not a continuation of the quarterly trend
          </span>
        </div>
      )}

      <TargetJourney series={series} />

      <ChartDownloadBar
        title={series.title}
        source={`${series.sourceLabel} · last updated ${formatDate(series.provenance.lastUpdated)}`}
        chartId={chartId}
        dataset={{
          headers: ['Period', series.title, 'Unit', 'Source'],
          rows: series.points.map((point) => [
            point.period,
            point.value,
            series.unit,
            series.provenance.source,
          ]),
        }}
      />
    </>
  )
}

function TargetJourney({ series }: { series: EvolutionSeries }) {
  const target = series.target
  if (target === null) {
    return (
      <div className="mt-5 border-l-2 border-[#aebdc8] bg-[#f1f4f7] px-4 py-3">
        <p className="text-[0.75rem] leading-5 font-semibold text-[#536472]">
          Trend view only
          <span className="ml-2 font-normal text-[#667684]">No approved numerical target is published.</span>
        </p>
      </div>
    )
  }

  // A journey needs a real starting point. Falling back to the oldest point
  // in whatever history window happened to be returned (e.g. generation
  // capacity's rolling few quarters) would invent a "baseline" that drifts
  // every period for reasons unrelated to real performance - the same
  // fabrication this page's own baseline/target fields are designed never to
  // do (see EvolutionSeries.target's own comment).
  if (series.baseline === null) {
    return (
      <div className="mt-5 border-l-2 border-[#aebdc8] bg-[#f1f4f7] px-4 py-3">
        <p className="text-[0.75rem] leading-5 font-semibold text-[#536472]">
          Trend view only
          <span className="ml-2 font-normal text-[#667684]">No approved baseline is published to measure progress from.</span>
        </p>
      </div>
    )
  }

  const baseline = series.baseline
  const totalJourney =
    series.direction === 'lower-is-better' ? baseline - target : target - baseline
  const completedJourney =
    series.direction === 'lower-is-better'
      ? baseline - series.current
      : series.current - baseline

  if (totalJourney <= 0) return null

  const progress = Math.min(100, Math.max(0, (completedJourney / totalJourney) * 100))
  const progressRounded = Math.round(progress)
  const journeyChartId = `landing-tracker-journey-${series.id}`
  const options: ApexOptions = {
    chart: {
      id: journeyChartId,
      type: 'bar',
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: LANDING_FONT_FAMILY,
    },
    colors: [NAVY],
    fill: { opacity: 1 },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '34%',
        borderRadius: 2,
        colors: {
          backgroundBarColors: ['#e3e9ee'],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 2,
        },
      },
    },
    xaxis: { min: 0, max: 100 },
    grid: { padding: { left: 0, right: 2, top: -12, bottom: -12 } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (value: number) => `${Math.round(value)}% of journey completed` } },
  }

  return (
    <div className="mt-5 border-t border-[#d7e0e7] pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-[#536472] uppercase">
          Target journey
        </p>
        <p className="text-[0.75rem] leading-5 font-semibold text-landing-navy">
          <span className="text-landing-gold-text">{progressRounded}%</span> completed
        </p>
      </div>
      <Chart
        type="bar"
        height={52}
        series={[
          {
            name: 'Journey completed',
            data: [
              {
                x: series.title,
                y: progress,
                goals: [
                  {
                    name: 'Target',
                    value: 100,
                    strokeColor: GOLD,
                    strokeHeight: 18,
                    strokeWidth: 3,
                  },
                ],
              },
            ],
          },
        ]}
        options={options}
      />
      <div className="mt-1 flex justify-between gap-6 text-[0.6875rem] leading-4 text-[#667684]">
        <span>Baseline {formatSeriesValue(baseline, series, true)}</span>
        <span className="text-right font-semibold text-[#536472]">
          Target {formatSeriesValue(target, series, true)}
        </span>
      </div>
    </div>
  )
}
