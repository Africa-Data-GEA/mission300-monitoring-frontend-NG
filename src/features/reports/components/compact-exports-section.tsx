import { useState } from 'react'
import { FileText } from 'lucide-react'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { FilterOption } from '@/types/filters'
import type { CompactReportParameters } from '../lib/compact-report-parameters'
import { CompactReportDialog } from './compact-report-dialog'

/**
 * The fixed, one-click Compact/CPR exports — `compactExportCardSchema`'s two
 * records (`compact-progress-report`, `implementation-register`), each a
 * complete, non-customizable document, as opposed to the configurable
 * builder above. Generating one asks for its reporting parameters first
 * (period, data collection cycle, progress year, report month, data date).
 *
 * "compact-progress-report"'s PDF renders as a bespoke, fixed layout
 * matching the real Compact Progress Report's design (see
 * compact-progress-report-document.tsx) rather than the generic builder
 * document every other export uses — see the branch in
 * `use-reports-page.ts`'s `exportCompactCard`.
 */
export function CompactExportsSection({
  cards,
  periods,
  exportingKey,
  onExport,
}: {
  cards: readonly CompactExportCard[]
  periods: readonly FilterOption[]
  exportingKey: string | null
  onExport: (
    card: CompactExportCard,
    format: ExportFormat,
    parameters: CompactReportParameters,
  ) => Promise<void>
}) {
  const [selected, setSelected] = useState<CompactExportCard | null>(null)
  if (cards.length === 0) return null

  async function generate(card: CompactExportCard, format: ExportFormat, parameters: CompactReportParameters) {
    await onExport(card, format, parameters)
    setSelected(null)
  }

  return (
    <Card variant="well" className="p-3 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Compact &amp; CPR exports</h2>
      <p className="mt-1 text-sm text-text-muted">
        Fixed, official-format documents. Choose the reporting parameters, then generate as PDF or Excel.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id} className="p-4">
            <h3 className="text-sm font-semibold text-text-default">{card.title}</h3>
            <p className="mt-1 text-xs text-text-muted">{card.definition}</p>

            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={exportingKey !== null}
                onClick={() => setSelected(card)}
              >
                <FileText aria-hidden="true" />
                {exportingKey?.startsWith(`${card.id}:`) ? 'Generating…' : 'Generate report'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <CompactReportDialog
          key={selected.id}
          card={selected}
          periods={periods}
          isGenerating={exportingKey !== null}
          onClose={() => setSelected(null)}
          onGenerate={(card, format, parameters) => void generate(card, format, parameters)}
        />
      )}
    </Card>
  )
}
