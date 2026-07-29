import { useId, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { Pagination } from '@/components/ui/pagination'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import type { OngoingProject } from '../types'

const PAGE_SIZE = 5
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function OngoingProjectsTable({ projects }: { projects: readonly OngoingProject[] }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const searchId = useId()
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return projects

    return projects.filter((project) =>
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
  }, [projects, search])
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
        <p aria-live="polite" className="pb-2 text-xs text-text-muted">
          {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} found
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
                    className="font-semibold text-[#175cd3] underline decoration-[#84adff] underline-offset-4 transition-colors hover:text-[#004eeb] hover:decoration-[#004eeb]"
                  >
                    {project.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-muted">{project.id}</p>
                </td>
                <td className="px-3 py-3 text-sm">
                  <Link
                    to={`/programs/${project.programmeId}`}
                    className="font-medium text-[#175cd3] underline decoration-[#84adff] underline-offset-4 transition-colors hover:text-[#004eeb] hover:decoration-[#004eeb]"
                  >
                    {project.programmeName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.pillarLabel}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.owner}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{project.location}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-text-muted">
                  {dateFormatter.format(new Date(project.endDate))}
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
