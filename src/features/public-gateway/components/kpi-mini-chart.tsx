import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { KpiFigure } from '../lib/headline-figures'
import { LANDING_FONT_FAMILY, compactNumber } from '../lib/landing-chart-theme'

const NAVY = '#065a89'
const GOLD = '#d99a00'

/** A compact Apex chart for one national headline figure. */
export function KpiMiniChart({ figure }: { figure: KpiFigure }) {
  if (figure.track) return <TargetBulletChart figure={figure} />
  if (figure.sparkline.length >= 2) return <HistorySparkline figure={figure} />
  return null
}

function TargetBulletChart({ figure }: { figure: KpiFigure }) {
  const track = figure.track
  if (!track || track.max <= track.min) return null

  const target = track.target ?? track.max
  const options: ApexOptions = {
    chart: {
      id: `landing-kpi-${figure.id}`,
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
    xaxis: { min: track.min, max: track.max },
    grid: { padding: { left: 0, right: 2, top: -12, bottom: -12 } },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
      y: { formatter: (value: number) => value.toLocaleString('en-US') },
    },
  }

  return (
    <div className="mt-5">
      <Chart
        type="bar"
        height={52}
        series={[
          {
            name: 'Current',
            data: [
              {
                x: figure.label,
                y: track.current,
                goals: [
                  {
                    name: 'Target',
                    value: target,
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
      <div className="mt-1 flex items-start justify-between gap-5 text-[0.625rem] leading-4 text-[#667684]">
        <span className="max-w-[48%]">{track.baselineLabel || 'Current output'}</span>
        <span className="max-w-[48%] text-right font-semibold text-[#536472]">{track.targetLabel}</span>
      </div>
    </div>
  )
}

function HistorySparkline({ figure }: { figure: KpiFigure }) {
  const first = figure.sparkline[0]
  const last = figure.sparkline.at(-1)
  if (!first || !last) return null

  const isPercentage = figure.value.trim().endsWith('%')
  const formatValue = (value: number) =>
    isPercentage ? `${value.toFixed(1)}%` : compactNumber(value)

  const options: ApexOptions = {
    chart: {
      id: `landing-kpi-${figure.id}`,
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: LANDING_FONT_FAMILY,
    },
    colors: [NAVY],
    stroke: { curve: 'straight', width: 2, lineCap: 'round' },
    markers: {
      size: 0,
      discrete: [
        {
          seriesIndex: 0,
          dataPointIndex: figure.sparkline.length - 1,
          fillColor: GOLD,
          strokeColor: '#f9fafb',
          size: 5,
        },
      ],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0,
        type: 'vertical',
        opacityFrom: 0.3,
        opacityTo: 0,
        stops: [0, 95],
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
      x: { show: false },
      y: { formatter: formatValue },
    },
  }

  return (
    <div className="mt-4">
      <Chart
        type="area"
        height={64}
        series={[{ name: figure.label, data: figure.sparkline.map((point) => point.value) }]}
        options={options}
      />
      <div className="mt-1 flex justify-between gap-5 text-[0.625rem] leading-4 text-[#667684]">
        <span>{first.period}</span>
        <span className="text-right font-semibold text-[#536472]">{last.period}</span>
      </div>
    </div>
  )
}
