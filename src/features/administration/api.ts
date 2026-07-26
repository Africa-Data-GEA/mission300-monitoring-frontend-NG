import { useQuery } from '@tanstack/react-query'
import {
  administrationFilterOptionsSchema,
  administrationOverviewSchema,
  inviteUserResponseSchema,
  type InviteUserRequest,
  type AdministrationQuery,
} from '@/api/schemas/administration'
import { api } from '@/lib/api-client'

export const administrationKeys = {
  all: ['administration'] as const,
  overview: (query: AdministrationQuery) =>
    [...administrationKeys.all, 'overview', query] as const,
  filters: () => [...administrationKeys.all, 'filters'] as const,
}

export interface AdministrationPagination {
  usersPage: number
  scopePage: number
  auditPage: number
  pageSize: number
}

const DEFAULT_PAGINATION: AdministrationPagination = {
  usersPage: 1,
  scopePage: 1,
  auditPage: 1,
  pageSize: 5,
}

function toSearchParams(
  query: AdministrationQuery,
  pagination: AdministrationPagination,
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }

  for (const [key, value] of Object.entries(pagination)) {
    params.set(key, String(value))
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

/** Option lists for this module's own eight filters. */
export function useAdministrationFilters() {
  return useQuery({
    queryKey: administrationKeys.filters(),
    queryFn: () =>
      api.get('/administration/filters', administrationFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function useAdministration(
  query: AdministrationQuery = {},
  pagination: AdministrationPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...administrationKeys.overview(query), pagination],
    queryFn: () =>
      api.get(
        `/administration${toSearchParams(query, pagination)}`,
        administrationOverviewSchema,
      ),
  })
}

export function inviteUser(input: InviteUserRequest) {
  return api.post('/administration/users/invite', input, inviteUserResponseSchema)
}
