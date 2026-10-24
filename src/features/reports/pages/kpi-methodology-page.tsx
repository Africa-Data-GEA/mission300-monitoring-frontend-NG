import { BookOpen, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ReportPageHeader } from '../components/report-page-header'
import { useKpiMethodologyPage } from '../use-kpi-methodology-page'

export function KpiMethodologyPage() {
  const page = useKpiMethodologyPage()

  return (
    <div className="flex flex-col gap-5">
      <ReportPageHeader
        title="KPI methodology export"
        description="Every tracked indicator's definition and calculation methodology in one document."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="bg-brand-700/5 p-6 sm:p-8">
            <BookOpen className="size-9 text-brand-700" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-text-default">Understand the numbers</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">A shared reference for interpreting the indicators behind Mission 300 reporting.</p>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            {[
              ['Indicator definitions', 'Understand what each tracked KPI measures.'],
              ['Calculation methodology', 'Review how indicator values are calculated.'],
              ['Source institutions', 'See the institutions associated with each indicator.'],
            ].map(([title, description], index) => (
              <div key={title} className="flex gap-4">
                <span className="pt-0.5 text-xs font-semibold text-brand-700">0{index + 1}</span>
                <div><h3 className="text-sm font-semibold text-text-default">{title}</h3><p className="mt-1 text-sm leading-relaxed text-text-muted">{description}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <div><h2 className="text-lg font-semibold text-text-default">Choose a download format</h2><p className="mt-1 text-sm text-text-muted">The same reference, in the format you need.</p></div>
          {([
            { format: 'pdf', title: 'PDF document', description: 'For reading, sharing and printing.', icon: FileText },
            { format: 'xlsx', title: 'Excel workbook', description: 'For reviewing the methodology in a spreadsheet.', icon: FileSpreadsheet },
          ] as const).map(({ format, title, description, icon: Icon }) => (
            <Card key={format} className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-700/10 p-3 text-brand-700"><Icon className="size-5" aria-hidden="true" /></div>
                <div><h3 className="text-base font-semibold text-text-default">{title}</h3><p className="mt-1 text-sm text-text-muted">{description}</p></div>
              </div>
              <Button className="mt-5 w-full" variant={format === 'pdf' ? 'primary' : 'secondary'} disabled={page.downloadingMethodology !== null} onClick={() => void page.downloadMethodology(format)}>
                <Download aria-hidden="true" />
                {page.downloadingMethodology === format ? 'Generating…' : format === 'pdf' ? 'Download PDF' : 'Download Excel'}
              </Button>
            </Card>
          ))}
          <p className="text-xs leading-relaxed text-text-muted" role="status">{page.downloadingMethodology ? 'Preparing your methodology export. Your download will start when it is ready.' : 'Includes all tracked indicators, independently of report settings. Downloads are not added to your saved report history.'}</p>
        </div>
      </div>
    </div>
  )
}

