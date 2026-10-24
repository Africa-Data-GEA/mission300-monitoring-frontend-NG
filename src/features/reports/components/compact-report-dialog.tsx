import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import type { FilterOption } from '@/types/filters'
import {
  CYCLE_OPTIONS,
  dataYearOptions,
  defaultCompactReportParameters,
  type CompactReportParameters,
} from '../lib/compact-report-parameters'

function DateInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string
  type: 'date' | 'month'
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text-default">
      {label}
      <input
        className="h-10 rounded-control border border-border-default bg-surface px-3 text-sm text-text-default"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

/** Asks for the reporting parameters of a Compact export before generating it,
 * so the report states which period, cycle and date it covers. */
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
  const periodOptions = periods.filter((option) => option.value !== 'all')
  const set = (patch: Partial<CompactReportParameters>) => setParameters((current) => ({ ...current, ...patch }))

  return (
    <SideDialog
      open={card !== null}
      onClose={onClose}
      title={card ? `Generate ${card.title}` : 'Generate report'}
      description="Choose what the report covers. These appear on its cover and headers."
    >
      <div className="flex max-w-xl flex-col gap-4 p-5 sm:p-7">
        <SelectField
          label="Reporting period"
          value={parameters.period}
          options={periodOptions.length > 0 ? periodOptions : [{ value: 'all', label: 'All periods' }]}
          onChange={(value) =>
            set({ period: value, periodLabel: periodOptions.find((option) => option.value === value)?.label ?? value })
          }
        />
        <SelectField
          label="Data collection cycle"
          value={parameters.cycle}
          options={CYCLE_OPTIONS}
          onChange={(value) => set({ cycle: value })}
        />
        <SelectField
          label="Progress achieved in"
          value={parameters.dataYear}
          options={dataYearOptions()}
          onChange={(value) => set({ dataYear: value })}
        />
        <DateInput
          label="Report month"
          type="month"
          value={parameters.reportMonth}
          onChange={(value) => set({ reportMonth: value })}
        />
        <DateInput
          label="Data as of"
          type="date"
          value={parameters.asOfDate}
          onChange={(value) => set({ asOfDate: value })}
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            disabled={isGenerating || !card}
            onClick={() => card && onGenerate(card, 'pdf', parameters)}
            type="button"
          >
            <FileText aria-hidden="true" />
            {isGenerating ? 'Generating…' : 'Generate PDF'}
          </Button>
          <Button
            disabled={isGenerating || !card}
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
