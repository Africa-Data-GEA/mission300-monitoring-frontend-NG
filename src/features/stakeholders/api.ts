import { useQuery } from '@tanstack/react-query'
import {
  stakeholdersOverviewSchema,
  type StakeholdersQuery,
} from '@/api/schemas/stakeholders'
import { api } from '@/lib/api-client'

export function useStakeholders(query: StakeholdersQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  return useQuery({
    queryKey: ['stakeholders', query],
    queryFn: () =>
      api.get(
        `/stakeholders?${params.toString()}`,
        stakeholdersOverviewSchema,
      ),
  })
}
