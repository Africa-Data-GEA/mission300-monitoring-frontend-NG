import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { REGISTER_COLUMNS } from '@/features/bottlenecks/components/register-columns'
import { BottleneckSeverityChart } from './bottleneck-severity-chart'

/*
 * The full register is eleven columns and needs a 1400px canvas, so on this
 * page it was always horizontally scrolled — a reader had to drag sideways to
 * find out how bad anything was. This page is an overview, not the register,
 * so it shows the five columns that answer "what, how bad, whose, how long,
 * where is it now" and links onward for the rest.
 *
 * Filtered from REGISTER_COLUMNS rather than redefined, so cell rendering
 * stays in one place and cannot drift from the register.
 */
const PILLAR_COLUMN_IDS = new Set(['issue', 'severity', 'institution', 'age', 'status'])
const PILLAR_BOTTLENECK_COLUMNS = REGISTER_COLUMNS.filter((column) =>
  PILLAR_COLUMN_IDS.has(column.id),
)

/** Ranked top-5 open bottlenecks for this pillar. */
export function BottleneckPanel({ records }: { records: readonly BottleneckRecord[] }) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      {/*
        "for this pillar" is dropped from every label on this page — the pillar
        name is the page's own H1, so repeating it in each heading was telling
        the reader something they already knew.
      */}
      <h2 className="text-lg font-semibold text-text-default">
        Priority bottlenecks
      </h2>

      {records.length > 0 && (
        <Card className="mt-2 p-3">
          <h3 className="text-sm font-semibold text-text-default">By severity</h3>
          <BottleneckSeverityChart records={records} />
        </Card>
      )}

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Priority bottlenecks, most severe first"
          columns={PILLAR_BOTTLENECK_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          emptyMessage="No open bottlenecks for this pillar."
        />
      </Card>
    </Card>
  )
}
