import { InfoPopover } from '@/components/ui/info-popover'
import { CONFIDENCE_LABELS, type KpiFigure } from '../lib/headline-figures'
import { FigureTrend } from './figure-trend'
import { KpiMiniChart } from './kpi-mini-chart'

/**
 * One national snapshot cell. The face is intentionally limited to the
 * published value, period, movement and one compact Apex chart. Definition,
 * methodology and provenance remain available through the info control.
 */
export function KpiCard({ figure }: { figure: KpiFigure }) {
  const displayValue = splitDisplayValue(figure.value)

  return (
    <article
      id={`figure-${figure.id}`}
      className="flex min-h-[18rem] flex-col bg-[#f9fafb] px-5 py-5 sm:px-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[15rem] text-[0.75rem] leading-5 font-bold tracking-[0.04em] text-[#536472] uppercase">
          {figure.label}
        </p>
        <InfoPopover
          label={`About ${figure.label}`}
          provenance={figure.provenance}
          details={[
            { label: 'Reporting period', value: figure.period },
            { label: 'Data confidence', value: CONFIDENCE_LABELS[figure.source] },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <p className="font-landing-figure text-[3rem] leading-[0.9] font-semibold tracking-tight text-landing-navy tabular-nums sm:text-[3.5rem]">
          {displayValue.number}
          {displayValue.unit && (
            <span className="text-landing-gold">
              {displayValue.hasSpace ? ' ' : ''}
              {displayValue.unit}
            </span>
          )}
        </p>
        <p className="pb-1 text-[0.6875rem] leading-4 font-semibold text-[#667684]">{figure.period}</p>
      </div>

      {figure.trend && <FigureTrend trend={figure.trend} className="mt-3 !text-[0.8125rem]" />}

      <div className="mt-auto">
        <KpiMiniChart figure={figure} />
        {figure.context && (
          <p className="mt-3 text-[0.6875rem] leading-4 text-[#667684]">{figure.context}</p>
        )}
      </div>
    </article>
  )
}

function splitDisplayValue(value: string): {
  number: string
  unit: string
  hasSpace: boolean
} {
  const match = value.match(/^([+-]?[\d,.]+)(\s*)(.*)$/)
  if (!match) return { number: value, unit: '', hasSpace: false }

  return {
    number: match[1] ?? value,
    unit: match[3] ?? '',
    hasSpace: Boolean(match[2]),
  }
}
