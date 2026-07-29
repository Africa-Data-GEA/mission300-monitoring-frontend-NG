import type {
  CompactExportCard,
  ReportCatalogueCard,
  ReportConfig,
  ReportPreview,
  ReportsFilterOptions,
  ReportType,
  SavedReport,
} from '@/api/schemas/reports'
import { REPORT_TYPE_CATEGORY, REPORT_TYPE_LABELS } from '@/api/schemas/reports'
import { bottlenecksRegister } from './bottlenecks'
import { submissionObligations } from './data-submissions/obligations'
import { validationQueue } from './data-submissions/submissions'
import { filterOptions } from './filters'
import { kpiExplorerCatalogue, kpiExplorerFilterOptions } from './kpi-explorer'
import { programmes, projects } from './programs'
import { stateCoverageRows } from './state-disco/states'

/**
 * Mock data for Reports & Exports.
 *
 * Specification: docs/specs/reports-exports.md
 *
 * Every report type is a filtered, re-shaped VIEW over data that already
 * exists in another module (KPI Explorer, Programs, Bottlenecks, State &
 * DisCo, Data Submissions) — there is no separate "reports" dataset to keep
 * in sync, matching how Compact pillar dashboards were built.
 */

/* ------------------------------------------------------------------ *
 * Section A / D — Report catalogue and CPR/Compact export cards
 * ------------------------------------------------------------------ */

export const reportCatalogue: ReportCatalogueCard[] = [
  {
    reportType: 'compact-progress',
    category: REPORT_TYPE_CATEGORY['compact-progress'],
    title: REPORT_TYPE_LABELS['compact-progress'],
    definition: 'Structured Compact progress output aligned to the agreed CPR format.',
    methodology:
      'Generate from approved indicator values and implementation records using the selected reporting period and filters.',
    dataSource: 'Key Performance Indicator repository, Compact Progress Report and Implementation Register.',
  },
  {
    reportType: 'compact-review',
    category: REPORT_TYPE_CATEGORY['compact-review'],
    title: REPORT_TYPE_LABELS['compact-review'],
    definition: 'Structured Compact review output for periodic stakeholder review.',
    methodology:
      'Generate from approved indicator values and implementation records using the selected reporting period and filters.',
    dataSource: 'Key Performance Indicator repository, Compact Progress Report and Implementation Register.',
  },
  {
    reportType: 'pillar-performance',
    category: REPORT_TYPE_CATEGORY['pillar-performance'],
    title: REPORT_TYPE_LABELS['pillar-performance'],
    definition: 'Performance report at Compact pillar level.',
    methodology:
      'Preserve selected indicators, periods, units, baselines, targets, current values, validation status and source notes.',
    dataSource: 'Key Performance Indicator catalogue and value repository.',
  },
  {
    reportType: 'kpi-indicator',
    category: REPORT_TYPE_CATEGORY['kpi-indicator'],
    title: REPORT_TYPE_LABELS['kpi-indicator'],
    definition: 'Indicator-level baseline-current and target-actual report.',
    methodology:
      'Preserve selected indicators, periods, units, baselines, targets, current values, validation status and source notes.',
    dataSource: 'Key Performance Indicator catalogue and value repository.',
  },
  {
    reportType: 'state-disco',
    category: REPORT_TYPE_CATEGORY['state-disco'],
    title: REPORT_TYPE_LABELS['state-disco'],
    definition: 'Geographic and utility delivery output by state and Distribution Company.',
    methodology: 'Generate from the corresponding filtered dashboard modules and preserve the exact applied filters.',
    dataSource: 'Distribution Company data, Implementation Register, Bottleneck Register and financing records.',
  },
  {
    reportType: 'implementation',
    category: REPORT_TYPE_CATEGORY.implementation,
    title: REPORT_TYPE_LABELS.implementation,
    definition: 'Delivery output across programmes, projects and milestones.',
    methodology: 'Generate from the corresponding filtered dashboard modules and preserve the exact applied filters.',
    dataSource: 'Distribution Company data, Implementation Register, Bottleneck Register and financing records.',
  },
  {
    reportType: 'bottleneck',
    category: REPORT_TYPE_CATEGORY.bottleneck,
    title: REPORT_TYPE_LABELS.bottleneck,
    definition: 'Exception output covering open, escalated and resolved constraints.',
    methodology: 'Generate from the corresponding filtered dashboard modules and preserve the exact applied filters.',
    dataSource: 'Distribution Company data, Implementation Register, Bottleneck Register and financing records.',
  },
  {
    reportType: 'financial',
    category: REPORT_TYPE_CATEGORY.financial,
    title: REPORT_TYPE_LABELS.financial,
    definition: 'Investment and financing output across programmes and projects.',
    methodology: 'Generate from the corresponding filtered dashboard modules and preserve the exact applied filters.',
    dataSource: 'Distribution Company data, Implementation Register, Bottleneck Register and financing records.',
  },
  {
    reportType: 'submission-compliance',
    category: REPORT_TYPE_CATEGORY['submission-compliance'],
    title: REPORT_TYPE_LABELS['submission-compliance'],
    definition: 'Institutional submission performance against reporting obligations.',
    methodology:
      'Summarise expected, received, overdue, approved, returned, rejected and missing records by selected period.',
    dataSource: 'Submission and Validation Registers.',
  },
  {
    reportType: 'data-quality',
    category: REPORT_TYPE_CATEGORY['data-quality'],
    title: REPORT_TYPE_LABELS['data-quality'],
    definition: 'Validation-queue and data-quality output for submitted records.',
    methodology:
      'Summarise expected, received, overdue, approved, returned, rejected and missing records by selected period.',
    dataSource: 'Submission and Validation Registers.',
  },
]

export const compactExportCards: CompactExportCard[] = [
  {
    id: 'compact-progress-report',
    title: 'Compact Progress Report export',
    definition: 'Compact Progress Report-aligned output for review.',
    methodology:
      'Maps approved action, milestone, status, evidence, risk, next action and verification fields to the agreed export structure.',
    dataSource: 'Compact Progress Report Master and Milestone Evidence Log.',
    reportType: 'compact-progress',
  },
  {
    id: 'implementation-register',
    title: 'Implementation Register export',
    definition: 'Filtered programme, project, milestone and action records.',
    methodology: 'Preserves identifiers, linkages, statuses, dates, evidence, versions and validation status.',
    dataSource: 'Implementation Register.',
    reportType: 'implementation',
  },
]

/* ------------------------------------------------------------------ *
 * Section E — Filter options
 * ------------------------------------------------------------------ */

export const reportsFilterOptions: ReportsFilterOptions = {
  reportTypes: [
    { value: 'all', label: 'All report types' },
    ...reportCatalogue.map((entry) => ({ value: entry.reportType, label: entry.title })),
  ],
  reportingPeriods: filterOptions.reportingPeriods.filter((option) => option.value !== 'custom'),
  pillars: filterOptions.pillars,
  kpiCategories: kpiExplorerFilterOptions.categories,
  states: [
    { value: 'all', label: 'All states' },
    ...stateCoverageRows.map((row) => ({ value: row.id, label: row.state })),
  ],
  distributionCompanies: filterOptions.distributionCompanies,
  programmesOrAgencies: [
    { value: 'all', label: 'All programmes' },
    ...programmes.map((programme) => ({ value: programme.id, label: programme.name })),
  ],
  validationStatuses: kpiExplorerFilterOptions.validationStatuses,
  readinessTiers: kpiExplorerFilterOptions.readinessTiers,
  exportFormats: [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'Excel (.xlsx)' },
  ],
}

/* ------------------------------------------------------------------ *
 * Saved reports (seed history)
 * ------------------------------------------------------------------ */

const baseConfig: ReportConfig = {
  reportType: 'compact-progress',
  period: 'q3-2025',
  pillar: 'all',
  kpiCategory: 'all',
  state: 'all',
  distributionCompany: 'all',
  programmeOrAgency: 'all',
  validationStatus: 'all',
  readinessTier: 'all',
  format: 'pdf',
}

export const savedReports: SavedReport[] = [
  {
    id: 'RPT-2025-001',
    reportType: 'compact-progress',
    category: 'compact',
    title: 'Compact Progress Report — Q3 2025',
    owner: 'M. Adeyemi (EMRC)',
    filtersSummary: 'Q3 2025 · All pillars',
    format: 'pdf',
    fileReference: 'compact-progress-report_q3-2025.pdf',
    createdAt: '2025-10-05T09:30:00Z',
    lastGeneratedAt: '2025-10-14T08:05:00Z',
    config: { ...baseConfig, reportType: 'compact-progress' },
  },
  {
    id: 'RPT-2025-002',
    reportType: 'pillar-performance',
    category: 'performance',
    title: 'Pillar performance — Generation & Network — Q3 2025',
    owner: 'F. Bello (EMRC)',
    filtersSummary: 'Q3 2025 · Generation & network',
    format: 'xlsx',
    fileReference: 'pillar-performance_generation-network_q3-2025.xlsx',
    createdAt: '2025-10-06T13:00:00Z',
    lastGeneratedAt: '2025-10-06T13:00:00Z',
    config: { ...baseConfig, reportType: 'pillar-performance', pillar: 'generation-network', format: 'xlsx' },
  },
  {
    id: 'RPT-2025-003',
    reportType: 'bottleneck',
    category: 'delivery',
    title: 'Bottleneck report — Q3 2025',
    owner: 'C. Okonkwo (EMRC)',
    filtersSummary: 'Q3 2025 · All pillars',
    format: 'xlsx',
    fileReference: 'bottleneck-report_q3-2025.xlsx',
    createdAt: '2025-10-09T11:20:00Z',
    lastGeneratedAt: '2025-10-09T11:20:00Z',
    config: { ...baseConfig, reportType: 'bottleneck', format: 'xlsx' },
  },
  {
    id: 'RPT-2025-004',
    reportType: 'submission-compliance',
    category: 'data-governance',
    title: 'Submission compliance — Q3 2025',
    owner: 'M. Adeyemi (EMRC)',
    filtersSummary: 'Q3 2025 · All institutions',
    format: 'pdf',
    fileReference: 'submission-compliance_q3-2025.pdf',
    createdAt: '2025-10-11T15:45:00Z',
    lastGeneratedAt: '2025-10-11T15:45:00Z',
    config: { ...baseConfig, reportType: 'submission-compliance' },
  },
]

let savedReportSequence = savedReports.length

/* ------------------------------------------------------------------ *
 * Preview builder — shared by the on-screen preview and the generated
 * PDF/Excel files, so what a user previews is exactly what downloads.
 * ------------------------------------------------------------------ */

function appliedFiltersFor(config: ReportConfig) {
  const entries: { label: string; value: string }[] = [
    { label: 'Reporting period', value: labelFor(reportsFilterOptions.reportingPeriods, config.period) },
  ]

  if (config.pillar !== 'all')
    entries.push({ label: 'Compact pillar', value: labelFor(reportsFilterOptions.pillars, config.pillar) })
  if (config.kpiCategory !== 'all')
    entries.push({ label: 'KPI category', value: labelFor(reportsFilterOptions.kpiCategories, config.kpiCategory) })
  if (config.state !== 'all')
    entries.push({ label: 'State', value: labelFor(reportsFilterOptions.states, config.state) })
  if (config.distributionCompany !== 'all')
    entries.push({
      label: 'Distribution Company',
      value: labelFor(reportsFilterOptions.distributionCompanies, config.distributionCompany),
    })
  if (config.programmeOrAgency !== 'all')
    entries.push({
      label: 'Programme or agency',
      value: labelFor(reportsFilterOptions.programmesOrAgencies, config.programmeOrAgency),
    })
  if (config.validationStatus !== 'all')
    entries.push({
      label: 'Validation status',
      value: labelFor(reportsFilterOptions.validationStatuses, config.validationStatus),
    })
  if (config.readinessTier !== 'all')
    entries.push({ label: 'Readiness tier', value: labelFor(reportsFilterOptions.readinessTiers, config.readinessTier) })

  return entries
}

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function kpiSection(config: ReportConfig, title: string) {
  const rows = kpiExplorerCatalogue
    .filter(
      (row) =>
        (config.pillar === 'all' || row.pillar === config.pillar) &&
        (config.kpiCategory === 'all' || row.category === config.kpiCategory) &&
        (config.validationStatus === 'all' || row.validationStatus === config.validationStatus) &&
        (config.readinessTier === 'all' || row.readiness === config.readinessTier),
    )
    .map((row) => [row.id, row.name, row.pillar, row.category, row.unit, row.validationStatus])

  return {
    title,
    columns: ['ID', 'Indicator', 'Pillar', 'Category', 'Unit', 'Validation status'],
    rows,
  }
}

function deliverySection(config: ReportConfig) {
  const filteredProgrammes = programmes.filter(
    (programme) =>
      (config.pillar === 'all' || programme.pillar === config.pillar) &&
      (config.programmeOrAgency === 'all' || programme.id === config.programmeOrAgency),
  )
  const programmeRows = filteredProgrammes.map((programme) => [
    programme.id,
    programme.name,
    programme.leadInstitution,
    programme.pillar,
    programme.status,
  ])

  const filteredProjects = projects.filter(
    (project) =>
      (config.pillar === 'all' || project.pillar === config.pillar) &&
      (config.programmeOrAgency === 'all' || project.programmeId === config.programmeOrAgency),
  )
  const projectRows = filteredProjects.map((project) => [
    project.id,
    project.name,
    project.pillar,
    project.currentStatus,
  ])

  return [
    { title: 'Programmes', columns: ['ID', 'Name', 'Lead institution', 'Pillar', 'Status'], rows: programmeRows },
    { title: 'Projects', columns: ['ID', 'Name', 'Pillar', 'Status'], rows: projectRows },
  ]
}

function bottleneckSection(config: ReportConfig) {
  const rows = bottlenecksRegister
    .filter((row) => config.pillar === 'all' || row.pillar === config.pillar)
    .map((row) => [row.id, row.issue, row.category, row.severity, row.status, String(row.ageDays)])

  return {
    title: 'Bottlenecks',
    columns: ['ID', 'Issue', 'Category', 'Severity', 'Status', 'Age (days)'],
    rows,
  }
}

function stateDiscoSection(config: ReportConfig) {
  const rows = stateCoverageRows
    .filter((row) => config.state === 'all' || row.id === config.state)
    .map((row) => [row.id, row.state, row.zone])

  return { title: 'State coverage', columns: ['ID', 'State', 'Zone'], rows }
}

function complianceSection() {
  const rows = submissionObligations.map((row) => [
    row.id,
    row.institution,
    row.dataset,
    row.reportingPeriod,
    row.status.label,
  ])

  return {
    title: 'Submission obligations',
    columns: ['ID', 'Institution', 'Dataset', 'Reporting period', 'Status'],
    rows,
  }
}

function dataQualitySection() {
  const rows = validationQueue.map((row) => [
    row.id,
    row.institution,
    row.dataset,
    row.status.label,
  ])

  return {
    title: 'Validation queue',
    columns: ['ID', 'Institution', 'Dataset', 'Status'],
    rows,
  }
}

function sectionsFor(reportType: ReportType, config: ReportConfig) {
  switch (reportType) {
    case 'compact-progress':
    case 'compact-review':
      return [...deliverySection(config), bottleneckSection(config)]
    case 'pillar-performance':
    case 'kpi-indicator':
      return [kpiSection(config, 'Indicators')]
    case 'state-disco':
      return [stateDiscoSection(config), ...deliverySection(config)]
    case 'implementation':
      return deliverySection(config)
    case 'bottleneck':
      return [bottleneckSection(config)]
    case 'financial':
      return [
        {
          title: 'Programme financing',
          columns: ['ID', 'Name', 'Financing', 'Status'],
          rows: programmes
            .filter((programme) => config.pillar === 'all' || programme.pillar === config.pillar)
            .map((programme) => [
              programme.id,
              programme.name,
              programme.financing ?? 'Held at project level',
              programme.status,
            ]),
        },
      ]
    case 'submission-compliance':
      return [complianceSection()]
    case 'data-quality':
      return [dataQualitySection()]
  }
}

export function buildReportPreview(config: ReportConfig): ReportPreview {
  const catalogueEntry = reportCatalogue.find((entry) => entry.reportType === config.reportType)!

  return {
    metadata: {
      title: `${catalogueEntry.title} — ${labelFor(reportsFilterOptions.reportingPeriods, config.period)}`,
      reportingPeriod: labelFor(reportsFilterOptions.reportingPeriods, config.period),
      appliedFilters: appliedFiltersFor(config),
      generatedAt: new Date().toISOString(),
      dataVersion: 'M300 mock dataset, Q3 2025',
      sourceNotes: catalogueEntry.dataSource,
      validationStatus:
        config.validationStatus === 'all'
          ? 'Mixed — see per-row validation status'
          : labelFor(reportsFilterOptions.validationStatuses, config.validationStatus),
      units: 'As recorded per indicator; see indicator metadata for unit definitions.',
      limitations:
        'Generated from mock data for development and demonstration purposes; figures are not final.',
    },
    sections: sectionsFor(config.reportType, config),
  }
}

export function createSavedReport(config: ReportConfig): SavedReport {
  savedReportSequence += 1
  const catalogueEntry = reportCatalogue.find((entry) => entry.reportType === config.reportType)!
  const now = new Date().toISOString()
  const filtered = appliedFiltersFor(config)

  const report: SavedReport = {
    id: `RPT-2025-${String(savedReportSequence).padStart(3, '0')}`,
    reportType: config.reportType,
    category: catalogueEntry.category,
    title: `${catalogueEntry.title} — ${labelFor(reportsFilterOptions.reportingPeriods, config.period)}`,
    owner: 'You',
    filtersSummary: filtered.map((entry) => entry.value).join(' · '),
    format: config.format,
    fileReference: `${config.reportType}_${config.period}.${config.format}`,
    createdAt: now,
    lastGeneratedAt: now,
    config,
  }

  savedReports.unshift(report)
  return report
}

export function removeSavedReport(id: string) {
  const index = savedReports.findIndex((report) => report.id === id)
  if (index === -1) return false
  savedReports.splice(index, 1)
  return true
}
