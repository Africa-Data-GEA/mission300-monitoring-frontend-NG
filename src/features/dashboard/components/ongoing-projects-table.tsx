import { Fragment, useId, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { SelectField } from '@/components/ui/select-field'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { deleteProject } from '@/features/programs/lib/project-admin-api'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { groupProjectsByProgramme, STATUS_SEVERITY } from '../lib/group-projects-by-programme'
import type { OngoingProject } from '../types'
import { OngoingProjectRow } from './ongoing-project-row'
import { ProgrammeGroupRow } from './programme-group-row'

/** Programmes per page. */
const PAGE_SIZE = 5

/** Columns this table can be ordered by, beyond its worst-first default. */
type SortKey = 'status' | 'endDate' | 'name' | 'pillar'

/**
 * Sort key for a projected completion date. A project with no recorded date
 * sorts last rather than first — an absent deadline is not an imminent one.
 */
function deadlineTime(endDate: string | null): number {
  return endDate ? new Date(endDate).getTime() : Number.POSITIVE_INFINITY
}

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
 * Priority projects grouped under their programme, worst first. Filters and
 * search work on projects; sorting and pagination work on programmes.
 * Programmes start closed and open on their own while something is narrowing
 * the list, so a match is never hidden inside a closed row.
 *
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
  /** Set when arriving here via the status chart's click-through — see
   * DeliveryStatusSection. */
  statusFilter?: OngoingProject['currentStatus'] | null
  onClearStatusFilter?: () => void
}) {
  const navigate = useNavigate()
  const session = readAuthSession()
  const canManageProjects = !!session && canUserReachModule(session.user, 'programs')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const searchId = useId()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Review feedback: this table needs filtering by status/owner/pillar/
  // location and sorting by end date to be usable (docs/M300 Monitoring
  // Platform Feedback.pptx, slide 3). `statusFilter` above stays separate —
  // it is the chart's click-through, not one of these controls.
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [pillarFilter, setPillarFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [descending, setDescending] = useState(false)
  /** Programmes the reader has opened or closed, overriding the default. */
  const [toggled, setToggled] = useState<ReadonlySet<string>>(new Set())

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

    // Worst first within a programme; within a status, the nearest deadline is
    // the more urgent one.
    return matching.sort(
      (a, b) =>
        STATUS_SEVERITY[a.currentStatus] - STATUS_SEVERITY[b.currentStatus] ||
        deadlineTime(a.endDate) - deadlineTime(b.endDate),
    )
  }, [projects, search, statusFilter, ownerFilter, pillarFilter, locationFilter])

  const groups = useMemo(() => {
    const direction = descending ? -1 : 1
    return groupProjectsByProgramme(filteredProjects).sort((a, b) => {
      switch (sortKey) {
        case 'endDate':
          return (deadlineTime(a.endDate) - deadlineTime(b.endDate)) * direction
        case 'name':
          return a.programmeName.localeCompare(b.programmeName) * direction
        case 'pillar':
          return a.pillarLabels.join().localeCompare(b.pillarLabels.join()) * direction
        default:
          // Worst first, so leadership meets the programmes holding blocked
          // and delayed projects before the healthy ones.
          return (
            (STATUS_SEVERITY[a.worstStatus] - STATUS_SEVERITY[b.worstStatus] ||
              a.programmeName.localeCompare(b.programmeName)) * direction
          )
      }
    })
  }, [filteredProjects, sortKey, descending])

  const isFiltering = Boolean(
    search.trim() || ownerFilter !== 'all' || pillarFilter !== 'all' || locationFilter !== 'all',
  )
  const openByDefault = isFiltering || statusFilter !== null

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDescending((value) => !value)
      return
    }
    setSortKey(key)
    setDescending(false)
  }

  function toggleProgramme(programmeId: string) {
    setToggled((current) => {
      const next = new Set(current)
      if (!next.delete(programmeId)) next.add(programmeId)
      return next
    })
  }

  /** Applies a filter change and returns the list to its default state. */
  function narrow(apply: (value: string) => void) {
    return (value: string) => {
      apply(value)
      setPage(1)
      setToggled(new Set())
    }
  }

  const pageCount = Math.max(1, Math.ceil(groups.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const firstIndex = (currentPage - 1) * PAGE_SIZE
  const visibleGroups = groups.slice(firstIndex, firstIndex + PAGE_SIZE)

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
              onChange={(event) => narrow(setSearch)(event.target.value)}
              placeholder="Project, programme, owner or location"
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
            />
          </div>
        </div>
        <SelectField
          label="Owner"
          value={ownerFilter}
          options={ownerOptions}
          onChange={narrow(setOwnerFilter)}
          className="w-full sm:w-44"
        />

        <SelectField
          label="Pillar"
          value={pillarFilter}
          options={pillarOptions}
          onChange={narrow(setPillarFilter)}
          className="w-full sm:w-40"
        />

        <SelectField
          label="Location"
          value={locationFilter}
          options={locationOptions}
          onChange={narrow(setLocationFilter)}
          className="w-full sm:w-40"
        />

        {/*
          Only while something is narrowing the list. The unfiltered total is
          already stated by the pagination summary below, and printing it here
          as well gave the card three separate counts of the same projects.
          The node stays mounted so the live region can announce into it.
        */}
        <p aria-live="polite" className="pb-2 text-xs text-text-muted">
          {isFiltering
            ? `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'} found`
            : ''}
        </p>
        {canManageProjects && (
          <Button type="button" size="sm" onClick={() => navigate('/programs/projects/new')}>
            <Plus aria-hidden="true" />
            Add project
          </Button>
        )}
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
                label="Programme / project"
                active={sortKey === 'name'}
                descending={descending}
                onClick={() => toggleSort('name')}
              />
              <SortableColumnHeader
                label="Pillar"
                active={sortKey === 'pillar'}
                descending={descending}
                onClick={() => toggleSort('pillar')}
              />
              <th className="px-3 py-2.5">Owner</th>
              <th className="px-3 py-2.5">Lead</th>
              <th className="px-3 py-2.5">Location</th>
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
            {visibleGroups.map((group) => {
              const expanded = openByDefault !== toggled.has(group.programmeId)
              return (
                <Fragment key={group.programmeId}>
                  <ProgrammeGroupRow
                    group={group}
                    expanded={expanded}
                    onToggle={() => toggleProgramme(group.programmeId)}
                  />
                  {expanded &&
                    group.projects.map((project) => (
                      <OngoingProjectRow
                        key={project.id}
                        project={project}
                        now={now}
                        canManage={canManageProjects}
                        deleting={deletingId === project.id}
                        onDelete={() => void handleDelete(project)}
                      />
                    ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {search ? `No projects match “${search}”.` : 'No ongoing projects found.'}
        </p>
      ) : (
        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          total={groups.length}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
