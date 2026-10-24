import { FileSpreadsheet, FileText } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { BuilderSidebar } from './components/builder/builder-sidebar'
import { ReportDocumentPreview } from './components/builder/report-document-preview'
import { CompactExportsSection } from './components/compact-exports-section'
import { NigeriaProgressReportSection } from './components/nigeria-progress-report-section'
import { ReportsSkeleton } from './components/reports-skeleton'
import { SavedReportsFilters } from './components/saved-reports-filters'
import { SavedReportsTable } from './components/saved-reports-table'
import { useReportsPage } from './use-reports-page'

/**
 * Reports & Exports — this page IS the report builder: a configuration
 * sidebar (report type and every filter, plus page orientation and which
 * sections to include) drives a live preview of the actual document, styled
 * with a cover page and a closing page. CPR/Compact quick exports and the
 * saved-report history sit underneath.
 * Specification: docs/specs/reports-exports.md
 */
export function ReportsPage() {
  const page = useReportsPage()

  if (page.isPending) return <ReportsSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Reports & Exports could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.compactExports || !page.savedReports) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Data operations' }, { label: 'Reports & Exports' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Reports & Exports
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure a report on the left — the preview on the right updates live — then generate
          it as PDF or Excel.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <BuilderSidebar
          config={page.config}
          filterOptions={page.filterOptions}
          orientation={page.orientation}
          allSections={page.preview?.sections ?? []}
          excludedSections={page.excludedSections}
          downloadingFormat={page.downloadingFormat}
          onChangeConfig={page.changeConfig}
          onChangeReportType={page.changeReportType}
          onChangeOrientation={page.setOrientation}
          onToggleSection={page.toggleSection}
          onDownload={page.downloadFromBuilder}
        />

        <ReportDocumentPreview
          preview={page.preview}
          sections={page.visibleSections}
          orientation={page.orientation}
          isPending={page.isPreviewPending}
        />
      </div>

      <CompactExportsSection
        cards={page.compactExports}
        periods={page.filterOptions?.reportingPeriods ?? []}
        exportingKey={page.compactExportKey}
        onExport={page.exportCompactCard}
      />

      <NigeriaProgressReportSection />

      <Card variant="well" className="p-3 sm:p-4">
        <h2 className="text-lg font-semibold text-text-default">KPI methodology export</h2>
        <p className="mt-1 text-sm text-text-muted">
          Every tracked indicator&apos;s definition and calculation methodology in one document —
          independent of the report builder&apos;s current filters above.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page.downloadingMethodology !== null}
            onClick={() => void page.downloadMethodology('pdf')}
          >
            <FileText aria-hidden="true" />
            {page.downloadingMethodology === 'pdf' ? 'Generating…' : 'Download PDF'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page.downloadingMethodology !== null}
            onClick={() => void page.downloadMethodology('xlsx')}
          >
            <FileSpreadsheet aria-hidden="true" />
            {page.downloadingMethodology === 'xlsx' ? 'Generating…' : 'Download Excel'}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <SavedReportsFilters
          search={page.savedSearch}
          category={page.savedCategory}
          onChangeSearch={page.changeSavedSearch}
          onChangeCategory={page.changeSavedCategory}
        />

        <SavedReportsTable
          reports={page.savedReports.items}
          page={page.savedReports.page}
          pageSize={page.savedReports.pageSize}
          total={page.savedReports.total}
          onPageChange={page.setSavedPage}
          onRedownload={page.redownloadSavedReport}
          onDelete={page.deleteReport}
          redownloadingId={page.redownloadingId}
          deletingId={page.deletingId}
        />
      </div>
    </div>
  )
}
