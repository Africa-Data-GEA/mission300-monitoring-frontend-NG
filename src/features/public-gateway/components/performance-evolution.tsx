import { AreaChart, ArrowDownRight, ArrowUpRight, BarChart3, Minus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PILLARS, PILLAR_LABELS } from '@/api/schemas/common'
import type { EvolutionSeries } from './evolution-chart'
import { EvolutionTrackerChart, type EvolutionChartView } from './evolution-tracker-chart'
import { FilterPills, type FilterOption } from './filter-pills'

const ALL = 'all'

type Movement = 'forward' | 'attention' | 'flat'

/**
 * A focused public-facing Compact tracker. One selected indicator receives the
 * chart area; the remaining indicators act as a clear index, not competing
 * chart cards. This keeps unlike units and targets out of the same visual.
 */
export function PerformanceEvolution({ series }: { series: readonly EvolutionSeries[] }) {
  const [pillar, setPillar] = useState<string>(ALL)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [chartViews, setChartViews] = useState<Record<string, EvolutionChartView>>({})

  const chartable = useMemo(() => series.filter((entry) => entry.points.length >= 2), [series])

  const options = useMemo<FilterOption[]>(() => {
    const populated = PILLARS.filter((id) => chartable.some((entry) => entry.pillar === id)).map((id) => ({
      id,
      label: PILLAR_LABELS[id],
      meta: String(chartable.filter((entry) => entry.pillar === id).length),
    }))
    return [{ id: ALL, label: 'All indicators', meta: String(chartable.length) }, ...populated]
  }, [chartable])

  const visible = useMemo(
    () => (pillar === ALL ? chartable : chartable.filter((entry) => entry.pillar === pillar)),
    [chartable, pillar],
  )

  const active = visible.find((entry) => entry.id === selectedId) ?? visible[0]
  if (!active || chartable.length === 0) return null

  const forwardCount = visible.filter((entry) => movementOf(entry) === 'forward').length
  const attentionCount = visible.filter((entry) => movementOf(entry) === 'attention').length
  const activeMovement = movementOf(active)
  const activeValue = splitDisplayValue(active.value)
  const activeChartView = chartViews[active.id] ?? 'area'

  return (
    <section aria-labelledby="performance-evolution" className="bg-[#f7f9fb] py-16 sm:py-20">
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <h2
              id="performance-evolution"
              className="max-w-[42rem] text-[1.875rem] leading-9 font-semibold tracking-tight text-landing-navy sm:text-[2.25rem] sm:leading-10"
            >
              How the indicators are moving
            </h2>
          </div>

          <div className="flex items-center gap-5 pb-1 text-[0.75rem] leading-5">
            <span className="flex items-center gap-1.5 font-semibold text-landing-navy">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-landing-gold" />
              {forwardCount} moving forward
            </span>
            {attentionCount > 0 && (
              <span className="flex items-center gap-1.5 font-medium text-[#667684]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[#7f95a5]" />
                {attentionCount} need attention
              </span>
            )}
          </div>
        </div>

        <div className="mt-7">
          <FilterPills
            label="Filter Compact tracker by pillar"
            options={options}
            value={pillar}
            onChange={(id) => {
              setPillar(id)
              setSelectedId(null)
            }}
          />
        </div>

        <div className="mt-5 overflow-hidden bg-white lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="bg-landing-navy p-3 text-white sm:p-4">
            <p className="px-3 pb-3 text-[0.625rem] leading-4 font-bold tracking-[0.12em] text-white/50 uppercase">
              Choose an indicator
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {visible.map((entry) => {
                const selected = entry.id === active.id
                const movement = movementOf(entry)
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedId(entry.id)}
                    className={`group w-full border-l-2 px-3 py-3 text-left transition-colors ${
                      selected
                        ? 'border-landing-gold bg-white text-landing-navy'
                        : 'border-transparent text-white hover:border-white/30 hover:bg-white/7'
                    }`}
                  >
                    <span className={`block text-[0.75rem] leading-5 font-medium ${selected ? 'text-[#536472]' : 'text-white/72'}`}>
                      {entry.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-3">
                      <span className="font-landing-figure text-[1.25rem] leading-6 font-semibold tabular-nums">
                        {entry.value}
                      </span>
                      <MovementMark movement={movement} selected={selected} />
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0 bg-white px-5 py-6 sm:px-7 sm:py-7 lg:px-9">
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
              <div className="min-w-0 max-w-[34rem]">
                <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-landing-blue uppercase">
                  {active.pillar ? PILLAR_LABELS[active.pillar] : 'National indicator'}
                </p>
                <h3 className="mt-1.5 text-[1.25rem] leading-7 font-semibold tracking-tight text-landing-navy">
                  {active.title}
                </h3>
                <p className="mt-1 text-[0.75rem] leading-5 text-[#667684]">{active.unit}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[0.625rem] leading-4 font-bold tracking-[0.1em] text-[#667684] uppercase">
                  Latest reading
                </p>
                <p className="font-landing-figure mt-1 text-[2.5rem] leading-none font-semibold tracking-tight text-landing-navy tabular-nums">
                  {activeValue.number}
                  {activeValue.unit && (
                    <span className="text-landing-gold">
                      {activeValue.hasSpace ? ' ' : ''}
                      {activeValue.unit}
                    </span>
                  )}
                </p>
                <MovementMark movement={activeMovement} selected showLabel />
                <div
                  role="group"
                  aria-label={`Chart type for ${active.title}`}
                  className="mt-3 inline-flex rounded-[0.5rem] bg-[#edf2f5] p-1"
                >
                  {([
                    { id: 'area' as const, label: 'Area', Icon: AreaChart },
                    { id: 'bar' as const, label: 'Bar', Icon: BarChart3 },
                  ]).map(({ id, label, Icon }) => {
                    const selected = activeChartView === id
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setChartViews((current) => ({ ...current, [active.id]: id }))
                        }
                        className={`inline-flex items-center gap-1.5 rounded-[0.375rem] px-2.5 py-1.5 text-[0.6875rem] leading-4 font-semibold transition-colors ${
                          selected
                            ? 'bg-landing-blue text-white'
                            : 'text-[#667684] hover:bg-white hover:text-landing-blue'
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-3.5" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <EvolutionTrackerChart series={active} view={activeChartView} />
          </div>
        </div>
      </div>
    </section>
  )
}

function movementOf(series: EvolutionSeries): Movement {
  const first = series.points[0]
  const last = series.points.at(-1)
  if (!first || !last || first.value === last.value) return 'flat'

  const rose = last.value > first.value
  const improved = series.direction === 'lower-is-better' ? !rose : rose
  return improved ? 'forward' : 'attention'
}

function MovementMark({
  movement,
  selected,
  showLabel = false,
}: {
  movement: Movement
  selected: boolean
  showLabel?: boolean
}) {
  const Icon = movement === 'forward' ? ArrowUpRight : movement === 'attention' ? ArrowDownRight : Minus
  const label = movement === 'forward' ? 'Moving forward' : movement === 'attention' ? 'Needs attention' : 'No movement'
  const color = selected
    ? movement === 'forward'
      ? 'text-landing-gold-text'
      : 'text-[#667684]'
    : movement === 'forward'
      ? 'text-landing-gold'
      : 'text-white/55'

  return (
    <span className={`inline-flex items-center gap-1 text-[0.6875rem] leading-4 font-semibold ${color}`}>
      <Icon aria-hidden="true" className="size-3.5" />
      {showLabel && label}
      {!showLabel && <span className="sr-only">{label}</span>}
    </span>
  )
}

function splitDisplayValue(value: string): { number: string; unit: string; hasSpace: boolean } {
  const match = value.match(/^([+-]?[\d,.]+)(\s*)(.*)$/)
  if (!match) return { number: value, unit: '', hasSpace: false }
  return { number: match[1] ?? value, unit: match[3] ?? '', hasSpace: Boolean(match[2]) }
}
