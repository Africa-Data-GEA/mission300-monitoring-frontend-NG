import { FileSpreadsheet, FileText } from 'lucide-react'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * The fixed, one-click Compact/CPR exports — `compactExportCardSchema`'s two
 * records (`compact-progress-report`, `implementation-register`), each a
 * complete, non-customizable document, as opposed to the configurable
 * builder above. This was previously data-only: `useReportsPage` already
 * fetched `compactExports` and wired `exportCompactCard`, but no component
 * ever rendered them, so the CPR quick-export had no button in the UI.
 *
 * "compact-progress-report"'s PDF renders as a bespoke, fixed layout
 * matching the real Compact Progress Report's design (see
 * compact-progress-report-document.tsx) rather than the generic builder
 * document every other export uses — see the branch in
 * `use-reports-page.ts`'s `exportCompactCard`.
 */
export function CompactExportsSection({
  cards,
  exportingKey,
  onExport,
}: {
  cards: readonly CompactExportCard[]
  exportingKey: string | null
  onExport: (card: CompactExportCard, format: ExportFormat) => void
}) {
  if (cards.length === 0) return null

  return (
    <Card variant="well" className="p-3 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Compact &amp; CPR exports</h2>
      <p className="mt-1 text-sm text-text-muted">
        Fixed, official-format documents — generated as-is, not filtered by the builder above.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const pdfKey = `${card.id}:pdf`
          const xlsxKey = `${card.id}:xlsx`
          return (
            <Card key={card.id} className="p-4">
              <h3 className="text-sm font-semibold text-text-default">{card.title}</h3>
              <p className="mt-1 text-xs text-text-muted">{card.definition}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={exportingKey !== null}
                  onClick={() => onExport(card, 'pdf')}
                >
                  <FileText aria-hidden="true" />
                  {exportingKey === pdfKey ? 'Generating…' : 'Download PDF'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={exportingKey !== null}
                  onClick={() => onExport(card, 'xlsx')}
                >
                  <FileSpreadsheet aria-hidden="true" />
                  {exportingKey === xlsxKey ? 'Generating…' : 'Download Excel'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
