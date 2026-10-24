import { BuilderSidebar } from '../components/builder/builder-sidebar'
import { ReportDocumentPreview } from '../components/builder/report-document-preview'
import { ReportPageHeader } from '../components/report-page-header'
import { useReportBuilderPage } from '../use-report-builder-page'

export function ReportBuilderPage() {
  const page = useReportBuilderPage()

  return (
    <div className="flex flex-col gap-4">
      <ReportPageHeader
        title="Report Builder"
        description="Configure a report on the left â€” the preview on the right updates live â€” then generate it as PDF or Excel."
      />

      <ol aria-label="Report workflow" className="grid gap-3 sm:grid-cols-3">
        {[
          ['Configure', 'Choose a report type and set your scope.'],
          ['Review', 'Check the preview and select your sections.'],
          ['Download', 'Generate your report as PDF or Excel.'],
        ].map(([title, detail], index) => (
          <li key={title} className="flex items-center gap-3 rounded-card border border-border-default bg-surface px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700/10 text-xs font-semibold text-brand-700">{index + 1}</span>
            <div><p className="text-sm font-semibold text-text-default">{title}</p><p className="mt-0.5 text-xs text-text-muted">{detail}</p></div>
          </li>
        ))}
      </ol>

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
    </div>
  )
}

