import { useState } from 'react'
import { ArrowUpRight, ClipboardList, FileText } from 'lucide-react'
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
 * `use-compact-exports-page.ts`'s `exportCompactCard`.
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
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border-default bg-brand-700/5 px-5 py-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-surface text-brand-700">
                {card.id === 'implementation-register' ? <ClipboardList aria-hidden="true" className="size-6" /> : <FileText aria-hidden="true" className="size-6" />}
              </div>
              <span className="text-xs font-medium text-text-muted">Fixed report template</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-semibold text-text-default">{card.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{card.definition}</p>

            <div className="mt-6 border-t border-border-default pt-4">
              <Button
                type="button"
                disabled={exportingKey !== null}
                onClick={() => setSelected(card)}
              >
                <ArrowUpRight aria-hidden="true" />
                {exportingKey?.startsWith(`${card.id}:`) ? 'Generating…' : 'Generate report'}
              </Button>
            </div>
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
    </div>
  )
}
