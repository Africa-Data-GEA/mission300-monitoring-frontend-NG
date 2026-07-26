import type {
  KpiCatalogueRow,
  KpiExplorerFilterOptions,
  KpiExplorerOverview,
  KpiProfile,
} from '@/api/schemas/kpi-explorer'

/**
 * Mock data for the KPI Explorer.
 *
 * Follows docs/specs/kpi-explorer.md. The catalogue carries a realistic spread
 * across pillars, readiness tiers and validation statuses — including data
 * gaps and pending values — so the summary counts, the distributions and the
 * filters are all exercised against non-uniform data.
 */

const CATALOGUE: KpiCatalogueRow[] = [
  {
    id: 'M300-ACC-001',
    name: 'National electricity access rate',
    pillar: 'last-mile-access',
    category: 'Output',
    unit: '%',
    sourceInstitution: 'SDG7 tracking / national source',
    frequency: 'Annual',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-06-30T00:00:00Z',
  },
  {
    id: 'M300-ACC-002',
    name: 'New grid connections',
    pillar: 'last-mile-access',
    category: 'Output',
    unit: 'connections',
    sourceInstitution: 'NERC',
    frequency: 'Quarterly',
    readiness: 'core',
    validationStatus: 'provisional',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-ACC-003',
    name: 'Active mini-grid household connections',
    pillar: 'last-mile-access',
    category: 'Output',
    unit: 'connections',
    sourceInstitution: 'Rural Electrification Agency',
    frequency: 'Quarterly',
    readiness: 'core',
    validationStatus: 'provisional',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-ACC-004',
    name: 'Solar Home Systems deployed',
    pillar: 'last-mile-access',
    category: 'Output',
    unit: 'systems',
    sourceInstitution: 'Rural Electrification Agency',
    frequency: 'Quarterly',
    readiness: 'supporting',
    validationStatus: 'pending',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-GEN-001',
    name: 'Available generation capacity',
    pillar: 'generation-network',
    category: 'System performance',
    unit: 'MW',
    sourceInstitution: 'NISO / TCN',
    frequency: 'Monthly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-GEN-002',
    name: 'Renewable generation share',
    pillar: 'generation-network',
    category: 'System performance',
    unit: '%',
    sourceInstitution: 'NISO / TCN / NERC',
    frequency: 'Monthly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-GEN-003',
    name: 'Transmission wheeling capacity',
    pillar: 'generation-network',
    category: 'System performance',
    unit: 'MW',
    sourceInstitution: 'Transmission Company of Nigeria',
    frequency: 'Monthly',
    readiness: 'supporting',
    validationStatus: 'pending',
    lastUpdated: '2025-08-31T00:00:00Z',
  },
  {
    id: 'M300-FVU-001',
    name: 'National metering rate',
    pillar: 'financially-viable-utilities',
    category: 'System performance',
    unit: '%',
    sourceInstitution: 'NERC',
    frequency: 'Monthly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-FVU-002',
    name: 'ATC&C loss rate',
    pillar: 'financially-viable-utilities',
    category: 'System performance',
    unit: '%',
    sourceInstitution: 'NERC',
    frequency: 'Quarterly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-FVU-003',
    name: 'Market-remittance performance',
    pillar: 'financially-viable-utilities',
    category: 'Governance',
    unit: '%',
    sourceInstitution: 'NERC',
    frequency: 'Monthly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-FVU-004',
    name: 'Tariff shortfall',
    pillar: 'financially-viable-utilities',
    category: 'Governance',
    unit: '₦ trillion',
    sourceInstitution: 'NERC / Federal Ministry of Finance',
    frequency: 'Quarterly',
    readiness: 'core',
    validationStatus: 'confirmed',
    lastUpdated: '2025-09-30T00:00:00Z',
  },
  {
    id: 'M300-PSP-001',
    name: 'Private capital mobilized',
    pillar: 'private-sector-participation',
    category: 'Output',
    unit: 'USD billion',
    sourceInstitution: 'FMoP / REA / FMoF',
    frequency: 'Quarterly',
    readiness: 'core',
    validationStatus: 'pending',
    lastUpdated: '2025-10-01T00:00:00Z',
  },
  {
    id: 'M300-PSP-002',
    name: 'Concession agreements signed',
    pillar: 'private-sector-participation',
    category: 'Governance',
    unit: 'agreements',
    sourceInstitution: 'Federal Ministry of Power',
    frequency: 'Quarterly',
    readiness: 'supporting',
    validationStatus: 'data-gap',
    lastUpdated: '2025-07-15T00:00:00Z',
  },
  {
    id: 'M300-REG-001',
    name: 'Cross-border electricity trade volume',
    pillar: 'regional-integration',
    category: 'Output',
    unit: 'GWh',
    sourceInstitution: 'West African Power Pool',
    frequency: 'Quarterly',
    readiness: 'future',
    validationStatus: 'data-gap',
    lastUpdated: '2025-05-20T00:00:00Z',
  },
  {
    id: 'M300-REG-002',
    name: 'Interconnection availability',
    pillar: 'regional-integration',
    category: 'System performance',
    unit: '%',
    sourceInstitution: 'Transmission Company of Nigeria',
    frequency: 'Monthly',
    readiness: 'future',
    validationStatus: 'data-gap',
    lastUpdated: '2025-05-20T00:00:00Z',
  },
  {
    id: 'M300-CLC-001',
    name: 'Clean cooking access rate',
    pillar: 'clean-cooking',
    category: 'Output',
    unit: '%',
    sourceInstitution: 'National reports',
    frequency: 'Annual',
    readiness: 'supporting',
    validationStatus: 'provisional',
    lastUpdated: '2025-06-30T00:00:00Z',
  },
  {
    id: 'M300-CLC-002',
    name: 'Clean cookstoves distributed',
    pillar: 'clean-cooking',
    category: 'Output',
    unit: 'stoves',
    sourceInstitution: 'Rural Electrification Agency',
    frequency: 'Quarterly',
    readiness: 'future',
    validationStatus: 'pending',
    lastUpdated: '2025-08-31T00:00:00Z',
  },
]

/**
 * Full profiles, keyed by indicator id. Only a subset is fleshed out — the
 * mock returns a generated fallback for any catalogue row without a bespoke
 * profile, so every row is drillable.
 */
const PROFILES: Record<string, KpiProfile> = {
  'M300-FVU-001': {
    id: 'M300-FVU-001',
    name: 'National metering rate',
    pillar: 'financially-viable-utilities',
    definition:
      'Total metered active customers as a share of total active registered customers.',
    formula:
      'Total metered active customers ÷ total active registered customers × 100',
    unit: '%',
    aggregation: 'Weighted by active customers across Distribution Companies',
    frequency: 'Monthly',
    disaggregation: 'By Distribution Company; by customer class where available',
    limitations:
      'Depends on the accuracy of the active-customer register, which some DisCos update on a lag.',
    baseline: 44,
    baselineLabel: '44% (Compact baseline, Jan 2025)',
    current: 55,
    currentLabel: '55%',
    target: 100,
    targetLabel: '100% by 2027',
    varianceLabel: '−13 pts vs the trajectory value for this period',
    direction: 'higher-is-better',
    trend: {
      change: 2.1,
      label: '+2.1 pts vs Q2 2025',
      direction: 'higher-is-better',
    },
    history: [
      { period: 'Q3 2024', value: 46, validationStatus: 'confirmed' },
      { period: 'Q4 2024', value: 48, validationStatus: 'confirmed' },
      { period: 'Q1 2025', value: 51, validationStatus: 'confirmed' },
      { period: 'Q2 2025', value: 52.9, validationStatus: 'confirmed' },
      { period: 'Q3 2025', value: 55, validationStatus: 'confirmed' },
    ],
    sourceInstitution: 'NERC',
    sourceReference: 'Monthly Metering Factsheet, September 2025',
    reportingPeriod: 'Q3 2025',
    validationStatus: 'confirmed',
    validationDecision: 'Validated by NERC data reviewer on 2025-10-04',
    version: 'v3.2',
    confidence: 'confirmed',
    provenance: {
      definition:
        'Total metered active customers as a share of total active registered customers.',
      methodology:
        'Total metered active customers divided by total active registered customers, multiplied by 100.',
      source: 'NERC Monthly Metering Factsheet and Quarterly Reports.',
      lastUpdated: '2025-09-30T00:00:00Z',
    },
    linkedRecords: [
      {
        id: 'IMP-2025-0142',
        type: 'programme',
        title: 'National Mass Metering Programme — Phase 2',
        institution: 'NERC / DisCos',
        status: 'On track',
      },
      {
        id: 'IMP-2025-0187',
        type: 'milestone',
        title: 'Meter Asset Provider rollout in Ikeja franchise',
        institution: 'Ikeja DisCo',
        status: 'Delayed',
      },
    ],
  },
}

/** Builds a plausible profile for any catalogue row lacking a bespoke one. */
function fallbackProfile(row: KpiCatalogueRow): KpiProfile {
  const hasValue =
    row.validationStatus === 'confirmed' ||
    row.validationStatus === 'provisional'

  return {
    id: row.id,
    name: row.name,
    pillar: row.pillar,
    definition: `Official metadata for ${row.name} is configured in the approved catalogue.`,
    formula: 'As configured in the approved Key Performance Indicator Matrix.',
    unit: row.unit,
    aggregation: 'As configured',
    frequency: row.frequency,
    disaggregation: 'As configured',
    limitations:
      row.validationStatus === 'data-gap'
        ? 'No approved value is currently available for this indicator.'
        : 'See the approved catalogue for configured limitations.',
    baseline: null,
    baselineLabel: 'Not configured',
    current: hasValue ? 0 : null,
    currentLabel: hasValue ? `Awaiting display value (${row.unit})` : 'No current value',
    target: null,
    targetLabel: 'Not configured',
    varianceLabel: 'Not computable without a target',
    direction: 'higher-is-better',
    history: [],
    sourceInstitution: row.sourceInstitution,
    sourceReference: 'As configured',
    reportingPeriod: 'Latest available',
    validationStatus: row.validationStatus,
    validationDecision:
      row.validationStatus === 'pending'
        ? 'Awaiting validation — not to be treated as confirmed.'
        : row.validationStatus === 'data-gap'
          ? 'No value submitted.'
          : 'See submission and validation records.',
    version: 'v1.0',
    confidence:
      row.validationStatus === 'confirmed' ? 'confirmed' : 'requires-validation',
    provenance: {
      definition: `Catalogue metadata for ${row.name}.`,
      methodology: 'As configured in the approved catalogue.',
      source: `${row.sourceInstitution}.`,
      lastUpdated: row.lastUpdated,
    },
    linkedRecords: [],
  }
}

export function getKpiProfile(id: string): KpiProfile | undefined {
  const bespoke = PROFILES[id]
  if (bespoke) return bespoke

  const row = CATALOGUE.find((entry) => entry.id === id)
  return row ? fallbackProfile(row) : undefined
}

export const kpiExplorerCatalogue = CATALOGUE

export const kpiExplorerFilterOptions: KpiExplorerFilterOptions = {
  pillars: [
    { value: 'all', label: 'All pillars' },
    { value: 'generation-network', label: 'Generation & network' },
    { value: 'last-mile-access', label: 'Last-mile access' },
    { value: 'financially-viable-utilities', label: 'Viable utilities' },
    { value: 'private-sector-participation', label: 'Private sector' },
    { value: 'regional-integration', label: 'Regional integration' },
    { value: 'clean-cooking', label: 'Clean cooking' },
  ],
  categories: [
    { value: 'all', label: 'All categories' },
    { value: 'Output', label: 'Output' },
    { value: 'System performance', label: 'System performance' },
    { value: 'Governance', label: 'Governance' },
  ],
  readinessTiers: [
    { value: 'all', label: 'All tiers' },
    { value: 'core', label: 'Core / Tier 1' },
    { value: 'supporting', label: 'Supporting / Tier 2' },
    { value: 'future', label: 'Future' },
  ],
  validationStatuses: [
    { value: 'all', label: 'All statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'provisional', label: 'Provisional' },
    { value: 'pending', label: 'Pending' },
    { value: 'data-gap', label: 'Data gap' },
  ],
  sourceInstitutions: [
    { value: 'all', label: 'All institutions' },
    { value: 'nerc', label: 'NERC' },
    { value: 'rea', label: 'Rural Electrification Agency' },
    { value: 'tcn', label: 'Transmission Company of Nigeria' },
    { value: 'niso', label: 'Nigerian Independent System Operator' },
    { value: 'wapp', label: 'West African Power Pool' },
  ],
  reportingPeriods: [
    { value: 'q3-2025', label: 'Q3 2025' },
    { value: 'q2-2025', label: 'Q2 2025' },
    { value: 'q1-2025', label: 'Q1 2025' },
    { value: 'fy-2025', label: 'FY 2025' },
  ],
  geographies: [
    { value: 'national', label: 'National' },
    { value: 'lagos', label: 'Lagos' },
    { value: 'kano', label: 'Kano' },
    { value: 'ikeja-disco', label: 'Ikeja DisCo' },
    { value: 'abuja-disco', label: 'Abuja DisCo' },
  ],
}

/** Derives the Section A/D aggregates from the catalogue so they never drift. */
function buildOverview(): KpiExplorerOverview {
  const total = CATALOGUE.length
  const core = CATALOGUE.filter((r) => r.readiness === 'core').length
  const supporting = CATALOGUE.filter((r) => r.readiness === 'supporting').length
  const future = CATALOGUE.filter((r) => r.readiness === 'future').length
  const withValue = CATALOGUE.filter(
    (r) => r.validationStatus === 'confirmed' || r.validationStatus === 'provisional',
  ).length
  const gaps = CATALOGUE.filter((r) => r.validationStatus === 'data-gap').length

  const pillars = [
    'generation-network',
    'last-mile-access',
    'financially-viable-utilities',
    'private-sector-participation',
    'regional-integration',
    'clean-cooking',
  ] as const

  const pillarLabels: Record<(typeof pillars)[number], string> = {
    'generation-network': 'Generation & network',
    'last-mile-access': 'Last-mile access',
    'financially-viable-utilities': 'Viable utilities',
    'private-sector-participation': 'Private sector',
    'regional-integration': 'Regional integration',
    'clean-cooking': 'Clean cooking',
  }

  const statuses = ['confirmed', 'provisional', 'pending', 'data-gap'] as const

  return {
    lastUpdated: '2025-10-14T09:12:00Z',
    summary: [
      {
        id: 'total-indicators',
        title: 'Total indicators',
        count: total,
        breakdown: [],
        provenance: {
          definition: 'Count of active indicators in the approved catalogue.',
          methodology: 'Count unique active Key Performance Indicator identifiers.',
          source: 'Approved Mission 300 Key Performance Indicator Matrix.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'core-indicators',
        title: 'Core / Tier 1 indicators',
        count: core,
        breakdown: [],
        provenance: {
          definition:
            'Indicators classified as immediate Minimum Viable Dataset priorities.',
          methodology: 'Count catalogue records classified Core or Tier 1.',
          source: 'Approved Key Performance Indicator Matrix.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'supporting-indicators',
        title: 'Supporting / Tier 2 indicators',
        count: supporting,
        breakdown: [{ label: 'Future', count: future }],
        provenance: {
          definition:
            'Supporting indicators used where the source institution already maintains the data.',
          methodology: 'Count catalogue records classified Supporting or Tier 2.',
          source: 'Approved Key Performance Indicator Matrix.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'data-coverage',
        title: 'Indicators with a value or data gap',
        count: withValue,
        breakdown: [
          { label: 'With value', count: withValue },
          { label: 'Data gap', count: gaps },
        ],
        provenance: {
          definition: 'Catalogue coverage by current data availability.',
          methodology:
            'Count indicators with an approved current value separately from those marked as a data gap. Pending values are not treated as confirmed.',
          source:
            'Key Performance Indicator value repository and validation workflow.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
    ],
    catalogue: {
      items: CATALOGUE,
      page: 1,
      pageSize: 25,
      total: CATALOGUE.length,
    },
    pillarDistribution: pillars.map((pillar) => {
      const rows = CATALOGUE.filter((r) => r.pillar === pillar)
      return {
        pillar,
        label: pillarLabels[pillar],
        total: rows.length,
        byStatus: statuses.map((status) => ({
          status,
          count: rows.filter((r) => r.validationStatus === status).length,
        })),
      }
    }),
    readinessDistribution: [
      { tier: 'core', label: 'Core / Tier 1', count: core },
      { tier: 'supporting', label: 'Supporting / Tier 2', count: supporting },
      { tier: 'future', label: 'Future', count: future },
    ],
  }
}

export const kpiExplorerOverview = buildOverview()
