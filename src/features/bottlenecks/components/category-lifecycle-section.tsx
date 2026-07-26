import type {
  CategoryDistribution,
  LifecycleDistribution,
} from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { CategoryDistributionCard } from './category-distribution'
import { LifecycleDistributionCard } from './lifecycle-distribution'

/** Section C — by category and lifecycle stage. */
export function CategoryLifecycleSection({
  byCategory,
  byLifecycleStage,
}: {
  byCategory: readonly CategoryDistribution[]
  byLifecycleStage: readonly LifecycleDistribution[]
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        By category and lifecycle stage
      </h2>

      <div className="mt-2 grid gap-3 sm:mt-3 lg:grid-cols-2">
        <CategoryDistributionCard rows={byCategory} />
        <LifecycleDistributionCard rows={byLifecycleStage} />
      </div>
    </Card>
  )
}
