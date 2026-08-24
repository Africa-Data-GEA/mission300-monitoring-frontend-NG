import { useMemo, useState } from 'react'
import { PILLARS, PILLAR_LABELS } from '@/api/schemas/common'
import { EvolutionChart, type EvolutionSeries } from './evolution-chart'
import { FilterPills, type FilterOption } from './filter-pills'
import { SectionHeading } from './section-heading'

const ALL = 'all'

/**
 * Every reporting series the payload carries, filterable by Compact pillar.
 *
 * WHY A FILTER AND NOT A CURATED SELECTION. Eight charts on one screen is more
 * than anyone reads, and the obvious fix — pick the three most flattering — is
 * the one thing a government record must not do. Filtering keeps every series
 * present and lets the reader narrow it themselves, so nothing is hidden and
 * nothing is chosen on their behalf.
 *
 * Pillars with no chartable series are not offered as options. An empty filter
 * result reads as a bug, and offering a control that produces one wastes the
 * reader's click to tell them nothing.
 *
 * A series needs at least two points to be a line. Anything shorter is a single
 * reading, which belongs in the headline strip above and not here.
 */
export function PerformanceEvolution({ series }: { series: readonly EvolutionSeries[] }) {
  const [pillar, setPillar] = useState<string>(ALL)

  const chartable = useMemo(() => series.filter((entry) => entry.points.length >= 2), [series])

  const options = useMemo<FilterOption[]>(() => {
    const populated = PILLARS.filter((id) => chartable.some((entry) => entry.pillar === id)).map((id) => ({
      id,
      label: PILLAR_LABELS[id],
      meta: String(chartable.filter((entry) => entry.pillar === id).length),
    }))
    return [{ id: ALL, label: 'All pillars', meta: String(chartable.length) }, ...populated]
  }, [chartable])

  const visible = pillar === ALL ? chartable : chartable.filter((entry) => entry.pillar === pillar)

  if (chartable.length === 0) return null

  return (
    <section aria-labelledby="performance-evolution" className="mt-14">
      <SectionHeading
        id="performance-evolution"
        index="03"
        title="How the indicators have moved"
        description="Every national indicator with more than one reporting period, plotted over its own real periods. Figures are not interpolated between reports."
        controls={
          options.length > 1 ? (
            <FilterPills
              label="Filter indicators by Compact pillar"
              options={options}
              value={pillar}
              onChange={setPillar}
            />
          ) : undefined
        }
      />

      <div className="mt-px grid gap-px bg-border-strong lg:grid-cols-2">
        {visible.map((entry) => (
          <EvolutionChart key={entry.id} series={entry} />
        ))}
      </div>
    </section>
  )
}
