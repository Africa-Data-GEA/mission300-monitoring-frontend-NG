import { useQuery } from '@tanstack/react-query'
import { institutionOverviewSchema } from '@/api/schemas/institution-overview'
import { api } from '@/lib/api-client'

export function useInstitutionOverview() {
  return useQuery({
    queryKey: ['institutions', 'me', 'overview'],
    queryFn: () => api.get('/institutions/me/overview', institutionOverviewSchema),
  })
}
