import { pdf } from '@react-pdf/renderer'
import type { CompactProgressReportData } from './compact-progress-report-data'
import { CompactProgressReportDocument } from './compact-progress-report-document'

/** Renders the Compact Progress Report to a real PDF file, client-side —
 * mirrors `buildReportPdf`'s `pdf(...).toBlob()` pattern in export-pdf.tsx.
 * Split into its own file (rather than living alongside the document
 * component) because a file mixing a component export with a plain function
 * export breaks React Fast Refresh — see export-pdf.tsx for the same split. */
export async function buildCompactProgressReportPdf(data: CompactProgressReportData): Promise<Blob> {
  return pdf(<CompactProgressReportDocument data={data} />).toBlob()
}
