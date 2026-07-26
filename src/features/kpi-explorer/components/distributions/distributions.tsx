import type {
  PillarDistribution,
  ReadinessDistribution,
} from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { PillarCoverage } from './pillar-coverage'
import { ReadinessSplit } from './readiness-split'

/**
 * Section D — distribution by pillar and readiness tier.
 *
 * Composes two views: indicators (and their data coverage) by Compact pillar,
 * and the readiness-tier split. Both count catalogue records; neither is a
 * performance measure. Each view lives in its own file in this folder.
 */
export function Distributions({
  byPillar,
  byReadiness,
}: {
  byPillar: readonly PillarDistribution[]
  byReadiness: readonly ReadinessDistribution[]
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        By pillar and readiness tier
      </h2>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <PillarCoverage rows={byPillar} />
        <ReadinessSplit rows={byReadiness} />
      </div>
    </Card>
  )
}
