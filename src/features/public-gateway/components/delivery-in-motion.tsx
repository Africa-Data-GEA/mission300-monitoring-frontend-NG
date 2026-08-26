import { Download, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { StateCoverageRow as StateRow } from '@/api/schemas/state-disco'
import { downloadCsv, toFilename } from '../lib/download-csv'
import { FilterPills, type FilterOption } from './filter-pills'
import { StateCoverageRow } from './state-coverage-row'

const ALL_ZONES = 'all'
const PREVIEW_COUNT = 10

export function DeliveryInMotion({
  rows,
  asOf,
}: {
  rows: readonly StateRow[]
  asOf: string
}) {
  const [zone, setZone] = useState<string>(ALL_ZONES)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const searchId = useId()

  const zoneOptions = useMemo<FilterOption[]>(() => {
    const zones = [...new Set(rows.map((row) => row.zone))].sort((a, b) => a.localeCompare(b))
    return [
      { id: ALL_ZONES, label: 'All zones' },
      ...zones.map((name) => ({ id: name, label: name })),
    ]
  }, [rows])

  const matched = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows
      .filter(
        (row) =>
          (zone === ALL_ZONES || row.zone === zone) &&
          (term === '' || row.state.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.coverageBarPercent - a.coverageBarPercent)
  }, [rows, zone, query])

  if (rows.length === 0) return null

  const visible = expanded ? matched : matched.slice(0, PREVIEW_COUNT)

  return (
    <section aria-labelledby="delivery-in-motion" className="bg-landing-deep-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div>
          <h2
            id="delivery-in-motion"
            className="text-[1.875rem] leading-9 font-semibold tracking-tight text-white sm:text-[2.25rem] sm:leading-10"
          >
            Delivery by state
          </h2>
          <p className="mt-2 text-[0.75rem] leading-5 text-white/55">
            Connection counts are not converted into a state-level access rate.
          </p>
        </div>

        <FilterPills
          label="Filter states by geopolitical zone"
          options={zoneOptions}
          value={zone}
          onChange={(id) => {
            setZone(id)
            setExpanded(false)
          }}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.6875rem] leading-4 font-medium tracking-[0.06em] text-white/50 uppercase">
          {matched.length} {matched.length === 1 ? 'state' : 'states'} ranked by delivery coverage
        </p>

        <div className="flex items-center gap-4">
          {rows.length > 6 && (
            <div className="flex items-center gap-2 border-b border-white/25 py-1.5">
              <Search aria-hidden="true" className="size-3.5 text-white/45" />
              <label htmlFor={searchId} className="sr-only">Find a state</label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setExpanded(false)
                }}
                placeholder="Find a state"
                className="w-32 bg-transparent text-[0.75rem] leading-5 text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              downloadCsv(
                toFilename('delivery by state'),
                ['State', 'Zone', 'Coverage (%)', 'Mini-grid connections', 'Solar home systems', 'Active projects', 'Active programmes', 'Validation'],
                matched.map((row) => [
                  row.state,
                  row.zone,
                  row.coverageBarPercent,
                  row.miniGridConnections,
                  row.solarHomeSystems,
                  row.activeProjects,
                  row.activeProgrammes,
                  row.validationLabel,
                ]),
              )
            }
            className="inline-flex items-center gap-1.5 text-[0.6875rem] leading-4 font-medium text-white/55 transition-colors hover:text-white"
          >
            <Download aria-hidden="true" className="size-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div className="mt-2 bg-white/[0.06] px-3 sm:px-5">
        {visible.map((row, index) => (
          <StateCoverageRow key={row.id} row={row} rank={index + 1} asOf={asOf} />
        ))}
      </div>

      {matched.length === 0 && (
        <p className="mt-5 text-[0.8125rem] leading-5 text-white/60">No state matches this view.</p>
      )}

      {matched.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 text-[0.75rem] leading-5 font-semibold text-landing-gold hover:underline"
        >
          {expanded ? 'Show top 10' : `Show all ${matched.length} states`}
        </button>
      )}
      </div>
    </section>
  )
}
