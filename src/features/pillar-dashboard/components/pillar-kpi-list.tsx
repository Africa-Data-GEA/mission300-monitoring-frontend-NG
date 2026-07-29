import { useNavigate } from 'react-router'
import type { KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { buildCatalogueColumns } from '@/features/kpi-explorer/components/catalogue-columns'

/**
 * Every KPI Matrix indicator tagged to this pillar — the same catalogue rows
 * KPI Explorer reads, not a separate list. Opening one navigates to its
 * profile in KPI Explorer via the same `?kpi=` deep link the catalogue table
 * uses.
 */
export function PillarKpiList({ rows }: { rows: readonly KpiCatalogueRow[] }) {
  const navigate = useNavigate()

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">KPIs for this pillar</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Key Performance Indicators tagged to this Compact pillar"
          columns={buildCatalogueColumns((row) => navigate(`/kpis?kpi=${row.id}`))}
          rows={rows}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1400px]"
          emptyMessage="No indicators are currently tagged to this pillar."
        />
      </Card>
    </Card>
  )
}
