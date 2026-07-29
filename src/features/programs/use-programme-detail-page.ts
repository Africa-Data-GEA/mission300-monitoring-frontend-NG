import { useState } from 'react'
import type { ProjectsQuery } from '@/api/schemas/programs'
import { useProgramme, useProgrammeProjects } from './api'

const DEFAULT_QUERY: Required<ProjectsQuery> = { search: '', status: 'all' }

export function useProgrammeDetailPage(programmeId: string) {
  const [query, setQuery] = useState<Required<ProjectsQuery>>(DEFAULT_QUERY)
  const [page, setPage] = useState(1)

  const programme = useProgramme(programmeId)
  const projects = useProgrammeProjects(programmeId, query, { page, pageSize: 10 })

  function changeQuery(next: Required<ProjectsQuery>) {
    setQuery(next)
    setPage(1)
  }

  return {
    query,
    changeQuery,
    programme: programme.data,
    projects: projects.data,
    isPending: programme.isPending || projects.isPending,
    isError: programme.isError || projects.isError,
    error:
      programme.error ??
      projects.error ??
      new Error('The programme could not be loaded.'),
    retry: () => {
      void programme.refetch()
      void projects.refetch()
    },
    setPage,
  }
}
