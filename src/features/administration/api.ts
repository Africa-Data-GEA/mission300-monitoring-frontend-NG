import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  administrationFilterOptionsSchema,
  administrationOverviewSchema,
  institutionsListSchema,
  inviteUserResponseSchema,
  securitySettingsSchema,
  userAccountSchema,
  type InviteUserRequest,
  type AdministrationQuery,
} from '@/api/schemas/administration'
import { api } from '@/lib/api-client'

/** Real institutions to offer in the invite form's picker — see
 * institutionOptionSchema's own comment for why this replaced a hardcoded
 * name list. */
export function useInstitutionOptions() {
  return useQuery({
    queryKey: ['institutions', 'options'],
    queryFn: () => api.get('/institutions', institutionsListSchema),
    staleTime: 5 * 60 * 1000,
  })
}

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

export function updateUserRoles(userId: string, roles: readonly string[]) {
  return api.patch(`/administration/users/${encodeURIComponent(userId)}/roles`, { roles }, userAccountSchema)
}

export function updateUserInstitution(userId: string, institution: string) {
  return api.patch(`/administration/users/${encodeURIComponent(userId)}/institution`, { institution }, userAccountSchema)
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: [...administrationKeys.all, 'security'],
    queryFn: () => api.get('/administration/security', securitySettingsSchema),
  })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (allowSelfReview: boolean) =>
      api.put('/administration/security', { allowSelfReview }, securitySettingsSchema),
    onSuccess: (settings) => {
      queryClient.setQueryData([...administrationKeys.all, 'security'], settings)
    },
  })
}
