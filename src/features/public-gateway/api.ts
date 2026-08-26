import { useQuery } from '@tanstack/react-query'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { stateCoverageSchema } from '@/api/schemas/state-disco'
import { api } from '@/lib/api-client'

/**
 * National figures for the public gateway.
 *
 * READS THE AUTHENTICATED ENDPOINT, ON PURPOSE.
 *
 * `GET /api/public/overview` now EXISTS on the Nigeria backend and is
 * unauthenticated — an earlier version of this comment said it did not, which
 * was true when written and is not any more. It is still not used here, and
 * the reason is content rather than plumbing: it serves a much thinner payload
 * than this page renders.
 *
 * What it returns:  headlineStrip (2 figures), deliveryChannels (3),
 *                   pillarIndicators (2) — each carrying only a formatted
 *                   `value` string, a reporting period and provenance.
 * What it omits:    `rawValue`, `target`, `baseline`, `scaleMin`/`scaleMax`,
 *                   `sparkline` and `history`.
 *
 * Those omissions are precisely the fields the redesigned page is built from:
 * no `baseline`/`target` means no bullet track on the headline cards, no
 * `history` means no evolution charts, and no `target` on a channel means the
 * share-of-target view has nothing to divide by. Switching today would trade a
 * working page for a thinner one.
 *
 * SO THE SEQUENCE IS: the public endpoint grows those fields, then this becomes
 * a one-line path change. It is isolated in this feature rather than importing
 * the dashboard's hook precisely so that stays a one-line change — the public
 * gateway must not grow a dependency on an authenticated module.
 *
 * UNTIL THEN: this page requires a signed-in session to render figures, which
 * is wrong for a public front door and is the single most important thing to
 * fix about it. Treat anything rendered from this as unreviewed for public
 * release.
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
