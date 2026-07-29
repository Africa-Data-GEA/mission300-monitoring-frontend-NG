import { FileSpreadsheet, FileText } from 'lucide-react'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** Section D — CPR and Compact export: one-click structured exports, each
 * available as both PDF and Excel per the stakeholder ask. */
export function CompactExportSection({
  cards,
  onExport,
  pendingKey,
}: {
  cards: readonly CompactExportCard[]
  onExport: (card: CompactExportCard, format: ExportFormat) => void
  pendingKey: string | null
}) {
  return (
    <Card variant="well" className="p-3 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">CPR and Compact export</h2>
      <p className="mt-1 text-sm text-text-muted">
        Structured, ready-to-share exports mapped directly to the agreed CPR and Implementation
        Register formats.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id} className="p-4">
            <h3 className="text-sm font-semibold text-text-default">{card.title}</h3>
            <p className="mt-1 text-xs text-text-muted">{card.definition}</p>
            <p className="mt-2 text-[11px] text-text-subtle">Source: {card.dataSource}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onExport(card, 'pdf')}
                disabled={pendingKey === `${card.id}:pdf`}
              >
                <FileText aria-hidden="true" />
                {pendingKey === `${card.id}:pdf` ? 'Exporting…' : 'Export as PDF'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onExport(card, 'xlsx')}
                disabled={pendingKey === `${card.id}:xlsx`}
              >
                <FileSpreadsheet aria-hidden="true" />
                {pendingKey === `${card.id}:xlsx` ? 'Exporting…' : 'Export as Excel'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
