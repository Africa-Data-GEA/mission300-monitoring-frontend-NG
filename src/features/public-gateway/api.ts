import { useQuery } from '@tanstack/react-query'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { stateCoverageSchema } from '@/api/schemas/state-disco'
import { api } from '@/lib/api-client'

/**
 * National figures for the public gateway.
 *
 * TEMPORARY ENDPOINT. This currently reads `/executive-overview`, the same
 * authenticated payload the dashboard uses. docs/public-gateway-home.md §11
 * specifies a dedicated `GET /api/public/overview` — unauthenticated, cacheable,
 * carrying only what is cleared for publication. That endpoint does not exist
 * yet, and inventing a fake one here would hide the dependency.
 *
 * Swapping to it is a one-line change to the path below, which is why the call
 * is isolated in this feature rather than importing the dashboard's hook: the
 * public gateway must not grow a dependency on an authenticated module.
 *
 * Until the real endpoint lands, treat anything rendered from this as
 * unreviewed for public release.
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
    queryFn: () => api.get('/executive-overview', executiveOverviewSchema),
    // Public traffic is read-heavy and the figures move quarterly at most.
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * State coverage, for §06 "Delivery in motion" — same temporary-endpoint
 * situation as usePublicOverview above: reads the authenticated
 * `/state-disco/states` payload directly rather than importing
 * state-disco's own hook, so this feature never depends on an authenticated
 * module. Swapping to a real public endpoint later is a one-line change.
 */
export function usePublicStateCoverage() {
  return useQuery({
    queryKey: [...publicGatewayKeys.all, 'state-coverage'] as const,
    queryFn: () => api.get('/state-disco/states', stateCoverageSchema),
    staleTime: 5 * 60 * 1000,
  })
}
