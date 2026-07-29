import { pdf } from '@react-pdf/renderer'
import type { ReportPreview } from '@/api/schemas/reports'
import { ReportDocument } from './report-document'
import type { Orientation } from './types'

/** Renders a report preview to a real PDF file, client-side — a cover page,
 * the content sections, and a closing page. */
export async function buildReportPdf(
  preview: ReportPreview,
  options: { orientation: Orientation },
): Promise<Blob> {
  return pdf(<ReportDocument preview={preview} orientation={options.orientation} />).toBlob()
}
