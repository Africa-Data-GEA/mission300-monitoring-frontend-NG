import type { ReportConfig, ReportType } from '@/api/schemas/reports'

const DEFAULT_CONFIG_BASE: Omit<ReportConfig, 'reportType'> = {
  periods: ['all'],
  pillars: ['all'],
  kpiCategory: 'all',
  state: 'all',
  distributionCompany: 'all',
  programmeOrAgency: 'all',
  validationStatus: 'all',
  readinessTier: 'all',
  format: 'pdf',
}

export function defaultReportConfig(reportType: ReportType): ReportConfig {
  return { ...DEFAULT_CONFIG_BASE, reportType }
}
