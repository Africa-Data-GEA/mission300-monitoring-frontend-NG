import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  stakeholderMutationResponseSchema,
  stakeholdersOverviewSchema,
  type InstitutionWrite,
  type StakeholdersQuery,
} from '@/api/schemas/stakeholders'
import { api } from '@/lib/api-client'

export const stakeholderKeys = { all: ['stakeholders'] as const }

export function useStakeholders(query: StakeholdersQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  return useQuery({
    queryKey: [...stakeholderKeys.all, query],
    queryFn: () =>
      api.get(
        `/stakeholders?${params.toString()}`,
        stakeholdersOverviewSchema,
      ),
  })
}

export function useStakeholderMutations() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: stakeholderKeys.all })

  const createInstitution = useMutation({
    mutationFn: (input: InstitutionWrite) =>
      api.post('/stakeholders/institutions', input, stakeholderMutationResponseSchema),
    onSuccess: refresh,
  })
  const updateInstitution = useMutation({
    mutationFn: ({ id, input }: { id: string; input: InstitutionWrite }) =>
      api.patch(`/stakeholders/institutions/${encodeURIComponent(id)}`, input, stakeholderMutationResponseSchema),
    onSuccess: refresh,
  })
  const deleteInstitution = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/stakeholders/institutions/${encodeURIComponent(id)}`, stakeholderMutationResponseSchema),
    onSuccess: refresh,
  })
  return { createInstitution, updateInstitution, deleteInstitution }
}
