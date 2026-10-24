import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import type { FilterOption } from '@/types/filters'
import {
  defaultCompactReportParameters,
  periodChoices,
  type CompactReportParameters,
} from '../lib/compact-report-parameters'

/** Asks for the two things the report needs before generating it: which
 * reporting period it covers, and the date its figures are current as of. */
export function CompactReportDialog({
  card,
  periods,
  isGenerating,
  onClose,
  onGenerate,
}: {
  card: CompactExportCard | null
  periods: readonly FilterOption[]
  isGenerating: boolean
  onClose: () => void
  onGenerate: (card: CompactExportCard, format: ExportFormat, parameters: CompactReportParameters) => void
}) {
  const [parameters, setParameters] = useState(() => defaultCompactReportParameters(periods))
  const choices = periodChoices(periods)

  return (
    <SideDialog
      open={card !== null}
      onClose={onClose}
      title={card ? `Generate ${card.title}` : 'Generate report'}
      description="Choose the period the report covers and the date its figures are current as of."
    >
      <div className="flex max-w-xl flex-col gap-5 p-5 sm:p-7">
        <div className="flex flex-col gap-1.5">
          <SelectField
            label="Reporting period"
            value={parameters.period}
            options={choices.length > 0 ? choices : [{ value: 'all', label: 'All periods' }]}
            onChange={(value) =>
              setParameters((current) => ({
                ...current,
                period: value,
                periodLabel: choices.find((option) => option.value === value)?.label ?? value,
              }))
            }
          />
          <p className="text-xs text-text-muted">The quarter the report covers. It appears on the cover and every page header.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted" htmlFor="compact-report-as-of">
            Data as of
          </label>
          <input
            id="compact-report-as-of"
            className="h-10 rounded-control border border-border-strong bg-surface px-3 text-sm text-text-default"
            type="date"
            value={parameters.asOfDate}
            onChange={(event) => setParameters((current) => ({ ...current, asOfDate: event.target.value }))}
          />
          <p className="text-xs text-text-muted">The date the figures are current as of. It is also used as the report month.</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            disabled={isGenerating || !card || !parameters.asOfDate}
            onClick={() => card && onGenerate(card, 'pdf', parameters)}
            type="button"
          >
            <FileText aria-hidden="true" />
            {isGenerating ? 'Generating…' : 'Generate PDF'}
          </Button>
          <Button
            disabled={isGenerating || !card || !parameters.asOfDate}
            onClick={() => card && onGenerate(card, 'xlsx', parameters)}
            type="button"
            variant="secondary"
          >
            <FileSpreadsheet aria-hidden="true" />
            Generate Excel
          </Button>
        </div>
      </div>
    </SideDialog>
  )
}
