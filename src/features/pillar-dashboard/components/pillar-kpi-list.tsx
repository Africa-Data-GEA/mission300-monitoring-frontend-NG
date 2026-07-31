import { useNavigate } from 'react-router'
import type { KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { buildCatalogueColumns } from '@/features/kpi-explorer/components/catalogue-columns'
import { KpiDistributionCharts } from './kpi-distribution-charts'

/**
 * Every KPI Matrix indicator tagged to this pillar — the same catalogue rows
 * KPI Explorer reads, not a separate list. Opening one navigates to its
 * profile in KPI Explorer via the same `?kpi=` deep link the catalogue table
 * uses.
 */
export function PillarKpiList({ rows }: { rows: readonly KpiCatalogueRow[] }) {
  const navigate = useNavigate()

  // The identifier column no longer exists on these columns at all — see
  // buildCatalogueColumns. Opening a row deep-links to the profile, which is
  // where the code is shown.
  const columns = buildCatalogueColumns((row) => navigate(`/kpis?kpi=${row.id}`))

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Indicators</h2>

      {rows.length > 0 && (
        <div className="mt-2 sm:mt-3">
          <KpiDistributionCharts rows={rows} />
        </div>
      )}

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Indicators tracked for this pillar"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1200px]"
          emptyMessage="No indicators are currently tracked for this pillar."
        />
      </Card>
    </Card>
  )
}
