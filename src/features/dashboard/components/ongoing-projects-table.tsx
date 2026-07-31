import { useId, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { Pagination } from '@/components/ui/pagination'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import { formatDeadline } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OngoingProject } from '../types'

const PAGE_SIZE = 5
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/**
 * Worst first. This table is the delivery-exceptions half of Section D, so
 * leadership must meet the blocked and delayed projects before the healthy
 * ones — and because the list is paginated at five, an unsorted order can push
 * a blocked project onto page two where nobody looks.
 *
 * `currentStatus` excludes 'completed' at the schema level, so this map is
 * total over the statuses that can actually appear here.
 */
const STATUS_SEVERITY: Record<OngoingProject['currentStatus'], number> = {
  blocked: 0,
  delayed: 1,
  'at-risk': 2,
  'on-track': 3,
}

export function OngoingProjectsTable({ projects }: { projects: readonly OngoingProject[] }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const searchId = useId()

  // One reading of "now" for the whole table, taken once when it mounts.
  // Calling Date.now() inside the render body makes every deadline cell
  // depend on when React happened to re-render, so two rows could disagree
  // about whether the same date is overdue.
  const [now] = useState(() => new Date())

  // Ranked once, before filtering, so search results keep the same worst-first
  // order rather than falling back to whatever order the API returned.
  const rankedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          STATUS_SEVERITY[a.currentStatus] - STATUS_SEVERITY[b.currentStatus] ||
          // Within a status, the nearest deadline is the more urgent one.
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      ),
    [projects],
  )

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return rankedProjects

    return rankedProjects.filter((project) =>
      [
        project.id,
        project.name,
        project.programmeName,
        project.pillarLabel,
        project.owner,
        project.location,
        project.currentStatus.replace('-', ' '),
      ].some((value) => value.toLocaleLowerCase().includes(query)),
    )
  }, [rankedProjects, search])
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const firstIndex = (currentPage - 1) * PAGE_SIZE
  const visibleProjects = filteredProjects.slice(firstIndex, firstIndex + PAGE_SIZE)

  return (
    <div className="mt-3">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 rounded-lg bg-surface-sunken p-3">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label htmlFor={searchId} className="mb-1.5 block text-xs font-medium text-text-muted">
            Search projects
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
            />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Project, programme, owner or location"
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
            />
          </div>
        </div>
        {/*
          Only while a search is active. The unfiltered total is already stated
          by the pagination summary below, and printing it here as well gave
          the card three separate counts of the same six projects. The node
          stays mounted so the live region can announce into it.
        */}
        <p aria-live="polite" className="pb-2 text-xs text-text-muted">
          {search.trim()
            ? `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'} found`
            : ''}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-surface-sunken text-xs font-medium text-text-muted">
            <tr>
              <th className="px-3 py-2.5">Project</th>
              <th className="px-3 py-2.5">Programme</th>
              <th className="px-3 py-2.5">Pillar</th>
              <th className="px-3 py-2.5">Owner</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">End date</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default bg-surface-card">
            {visibleProjects.map((project) => (
              <tr key={project.id} className="align-top hover:bg-surface-subtle">
                <td className="px-3 py-3">
                  <Link
                    to={`/programs/projects/${project.id}`}
                    className="font-semibold text-link underline decoration-chart-blue-light underline-offset-4 transition-colors hover:text-chart-blue-darkest hover:decoration-chart-blue-darkest"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-sm">
                  <Link
                    to={`/programs/${project.programmeId}`}
                    className="font-medium text-link underline decoration-chart-blue-light underline-offset-4 transition-colors hover:text-chart-blue-darkest hover:decoration-chart-blue-darkest"
                  >
                    {project.programmeName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.pillarLabel}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.owner}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.location}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-text-muted">
                  {dateFormatter.format(new Date(project.endDate))}
                  {/*
                    An absolute date alone makes the reader do the arithmetic.
                    For a row already flagged delayed, the overdue span is the
                    number that matters, so it is tinted to match the badge.
                  */}
                  <span
                    className={cn(
                      'mt-0.5 block text-xs',
                      new Date(project.endDate).getTime() < now.getTime()
                        ? 'font-medium text-status-at-risk'
                        : 'text-text-subtle',
                    )}
                  >
                    {formatDeadline(project.endDate, now)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <ExecutionStatusBadge status={project.currentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {search ? `No projects match “${search}”.` : 'No ongoing projects found.'}
        </p>
      ) : (
        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          total={filteredProjects.length}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
