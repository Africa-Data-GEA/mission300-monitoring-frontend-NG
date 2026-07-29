import { FileSpreadsheet, FileText, LayoutGrid, RectangleHorizontal, RectangleVertical } from 'lucide-react'
import type { ReportConfig, ReportSection, ReportsFilterOptions, ReportType } from '@/api/schemas/reports'
import { REPORT_TYPE_LABELS, REPORT_TYPES } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SelectField } from '@/components/ui/select-field'
import { cn } from '@/lib/utils'
import type { Orientation } from '../../use-reports-page'

/** The full configuration sidebar for the Report Builder — report type,
 * every filter from Section E, page orientation, and which of the preview's
 * sections to include in the generated file. */
export function BuilderSidebar({
  config,
  filterOptions,
  orientation,
  allSections,
  excludedSections,
  downloadingFormat,
  onChangeConfig,
  onChangeReportType,
  onChangeOrientation,
  onToggleSection,
  onDownload,
}: {
  config: ReportConfig
  filterOptions: ReportsFilterOptions | undefined
  orientation: Orientation
  allSections: readonly ReportSection[]
  excludedSections: ReadonlySet<string>
  downloadingFormat: 'pdf' | 'xlsx' | null
  onChangeConfig: (next: ReportConfig) => void
  onChangeReportType: (reportType: ReportType) => void
  onChangeOrientation: (orientation: Orientation) => void
  onToggleSection: (title: string) => void
  onDownload: (format: 'pdf' | 'xlsx') => void
}) {
  function set<K extends keyof ReportConfig>(key: K, value: ReportConfig[K]) {
    onChangeConfig({ ...config, [key]: value })
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-card border border-border-default bg-surface p-4 lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:w-80 lg:self-start lg:overflow-y-auto">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text-default">
          <LayoutGrid aria-hidden="true" className="size-4" />
          Report configuration
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Choose what this report covers. The preview on the right updates live.
        </p>
      </div>

      <SelectField
        label="Report type"
        value={config.reportType}
        options={REPORT_TYPES.map((type) => ({ value: type, label: REPORT_TYPE_LABELS[type] }))}
        onChange={(value) => onChangeReportType(value as ReportType)}
      />

      {filterOptions && (
        <div className="flex flex-col gap-3">
          <SelectField
            label="Reporting period"
            value={config.period}
            options={filterOptions.reportingPeriods}
            onChange={(value) => set('period', value)}
          />
          <SelectField
            label="Compact pillar"
            value={config.pillar}
            options={filterOptions.pillars}
            onChange={(value) => set('pillar', value)}
          />
          <SelectField
            label="KPI category"
            value={config.kpiCategory}
            options={filterOptions.kpiCategories}
            onChange={(value) => set('kpiCategory', value)}
          />
          <SelectField
            label="State"
            value={config.state}
            options={filterOptions.states}
            onChange={(value) => set('state', value)}
          />
          <SelectField
            label="Distribution Company"
            value={config.distributionCompany}
            options={filterOptions.distributionCompanies}
            onChange={(value) => set('distributionCompany', value)}
          />
          <SelectField
            label="Programme or agency"
            value={config.programmeOrAgency}
            options={filterOptions.programmesOrAgencies}
            onChange={(value) => set('programmeOrAgency', value)}
          />
          <SelectField
            label="Validation status"
            value={config.validationStatus}
            options={filterOptions.validationStatuses}
            onChange={(value) => set('validationStatus', value)}
          />
          <SelectField
            label="Readiness tier"
            value={config.readinessTier}
            options={filterOptions.readinessTiers}
            onChange={(value) => set('readinessTier', value)}
          />
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium text-text-muted">Page orientation</p>
        <div className="grid grid-cols-2 gap-2">
          <OrientationButton
            active={orientation === 'portrait'}
            icon={RectangleVertical}
            label="Portrait"
            onClick={() => onChangeOrientation('portrait')}
          />
          <OrientationButton
            active={orientation === 'landscape'}
            icon={RectangleHorizontal}
            label="Landscape"
            onClick={() => onChangeOrientation('landscape')}
          />
        </div>
      </div>

      {allSections.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-muted">Sections to include</p>
          <Card variant="well" className="flex flex-col gap-1.5 p-2.5">
            {allSections.map((section) => (
              <label
                key={section.title}
                className="flex items-center gap-2 rounded-control px-1.5 py-1 text-sm text-text-default hover:bg-surface"
              >
                <input
                  type="checkbox"
                  checked={!excludedSections.has(section.title)}
                  onChange={() => onToggleSection(section.title)}
                  className="size-3.5 accent-brand-700"
                />
                {section.title}
                <span className="ml-auto text-xs text-text-subtle">{section.rows.length}</span>
              </label>
            ))}
          </Card>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-border-default pt-4">
        <Button type="button" onClick={() => onDownload('pdf')} disabled={downloadingFormat !== null}>
          <FileText aria-hidden="true" />
          {downloadingFormat === 'pdf' ? 'Generating PDF…' : 'Generate & download PDF'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onDownload('xlsx')}
          disabled={downloadingFormat !== null}
        >
          <FileSpreadsheet aria-hidden="true" />
          {downloadingFormat === 'xlsx' ? 'Generating Excel…' : 'Generate & download Excel'}
        </Button>
      </div>
    </aside>
  )
}

function OrientationButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof RectangleVertical
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-control border px-2 py-2.5 text-xs font-medium transition-colors',
        active
          ? 'border-brand-700 bg-brand-50 text-brand-800'
          : 'border-border-default bg-surface text-text-muted hover:bg-surface-sunken',
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </button>
  )
}
