import { useQuery } from '@tanstack/react-query'
import { publicOverviewSchema } from '@/api/schemas/executive-overview'
import { stateCoverageSchema } from '@/api/schemas/state-disco'
import { api } from '@/lib/api-client'

/**
 * National figures for the public gateway, from the real unauthenticated
 * endpoint. `GET /public/overview` reuses ExecutiveOverviewService's own
 * computation (so the figures are byte-identical to the authenticated
 * dashboard) and strips only `deliveryStatus` — ongoing projects and
 * bottlenecks/exceptions stay behind authentication; every KPI figure this
 * page actually renders (headlineCards, accessDelivery, nationalPerformance)
 * is public.
 */
export const publicGatewayKeys = {
  all: ['public-gateway'] as const,
  overview: () => [...publicGatewayKeys.all, 'overview'] as const,
}

export function usePublicOverview() {
  return useQuery({
    queryKey: publicGatewayKeys.overview(),
    // Validating at the boundary means a contract mismatch fails with a named
    // field rather than as `undefined` inside the hero.
    queryFn: () => api.get('/public/overview', publicOverviewSchema),
    // Public traffic is read-heavy and the figures move quarterly at most.
    staleTime: 5 * 60 * 1000,
  })
}

/** State coverage, for §06 "Delivery in motion" — the real unauthenticated
 * `/public/state-coverage` endpoint, proxying the same figures
 * `/state-disco/states` serves to authenticated users. */
export function usePublicStateCoverage() {
  return useQuery({
    queryKey: [...publicGatewayKeys.all, 'state-coverage'] as const,
    queryFn: () => api.get('/public/state-coverage', stateCoverageSchema),
    staleTime: 5 * 60 * 1000,
  })
}
