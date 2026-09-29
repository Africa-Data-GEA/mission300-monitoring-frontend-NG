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
import { getKpiProfile, kpiExplorerCatalogue, kpiExplorerFilterOptions } from './kpi-explorer'
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
  periods: ['q3-2025'],
  pillars: ['all'],
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
    validationStatusLabel: 'All (includes non-validated)',
    version: 3,
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
    validationStatusLabel: 'All (includes non-validated)',
    version: 1,
    format: 'xlsx',
    fileReference: 'pillar-performance_generation-network_q3-2025.xlsx',
    createdAt: '2025-10-06T13:00:00Z',
    lastGeneratedAt: '2025-10-06T13:00:00Z',
    config: { ...baseConfig, reportType: 'pillar-performance', pillars: ['generation-network'], format: 'xlsx' },
  },
  {
    id: 'RPT-2025-003',
    reportType: 'bottleneck',
    category: 'delivery',
    title: 'Bottleneck report — Q3 2025',
    owner: 'C. Okonkwo (EMRC)',
    filtersSummary: 'Q3 2025 · All pillars',
    validationStatusLabel: 'All (includes non-validated)',
    version: 2,
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
    validationStatusLabel: 'All (includes non-validated)',
    version: 1,
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
    {
      label: 'Reporting period',
      value: config.periods.map((period) => labelFor(reportsFilterOptions.reportingPeriods, period)).join(', '),
    },
  ]

  if (!config.pillars.includes('all'))
    entries.push({
      label: 'Compact pillar',
      value: config.pillars.map((pillar) => labelFor(reportsFilterOptions.pillars, pillar)).join(', '),
    })
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
  // Always included, not only when a specific status is picked — whether a
  // report includes non-validated data is essential context either way, per
  // stakeholder feedback, not something worth hiding behind the "all" case.
  entries.push({
    label: 'Validation status',
    value:
      config.validationStatus === 'all'
        ? 'All (includes non-validated)'
        : labelFor(reportsFilterOptions.validationStatuses, config.validationStatus),
  })
  if (config.readinessTier !== 'all')
    entries.push({ label: 'Readiness tier', value: labelFor(reportsFilterOptions.readinessTiers, config.readinessTier) })

  return entries
}

/** The label shown in the Saved Reports "Filters" column's own dedicated
 * validation-status text, and stored as `validationStatusLabel`. */
function validationStatusLabelFor(config: ReportConfig): string {
  return config.validationStatus === 'all'
    ? 'All (includes non-validated)'
    : labelFor(reportsFilterOptions.validationStatuses, config.validationStatus)
}

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function matchesPillars(config: ReportConfig, pillar: string): boolean {
  return config.pillars.includes('all') || config.pillars.includes(pillar)
}

/** Ordinal column labels counting back from "Current" — "2 periods ago",
 * "Previous", "Current" for count 3, etc. Deliberately not calendar-quarter
 * labels: each indicator's own history[] carries its own period labels
 * (some real quarters, some generic sequence labels for indicators still
 * awaiting confirmed data — see kpi-explorer.ts), which don't line up
 * one-to-one across indicators. Claiming they all mean "Q2 2025" would
 * misrepresent that. */
function trailingPeriodLabels(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const stepsBack = count - 1 - index
    if (stepsBack === 0) return 'Current'
    if (stepsBack === 1) return 'Previous'
    return `${stepsBack} periods ago`
  })
}

function kpiSection(config: ReportConfig, title: string) {
  const filtered = kpiExplorerCatalogue.filter(
    (row) =>
      matchesPillars(config, row.pillar) &&
      (config.kpiCategory === 'all' || row.category === config.kpiCategory) &&
      (config.validationStatus === 'all' || row.validationStatus === config.validationStatus) &&
      (config.readinessTier === 'all' || row.readiness === config.readinessTier),
  )

  // A genuine multi-period comparison, built from each indicator's own
  // recorded history — only for the two report types where that history is
  // real per-indicator data (see the schema comment on periods). Every other
  // report type ignores extra selected periods rather than fabricate one.
  const isComparable =
    config.periods.length > 1 && (config.reportType === 'kpi-indicator' || config.reportType === 'pillar-performance')
  const periodLabels = isComparable ? trailingPeriodLabels(config.periods.length) : []

  const rows = filtered.map((row) => {
    const profile = getKpiProfile(row.id)
    const cells = [
      row.id,
      row.name,
      row.pillar,
      row.category,
      row.unit,
      profile && profile.baseline !== null ? String(profile.baseline) : '—',
      profile && profile.current !== null ? String(profile.current) : '—',
      profile && profile.target !== null ? String(profile.target) : '—',
      row.validationStatus,
    ]
    if (isComparable) {
      const trailing = (profile?.history ?? []).slice(-periodLabels.length)
      const padding = periodLabels.length - trailing.length
      cells.push(...Array(padding).fill('—'), ...trailing.map((point) => String(point.value)))
    }
    return cells
  })

  return {
    title,
    columns: [
      'ID',
      'Indicator',
      'Pillar',
      'Category',
      'Unit',
      'Baseline',
      'Current',
      'Target',
      'Validation status',
      ...periodLabels,
    ],
    rows,
  }
}

function deliverySection(config: ReportConfig) {
  const filteredProgrammes = programmes.filter(
    (programme) =>
      matchesPillars(config, programme.pillar) &&
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
      matchesPillars(config, project.pillar) &&
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
    .filter((row) => matchesPillars(config, row.pillar))
    .map((row) => [row.id, row.issue, row.category, row.severity, row.status, String(row.ageDays)])

  return {
    title: 'Bottlenecks',
    columns: ['ID', 'Issue', 'Category', 'Severity', 'Status', 'Age (days)'],
    rows,
  }
}

/**
 * Lessons learned / follow-up actions — stakeholder feedback asked for a
 * lessons-learned and bottlenecks reporting framework to complement the KPI
 * and pillar reporting. Rather than invent a separate framework and dataset,
 * this surfaces the Bottleneck Register's own `followUp` field (already
 * captured when a bottleneck is raised — see create-bottleneck-form.tsx),
 * which is exactly "what's being done about it" for each constraint.
 */
function lessonsLearnedSection(config: ReportConfig) {
  const rows = bottlenecksRegister
    .filter((row) => matchesPillars(config, row.pillar) && row.followUp.trim().length > 0)
    .map((row) => [row.id, row.issue, row.status, row.followUp])

  return {
    title: 'Lessons learned and follow-up actions',
    columns: ['ID', 'Issue', 'Status', 'Follow-up / lesson learned'],
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
      return [...deliverySection(config), bottleneckSection(config), lessonsLearnedSection(config)]
    case 'pillar-performance':
    case 'kpi-indicator':
      return [kpiSection(config, 'Indicators')]
    case 'state-disco':
      return [stateDiscoSection(config), ...deliverySection(config)]
    case 'implementation':
      return deliverySection(config)
    case 'bottleneck':
      return [bottleneckSection(config), lessonsLearnedSection(config)]
    case 'financial':
      return [
        {
          title: 'Programme financing',
          columns: ['ID', 'Name', 'Financing', 'Status'],
          rows: programmes
            .filter((programme) => matchesPillars(config, programme.pillar))
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

function periodsLabel(config: ReportConfig): string {
  return config.periods.map((period) => labelFor(reportsFilterOptions.reportingPeriods, period)).join(' vs ')
}

export function buildReportPreview(config: ReportConfig): ReportPreview {
  const catalogueEntry = reportCatalogue.find((entry) => entry.reportType === config.reportType)!

  return {
    metadata: {
      title: `${catalogueEntry.title} — ${periodsLabel(config)}`,
      reportingPeriod: periodsLabel(config),
      appliedFilters: appliedFiltersFor(config),
      generatedAt: new Date().toISOString(),
      dataVersion: 'M300 mock dataset, Q3 2025',
      sourceNotes: catalogueEntry.dataSource,
      validationStatus: validationStatusLabelFor(config),
      units: 'As recorded per indicator; see indicator metadata for unit definitions.',
      limitations:
        'Generated from mock data for development and demonstration purposes; figures are not final.',
    },
    sections: sectionsFor(config.reportType, config),
  }
}

/** Same report configuration as an existing saved report, ignoring output
 * format — switching a saved report between PDF and Excel is still "the
 * same report regenerated", per how stakeholder feedback framed versioning. */
function configSignature(config: ReportConfig): string {
  const identity = {
    reportType: config.reportType,
    periods: [...config.periods].sort(),
    pillars: [...config.pillars].sort(),
    kpiCategory: config.kpiCategory,
    state: config.state,
    distributionCompany: config.distributionCompany,
    programmeOrAgency: config.programmeOrAgency,
    validationStatus: config.validationStatus,
    readinessTier: config.readinessTier,
  }
  return JSON.stringify(identity)
}

export function createSavedReport(config: ReportConfig): SavedReport {
  const catalogueEntry = reportCatalogue.find((entry) => entry.reportType === config.reportType)!
  const now = new Date().toISOString()
  const filtered = appliedFiltersFor(config)
  const signature = configSignature(config)

  const version = Math.max(0, ...savedReports.filter((report) => configSignature(report.config) === signature).map((report) => report.version)) + 1

  savedReportSequence += 1
  const report: SavedReport = {
    id: `RPT-2025-${String(savedReportSequence).padStart(3, '0')}`,
    reportType: config.reportType,
    category: catalogueEntry.category,
    title: `${catalogueEntry.title} — ${periodsLabel(config)}`,
    owner: 'You',
    filtersSummary: filtered.map((entry) => entry.value).join(' · '),
    validationStatusLabel: validationStatusLabelFor(config),
    version,
    format: config.format,
    fileReference: `${config.reportType}_${config.periods.join('-')}_v${version}.${config.format}`,
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

/**
 * A standalone export of every tracked KPI's methodology — stakeholder
 * feedback asked for a methodology export covering all KPIs, not only the
 * per-report methodology note. Reuses the same `ReportPreview` shape the
 * builder already generates PDF/Excel from, so it downloads through the
 * identical export pipeline rather than a bespoke one.
 */
export function buildMethodologyReport(): ReportPreview {
  const rows = kpiExplorerCatalogue
    .map((row) => {
      const profile = getKpiProfile(row.id)
      return [
        row.id,
        row.name,
        row.pillar,
        profile?.definition ?? '—',
        profile?.formula ?? '—',
        profile?.sourceInstitution ?? row.sourceInstitution,
      ]
    })
    .sort((a, b) => a[0]!.localeCompare(b[0]!))

  return {
    metadata: {
      title: 'KPI methodology export — all tracked indicators',
      reportingPeriod: 'Not period-specific — methodology, not values',
      appliedFilters: [],
      generatedAt: new Date().toISOString(),
      dataVersion: 'M300 mock dataset, Q3 2025',
      sourceNotes: 'Master KPI Registry — definition and calculation methodology per indicator.',
      validationStatus: 'Not applicable — methodology text, not a validated figure.',
      units: 'Not applicable.',
      limitations:
        'Generated from mock data for development and demonstration purposes; figures are not final.',
    },
    sections: [
      {
        title: 'Indicator methodologies',
        columns: ['ID', 'Indicator', 'Pillar', 'Definition', 'Methodology', 'Source institution'],
        rows,
      },
    ],
  }
}
