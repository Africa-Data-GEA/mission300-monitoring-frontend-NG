import { useId, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { SelectField } from '@/components/ui/select-field'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import { PipelineReadinessBadge } from '@/features/programs/components/pipeline-readiness-badge'
import { deleteProject } from '@/features/programs/lib/project-admin-api'
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

/** Columns this table can be ordered by, beyond its worst-first default. */
type SortKey = 'status' | 'endDate' | 'name' | 'owner' | 'pillarLabel' | 'location'

/** Builds an "All X" + one-per-distinct-value option list for a text column. */
function toFilterOptions(
  projects: readonly OngoingProject[],
  select: (project: OngoingProject) => string,
  allLabel: string,
) {
  const unique = [...new Set(projects.map(select))].filter(Boolean).sort()
  return [{ value: 'all', label: allLabel }, ...unique.map((value) => ({ value, label: value }))]
}

/**
 * `onChanged` re-fetches the Overview payload after a project is removed —
 * stakeholder feedback asked to be able to add, modify and delete priority
 * items directly from this table. Add/edit navigate to their own page
 * (/programs/projects/new, /programs/projects/:id/edit) rather than opening
 * a modal here, per a follow-up ask.
 */
export function OngoingProjectsTable({
  projects,
  onChanged,
  statusFilter = null,
  onClearStatusFilter,
}: {
  projects: readonly OngoingProject[]
  onChanged: () => void
  /** Set when arriving here via the status donut's click-through — see
   * DeliveryStatusSection. */
  statusFilter?: OngoingProject['currentStatus'] | null
  onClearStatusFilter?: () => void
}) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const searchId = useId()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Review feedback: this table needs filtering by status/owner/pillar/
  // location and sorting by end date to be usable (docs/M300 Monitoring
  // Platform Feedback.pptx, slide 3). `statusFilter` above stays separate —
  // it is the donut chart's click-through, not one of these controls.
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [pillarFilter, setPillarFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [descending, setDescending] = useState(false)

  const ownerOptions = useMemo(
    () => toFilterOptions(projects, (project) => project.owner, 'All owners'),
    [projects],
  )
  const pillarOptions = useMemo(
    () => toFilterOptions(projects, (project) => project.pillarLabel, 'All pillars'),
    [projects],
  )
  const locationOptions = useMemo(
    () => toFilterOptions(projects, (project) => project.location, 'All locations'),
    [projects],
  )

  async function handleDelete(project: OngoingProject) {
    if (!window.confirm(`Remove "${project.name}" from the priority project register?`)) return
    setDeleteError('')
    setDeletingId(project.id)
    try {
      await deleteProject(project.id)
      onChanged()
    } catch {
      setDeleteError(`${project.name} could not be removed. Please try again.`)
    } finally {
      setDeletingId(null)
    }
  }

  // One reading of "now" for the whole table, taken once when it mounts.
  // Calling Date.now() inside the render body makes every deadline cell
  // depend on when React happened to re-render, so two rows could disagree
  // about whether the same date is overdue.
  const [now] = useState(() => new Date())

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    const matching = projects.filter((project) => {
      if (statusFilter && project.currentStatus !== statusFilter) return false
      if (ownerFilter !== 'all' && project.owner !== ownerFilter) return false
      if (pillarFilter !== 'all' && project.pillarLabel !== pillarFilter) return false
      if (locationFilter !== 'all' && project.location !== locationFilter) return false
      if (!query) return true

      return [
        project.id,
        project.name,
        project.programmeName,
        project.pillarLabel,
        project.owner,
        project.leadName,
        project.location,
        project.currentStatus.replace('-', ' '),
      ].some((value) => value.toLocaleLowerCase().includes(query))
    })

    const direction = descending ? -1 : 1
    return [...matching].sort((a, b) => {
      switch (sortKey) {
        case 'endDate':
          return (new Date(a.endDate).getTime() - new Date(b.endDate).getTime()) * direction
        case 'name':
          return a.name.localeCompare(b.name) * direction
        case 'owner':
          return a.owner.localeCompare(b.owner) * direction
        case 'pillarLabel':
          return a.pillarLabel.localeCompare(b.pillarLabel) * direction
        case 'location':
          return a.location.localeCompare(b.location) * direction
        default:
          // Worst first, so leadership meets the blocked and delayed projects
          // before the healthy ones. Within a status, the nearest deadline is
          // the more urgent one.
          return (
            (STATUS_SEVERITY[a.currentStatus] - STATUS_SEVERITY[b.currentStatus] ||
              new Date(a.endDate).getTime() - new Date(b.endDate).getTime()) * direction
          )
      }
    })
  }, [
    projects,
    search,
    statusFilter,
    ownerFilter,
    pillarFilter,
    locationFilter,
    sortKey,
    descending,
  ])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDescending((value) => !value)
      return
    }
    setSortKey(key)
    setDescending(false)
  }
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const firstIndex = (currentPage - 1) * PAGE_SIZE
  const visibleProjects = filteredProjects.slice(firstIndex, firstIndex + PAGE_SIZE)

  return (
    <div className="mt-3">
      {statusFilter && (
        <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
          <span>
            Showing only <span className="font-medium text-text-default">{statusFilter.replace('-', ' ')}</span> projects
          </span>
          {onClearStatusFilter && (
            <button
              type="button"
              onClick={onClearStatusFilter}
              className="font-medium text-link underline underline-offset-4"
            >
              Clear
            </button>
          )}
        </div>
      )}

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
        <SelectField
          label="Owner"
          value={ownerFilter}
          options={ownerOptions}
          onChange={(value) => {
            setOwnerFilter(value)
            setPage(1)
          }}
          className="w-full sm:w-44"
        />

        <SelectField
          label="Pillar"
          value={pillarFilter}
          options={pillarOptions}
          onChange={(value) => {
            setPillarFilter(value)
            setPage(1)
          }}
          className="w-full sm:w-40"
        />

        <SelectField
          label="Location"
          value={locationFilter}
          options={locationOptions}
          onChange={(value) => {
            setLocationFilter(value)
            setPage(1)
          }}
          className="w-full sm:w-40"
        />

        {/*
          Only while something is narrowing the list. The unfiltered total is
          already stated by the pagination summary below, and printing it here
          as well gave the card three separate counts of the same projects.
          The node stays mounted so the live region can announce into it.
        */}
        <p aria-live="polite" className="pb-2 text-xs text-text-muted">
          {search.trim() ||
          ownerFilter !== 'all' ||
          pillarFilter !== 'all' ||
          locationFilter !== 'all'
            ? `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'} found`
            : ''}
        </p>
        <Button type="button" size="sm" onClick={() => navigate('/programs/projects/new')}>
          <Plus aria-hidden="true" />
          Add project
        </Button>
      </div>

      {deleteError && (
        <p className="mb-3 text-sm text-status-at-risk" role="alert">
          {deleteError}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-surface-sunken text-xs font-medium text-text-muted">
            <tr>
              <SortableColumnHeader
                label="Project"
                active={sortKey === 'name'}
                descending={descending}
                onClick={() => toggleSort('name')}
              />
              <th className="px-3 py-2.5">Programme</th>
              <SortableColumnHeader
                label="Pillar"
                active={sortKey === 'pillarLabel'}
                descending={descending}
                onClick={() => toggleSort('pillarLabel')}
              />
              <SortableColumnHeader
                label="Owner"
                active={sortKey === 'owner'}
                descending={descending}
                onClick={() => toggleSort('owner')}
              />
              <th className="px-3 py-2.5">Lead</th>
              <SortableColumnHeader
                label="Location"
                active={sortKey === 'location'}
                descending={descending}
                onClick={() => toggleSort('location')}
              />
              <SortableColumnHeader
                label="End date"
                active={sortKey === 'endDate'}
                descending={descending}
                onClick={() => toggleSort('endDate')}
              />
              <SortableColumnHeader
                label="Status"
                active={sortKey === 'status'}
                descending={descending}
                onClick={() => toggleSort('status')}
              />
              <th className="px-3 py-2.5">Comment</th>
              <th className="px-3 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
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
                <td className="px-3 py-3 text-sm text-text-muted">{project.leadName}</td>
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
                  <div className="flex flex-col items-start gap-1">
                    <ExecutionStatusBadge status={project.currentStatus} />
                    {project.pipelineReadiness && (
                      <PipelineReadinessBadge readiness={project.pipelineReadiness} />
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-text-muted">
                  <span className="line-clamp-2 max-w-[220px]" title={project.comment || undefined}>
                    {project.comment || '—'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/programs/projects/${project.id}/edit`)}
                      aria-label={`Edit ${project.name}`}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={deletingId === project.id}
                      onClick={() => void handleDelete(project)}
                      aria-label={`Remove ${project.name}`}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
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
