import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createMilestoneResponseSchema,
  milestoneRecordSchema,
  programmeRecordSchema,
  programsFilterOptionsSchema,
  programsOverviewSchema,
  projectRecordSchema,
  type CreateMilestoneRequest,
  type ProgramsPagination,
  type ProgramsQuery,
  type ProjectsQuery,
} from '@/api/schemas/programs'
import { paginated } from '@/api/schemas/administration'
import { bottleneckRecordSchema } from '@/api/schemas/bottlenecks'
import { api } from '@/lib/api-client'

export const programsKeys = {
  all: ['programs'] as const,
  overview: (query: ProgramsQuery) => [...programsKeys.all, 'overview', query] as const,
  filters: () => [...programsKeys.all, 'filters'] as const,
  programme: (id: string) => [...programsKeys.all, 'programme', id] as const,
  projects: (programmeId: string, query: ProjectsQuery) =>
    [...programsKeys.all, 'projects', programmeId, query] as const,
  project: (id: string) => [...programsKeys.all, 'project', id] as const,
  milestones: (projectId: string) => [...programsKeys.all, 'milestones', projectId] as const,
  bottlenecks: (projectId: string) => [...programsKeys.all, 'bottlenecks', projectId] as const,
}

const DEFAULT_PAGINATION: ProgramsPagination = { page: 1, pageSize: 10 }

function toSearchParams(
  query: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return `?${params.toString()}`
}

/** Option lists for this page's own three filters. */
export function useProgramsFilters() {
  return useQuery({
    queryKey: programsKeys.filters(),
    queryFn: () => api.get('/programs/filters', programsFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function usePrograms(
  query: ProgramsQuery = {},
  pagination: ProgramsPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...programsKeys.overview(query), pagination],
    queryFn: () =>
      api.get(`/programs${toSearchParams({ ...query, ...pagination })}`, programsOverviewSchema),
    placeholderData: keepPreviousData,
  })
}

/** A single programme's detail header. */
export function useProgramme(programmeId: string) {
  return useQuery({
    queryKey: programsKeys.programme(programmeId),
    queryFn: () => api.get(`/programs/${programmeId}`, programmeRecordSchema),
    enabled: Boolean(programmeId),
  })
}

/** The projects delivering one programme. */
export function useProgrammeProjects(
  programmeId: string,
  query: ProjectsQuery = {},
  pagination: ProgramsPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...programsKeys.projects(programmeId, query), pagination],
    queryFn: () =>
      api.get(
        `/programs/${programmeId}/projects${toSearchParams({ ...query, ...pagination })}`,
        paginated(projectRecordSchema),
      ),
    enabled: Boolean(programmeId),
    placeholderData: keepPreviousData,
  })
}

/** A single project's full profile. */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: programsKeys.project(projectId),
    queryFn: () => api.get(`/programs/projects/${projectId}`, projectRecordSchema),
    enabled: Boolean(projectId),
  })
}

/** The milestones for one project. */
export function useProjectMilestones(projectId: string, page: number) {
  return useQuery({
    queryKey: [...programsKeys.milestones(projectId), page],
    queryFn: () =>
      api.get(
        `/programs/projects/${projectId}/milestones${toSearchParams({ page, pageSize: 10 })}`,
        paginated(milestoneRecordSchema),
      ),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  })
}

export function createMilestone(projectId: string, input: CreateMilestoneRequest) {
  return api.post(
    `/programs/projects/${projectId}/milestones`,
    input,
    createMilestoneResponseSchema,
  )
}

/** The bottlenecks linked to one project. */
export function useProjectBottlenecks(projectId: string, page: number) {
  return useQuery({
    queryKey: [...programsKeys.bottlenecks(projectId), page],
    queryFn: () =>
      api.get(
        `/bottlenecks/by-project/${projectId}${toSearchParams({ page, pageSize: 10 })}`,
        paginated(bottleneckRecordSchema),
      ),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  })
}
