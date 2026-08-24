import { InfoPopover } from '@/components/ui/info-popover'
import {
  CONFIDENCE_DOT_CLASSES,
  CONFIDENCE_LABELS,
  type KpiFigure,
} from '../lib/headline-figures'
import { FigureTrack } from './figure-track'
import { FigureTrend } from './figure-trend'
import { KpiSparkline } from './kpi-sparkline'

/**
 * One cell of the national headline strip.
 *
 * READING ORDER IS THE DESIGN. Confidence and period first, then the figure,
 * then movement, then position against target. A reader who stops after two
 * lines has still learned the two things that decide whether the number can be
 * quoted — how good the data is, and what period it describes. Putting the big
 * number first and the caveats last optimises for the reader who quotes it
 * wrongly.
 *
 * The card has no border of its own: the strip draws its dividers with a 1px
 * grid gap, so four cards read as one instrument rather than four tiles.
 */
export function KpiCard({ figure }: { figure: KpiFigure }) {
  return (
    <div id={`figure-${figure.id}`} className="flex flex-col bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[0.6875rem] leading-4 font-semibold tracking-[0.06em] text-text-muted uppercase">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-pill ${CONFIDENCE_DOT_CLASSES[figure.source]}`}
          />
          {CONFIDENCE_LABELS[figure.source]}
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

      <p className="mt-3 text-[0.9375rem] leading-5 font-bold text-text-default">{figure.label}</p>
      <p className="mt-0.5 text-[0.75rem] leading-4 text-text-subtle">{figure.period}</p>

      <p className="mt-3 text-[2.5rem] leading-none font-bold tracking-tight text-text-default tabular-nums">
        {figure.value}
      </p>

      {figure.trend && <FigureTrend trend={figure.trend} className="mt-2.5" />}

      {figure.track ? (
        <FigureTrack track={figure.track} label={figure.label} />
      ) : figure.sparkline.length >= 2 ? (
        <KpiSparkline points={figure.sparkline} label={figure.label} />
      ) : null}

      <p className="mt-3 border-t border-border-default pt-2.5 text-[0.75rem] leading-4 text-text-muted">
        {figure.context}
      </p>
    </div>
  )
}
