import { ArrowDown, ArrowUp, Download, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { StateCoverageRow as StateRow } from '@/api/schemas/state-disco'
import { downloadCsv, toFilename } from '../lib/download-csv'
import { sortStateRows, type StateSortKey } from '../lib/state-rows'
import { FilterPills, type FilterOption } from './filter-pills'
import { SectionHeading } from './section-heading'
import { StateCoverageRow } from './state-coverage-row'

const ALL_ZONES = 'all'
const PREVIEW_COUNT = 10

const COLUMNS: readonly { key: StateSortKey; label: string; className: string }[] = [
  { key: 'state', label: 'State', className: 'text-left' },
  { key: 'coverageBarPercent', label: 'Delivery coverage', className: 'text-left' },
  { key: 'miniGridConnections', label: 'Mini-grid', className: 'hidden text-right md:table-cell' },
  { key: 'solarHomeSystems', label: 'Solar home systems', className: 'hidden text-right md:table-cell' },
  { key: 'activeProjects', label: 'Projects / programmes', className: 'hidden text-right lg:table-cell' },
]

/**
 * Delivery by state — the section a state commissioner or a journalist checks
 * first: did my state get anything?
 *
 * A TABLE, NOT A MAP. A Nigeria choropleth was the aspiration and remains the
 * right answer eventually. It is also the most expensive thing on this page and
 * the one most likely to sit half-finished, and the spec's own fallback is
 * explicit: a list that works beats a map that does not. What a table gives that
 * a first-attempt map does not is the thing this audience actually needs —
 * ordering, comparison and the underlying counts, all readable on a phone.
 *
 * SORT, FILTER, SEARCH, EXPORT. These are not dashboard habits imported by
 * reflex. Each answers a question a reader of this page genuinely arrives with:
 * where does my state rank, how is my zone doing, find my state, and let me put
 * these figures into something else. Anything beyond those four would be
 * interface for its own sake.
 *
 * The table opens on the ten highest and expands on request, because forty rows
 * of a ranking nobody asked to see in full pushes the rest of the page below a
 * wall of numbers.
 */
export function DeliveryInMotion({
  rows,
  asOf,
}: {
  rows: readonly StateRow[]
  /** The page's own snapshot date, used where a state has nothing validated of
   * its own yet — not an invented date. */
  asOf: string
}) {
  const [zone, setZone] = useState<string>(ALL_ZONES)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: StateSortKey; descending: boolean }>({
    key: 'coverageBarPercent',
    descending: true,
  })
  const [expanded, setExpanded] = useState(false)
  const searchId = useId()

  const zoneOptions = useMemo<FilterOption[]>(() => {
    const zones = [...new Set(rows.map((row) => row.zone))].sort((a, b) => a.localeCompare(b))
    return [
      { id: ALL_ZONES, label: 'All zones', meta: String(rows.length) },
      ...zones.map((name) => ({
        id: name,
        label: name,
        meta: String(rows.filter((row) => row.zone === name).length),
      })),
    ]
  }, [rows])

  const matched = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = rows.filter(
      (row) =>
        (zone === ALL_ZONES || row.zone === zone) &&
        (term === '' ||
          row.state.toLowerCase().includes(term) ||
          row.zone.toLowerCase().includes(term)),
    )
    return sortStateRows(filtered, sort.key, sort.descending)
  }, [rows, zone, query, sort])

  if (rows.length === 0) return null

  const visible = expanded ? matched : matched.slice(0, PREVIEW_COUNT)

  function toggleSort(key: StateSortKey) {
    setSort((current) =>
      current.key === key
        ? { key, descending: !current.descending }
        : { key, descending: key !== 'state' },
    )
  }

  return (
    <section aria-labelledby="delivery-in-motion" className="mt-14">
      <SectionHeading
        id="delivery-in-motion"
        index="04"
        title="Delivery by state"
        description="Validated distributed-energy delivery coverage for every state with an approved breakdown. Connection counts are not converted into a state-level access rate."
        controls={
          <FilterPills
            label="Filter states by geopolitical zone"
            options={zoneOptions}
            value={zone}
            onChange={(id) => {
              setZone(id)
              setExpanded(false)
            }}
          />
        }
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-center gap-2.5 border border-border-strong bg-surface px-3 py-2 sm:min-w-[18rem]">
          <Search aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
          <label htmlFor={searchId} className="sr-only">
            Find a state
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setExpanded(false)
            }}
            placeholder="Find a state"
            className="w-full min-w-0 bg-transparent text-[0.875rem] leading-5 text-text-default placeholder:text-text-subtle focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <p aria-live="polite" className="text-[0.8125rem] leading-5 text-text-muted">
            {matched.length} of {rows.length} states
          </p>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                toFilename('delivery by state'),
                [
                  'State',
                  'Zone',
                  'Coverage (%)',
                  'Mini-grid connections',
                  'Solar home systems',
                  'Active projects',
                  'Active programmes',
                  'Open bottlenecks',
                  'Validation',
                  'Validated by',
                  'Validated at',
                ],
                matched.map((row) => [
                  row.state,
                  row.zone,
                  row.coverageBarPercent,
                  row.miniGridConnections,
                  row.solarHomeSystems,
                  row.activeProjects,
                  row.activeProgrammes,
                  row.openBottlenecks,
                  row.validationLabel,
                  row.validatedBy,
                  row.validatedAt ?? asOf,
                ]),
              )
            }
            className="inline-flex items-center gap-1.5 border border-border-strong px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            <Download aria-hidden="true" className="size-3" />
            Data (CSV)
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse">
          <caption className="sr-only">
            States ranked by validated distributed-energy delivery coverage
          </caption>
          <thead>
            <tr className="border-y-2 border-text-default">
              <th
                scope="col"
                className="w-8 py-2.5 pr-3 text-left text-[0.6875rem] leading-4 font-bold tracking-[0.06em] text-text-muted uppercase"
              >
                <span className="sr-only">Rank</span>#
              </th>
              {COLUMNS.map((column) => {
                const isSorted = sort.key === column.key
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isSorted ? (sort.descending ? 'descending' : 'ascending') : 'none'}
                    className={`py-2.5 pr-4 text-[0.6875rem] leading-4 font-bold tracking-[0.06em] text-text-muted uppercase ${column.className}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-1 hover:text-text-default ${isSorted ? 'text-text-default' : ''}`}
                    >
                      {column.label}
                      {isSorted &&
                        (sort.descending ? (
                          <ArrowDown aria-hidden="true" className="size-3" />
                        ) : (
                          <ArrowUp aria-hidden="true" className="size-3" />
                        ))}
                    </button>
                  </th>
                )
              })}
              <th
                scope="col"
                className="py-2.5 pl-1 text-right text-[0.6875rem] leading-4 font-bold tracking-[0.06em] text-text-muted uppercase"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <StateCoverageRow key={row.id} row={row} rank={index + 1} asOf={asOf} />
            ))}
          </tbody>
        </table>
      </div>

      {matched.length === 0 && (
        <p className="mt-4 text-[0.875rem] leading-6 text-text-muted">
          No state matches that search. Every state with an approved delivery
          breakdown is listed under All zones.
        </p>
      )}

      {matched.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 text-[0.9375rem] leading-6 font-semibold text-link underline underline-offset-4 hover:no-underline"
        >
          {expanded ? 'Show top 10 only' : `Show all ${matched.length} states`}
        </button>
      )}
    </section>
  )
}
