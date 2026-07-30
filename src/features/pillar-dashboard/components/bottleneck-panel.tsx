import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { REGISTER_COLUMNS } from '@/features/bottlenecks/components/register-columns'
import { BottleneckSeverityChart } from './bottleneck-severity-chart'

/** Ranked top-5 open bottlenecks for this pillar. */
export function BottleneckPanel({ records }: { records: readonly BottleneckRecord[] }) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Priority bottlenecks for this pillar
      </h2>

      {records.length > 0 && (
        <Card className="mt-2 p-3">
          <h3 className="text-sm font-semibold text-text-default">By severity</h3>
          <BottleneckSeverityChart records={records} />
        </Card>
      )}

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Ranked bottlenecks for this Compact pillar"
          columns={REGISTER_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1400px]"
          emptyMessage="No open bottlenecks for this pillar."
        />
      </Card>
    </Card>
  )
}
