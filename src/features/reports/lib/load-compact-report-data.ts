import { environment } from '@/config/environment'
import { buildCompactProgressReportData } from './compact-progress-report-data'
import type { CompactReportParameters } from './compact-report-parameters'
import { loadLiveCompactProgressSource, loadMockCompactProgressSource } from './compact-progress-report-source'

export async function loadCompactReportData(country: string, parameters?: CompactReportParameters) {
  const source =
    environment.dataMode === 'mock' ? await loadMockCompactProgressSource() : await loadLiveCompactProgressSource()
  return buildCompactProgressReportData(source, country, parameters)
}
