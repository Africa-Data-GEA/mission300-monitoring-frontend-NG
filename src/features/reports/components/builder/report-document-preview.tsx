import type { ReportPreview, ReportSection } from '@/api/schemas/reports'
import { cn } from '@/lib/utils'
import type { Orientation } from '../../use-reports-page'

/**
 * A live preview of the document that will be generated — styled as an
 * actual sheet of paper (cover page, content, closing page) rather than as
 * app chrome, so what is previewed reads like what downloads.
 */
export function ReportDocumentPreview({
  preview,
  sections,
  orientation,
  isPending,
}: {
  preview: ReportPreview | undefined
  sections: readonly ReportSection[]
  orientation: Orientation
  isPending: boolean
}) {
  return (
    <div className="flex min-w-0 flex-1 justify-center rounded-card bg-surface-sunken px-4 py-6 sm:px-8">
      <div
        className={cn(
          'h-fit w-full shrink-0 overflow-hidden rounded-2xl bg-white text-[#1A1F29] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_8px_24px_rgba(16,24,40,0.08)]',
          orientation === 'portrait' ? 'max-w-[720px]' : 'max-w-[980px]',
        )}
      >
        {isPending || !preview ? (
          <div className="flex h-[600px] animate-pulse items-center justify-center text-sm text-text-muted">
            Building preview…
          </div>
        ) : (
          <>
            <CoverPage preview={preview} />
            <PageBreak label="Report contents" />
            <ContentPages sections={sections} title={preview.metadata.title} period={preview.metadata.reportingPeriod} />
            <PageBreak label="Closing page" />
            <ClosingPage preview={preview} />
          </>
        )}
      </div>
    </div>
  )
}

function PageBreak({ label }: { label: string }) {
  return (
    <div className="relative my-1 flex items-center gap-3 px-10 py-3" aria-hidden="true">
      <div className="h-px flex-1 border-t border-dashed border-[#D8DCE3]" />
      <span className="text-[10px] tracking-wide text-text-subtle uppercase">{label}</span>
      <div className="h-px flex-1 border-t border-dashed border-[#D8DCE3]" />
    </div>
  )
}

function CoverPage({ preview }: { preview: ReportPreview }) {
  const { metadata } = preview

  return (
    <div className="flex min-h-[460px] flex-col">
      <div className="relative overflow-hidden bg-landing-deep-navy px-10 py-12 text-white sm:px-14 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 size-56 rounded-full bg-landing-gold/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-10 size-64 rounded-full bg-black/20"
        />

        <div className="relative flex items-center gap-2">
          <div className="size-2 rounded-full bg-landing-gold" />
          <p className="text-xs font-bold tracking-[0.2em]">MISSION 300</p>
        </div>
        <p className="relative mt-1 text-[11px] text-white/75">Monitoring &amp; Evaluation Dashboard</p>

        <h2 className="relative mt-14 max-w-[85%] text-2xl leading-tight font-bold text-landing-gold sm:mt-20 sm:text-3xl">
          {metadata.title}
        </h2>
        <p className="relative mt-3 text-sm text-white/85">{metadata.reportingPeriod}</p>
      </div>

      <dl className="mt-auto grid grid-cols-1 gap-x-6 gap-y-2 p-10 text-xs sm:grid-cols-2 sm:p-14">
        <MetaRow label="Generated" value={new Date(metadata.generatedAt).toLocaleString()} />
        <MetaRow label="Data version" value={metadata.dataVersion} />
        <MetaRow label="Validation status" value={metadata.validationStatus} />
        {metadata.appliedFilters.map((filter) => (
          <MetaRow key={filter.label} label={filter.label} value={filter.value} />
        ))}
      </dl>
    </div>
  )
}

function ContentPages({
  sections,
  title,
  period,
}: {
  sections: readonly ReportSection[]
  title: string
  period: string
}) {
  return (
    <div className="p-10 sm:p-14">
      <div className="mb-5 flex items-center justify-between border-b border-[#D8DCE3] pb-2 text-[11px]">
        <span className="font-semibold text-[#1A1F29]">{title}</span>
        <span className="text-text-muted">{period}</span>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-text-muted italic">
          No sections selected — choose at least one in the sidebar to include content.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-bold text-landing-deep-navy">{section.title}</h3>
              {section.rows.length === 0 ? (
                <p className="text-xs text-text-muted italic">No records match the applied filters.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#D8DCE3]">
                  <table className="w-full min-w-[420px] border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-landing-deep-navy">
                        {section.columns.map((column) => (
                          <th
                            key={column}
                            className="border-r border-white/15 px-3 py-2 font-bold text-white last:border-r-0"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-[#D8DCE3]">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border-r border-[#D8DCE3] px-3 py-2 text-[#1A1F29] last:border-r-0"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClosingPage({ preview }: { preview: ReportPreview }) {
  const { metadata } = preview

  return (
    <div className="flex min-h-[300px] flex-col p-10 sm:p-14">
      <div className="h-1.5 w-12 rounded-full bg-landing-gold" />
      <h2 className="mt-4 mb-5 text-xl font-bold text-landing-deep-navy">End of report</h2>

      <div className="flex flex-col gap-4 text-sm">
        <ClosingBlock label="Data source" text={metadata.sourceNotes} />
        <ClosingBlock label="Units" text={metadata.units} />
        <ClosingBlock label="Limitations" text={metadata.limitations} />
      </div>
    </div>
  )
}

function ClosingBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold tracking-wide text-text-muted uppercase">{label}</p>
      <p className="leading-relaxed text-[#1A1F29]">{text}</p>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="w-32 shrink-0 text-[10px] font-bold text-text-muted">{label}</dt>
      <dd className="min-w-0 text-[#1A1F29]">{value}</dd>
    </div>
  )
}
