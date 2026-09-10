import type {
  BottleneckRecord,
  BottlenecksFilterOptions,
  BottlenecksOverview,
  EscalationRecord,
} from '@/api/schemas/bottlenecks'

/**
 * Mock data for the Bottlenecks and Exceptions module.
 *
 * Follows docs/specs/bottlenecks-exceptions.md. Includes deliberate edge
 * cases: a critical record escalated to ministerial level, an overdue
 * escalation, a resolved escalation with evidence, and a record with no
 * linked implementation record.
 */

const REGISTER: BottleneckRecord[] = [
  {
    id: 'BTN-2025-004',
    issue: 'Tariff shortfall / cost-reflectivity subsidy funding gap',
    category: 'financing',
    severity: 'critical',
    pillar: 'financially-viable-utilities',
    linkedRecord: 'IMP-2025-0091 — Tariff Order implementation',
    institution: 'NERC / Federal Ministry of Finance',
    dateRaised: '2025-06-18T00:00:00Z',
    ageDays: 118,
    followUp: 'Escalated to ministerial review; funding decision pending.',
    escalationStatus: 'escalated',
    status: 'escalated',
    lifecycleStage: 'implementation',
    statusHistory: [
      { period: 'Jun 2025', status: 'open' },
      { period: 'Jul 2025', status: 'in-progress' },
      { period: 'Aug 2025', status: 'blocked' },
      { period: 'Sep 2025', status: 'escalated' },
    ],
  },
  {
    id: 'BTN-2025-015',
    issue: 'Bilateral contracts on hold pending regulatory determination',
    category: 'regulatory-approval',
    severity: 'high',
    pillar: 'financially-viable-utilities',
    linkedRecord: 'IMP-2025-0142 — Market reform programme',
    institution: 'NERC',
    dateRaised: '2025-08-01T00:00:00Z',
    ageDays: 74,
    followUp: 'Awaiting NERC board determination, next sitting Q4 2025.',
    escalationStatus: 'not-escalated',
    status: 'open',
    lifecycleStage: 'design',
    statusHistory: [{ period: 'Aug 2025', status: 'open' }],
  },
  {
    id: 'BTN-2025-011',
    issue: 'Gas Master Plan update delayed pending inter-agency sign-off',
    category: 'coordination',
    severity: 'high',
    pillar: 'generation-network',
    linkedRecord: 'IMP-2025-0077 — Gas-to-power supply programme',
    institution: 'Federal Ministry of Power',
    dateRaised: '2025-09-01T00:00:00Z',
    ageDays: 52,
    followUp: 'Draft circulated for comment; sign-off expected November.',
    escalationStatus: 'not-escalated',
    status: 'in-progress',
    lifecycleStage: 'design',
    statusHistory: [
      { period: 'Sep 2025', status: 'open' },
      { period: 'Oct 2025', status: 'in-progress' },
    ],
  },
  {
    id: 'BTN-2025-016',
    issue: 'Metering rollout blocked in Ikeja franchise area',
    category: 'implementation-delay',
    severity: 'medium',
    pillar: 'financially-viable-utilities',
    linkedRecord: 'IMP-2025-0163 — Mass Metering Programme, Phase 2',
    institution: 'Ikeja DisCo',
    dateRaised: '2025-09-14T00:00:00Z',
    ageDays: 39,
    followUp: 'Meter Asset Provider access dispute unresolved with landlord association.',
    escalationStatus: 'not-escalated',
    status: 'blocked',
    lifecycleStage: 'implementation',
    statusHistory: [
      { period: 'Sep 2025', status: 'open' },
      { period: 'Oct 2025', status: 'blocked' },
    ],
  },
  {
    id: 'BTN-2025-022',
    issue: 'Transmission evacuation constraint limiting dispatch, North East',
    category: 'technical-constraint',
    severity: 'critical',
    pillar: 'generation-network',
    linkedRecord: 'IMP-2025-0055 — Transmission Rehabilitation Programme',
    institution: 'Transmission Company of Nigeria',
    dateRaised: '2025-09-25T00:00:00Z',
    ageDays: 31,
    followUp: 'Line upgrade contractor mobilised; interim load-shedding protocol in place.',
    escalationStatus: 'escalated',
    status: 'escalated',
    lifecycleStage: 'implementation',
    statusHistory: [
      { period: 'Sep 2025', status: 'open' },
      { period: 'Sep 2025', status: 'escalated' },
    ],
  },
  {
    id: 'BTN-2025-027',
    issue: 'DARES quarterly disbursement submission incomplete',
    category: 'data-or-reporting',
    severity: 'low',
    pillar: 'last-mile-access',
    // No linked implementation record yet — the create form allows this.
    linkedRecord: '',
    institution: 'Rural Electrification Agency',
    dateRaised: '2025-10-06T00:00:00Z',
    ageDays: 8,
    followUp: 'Follow-up sent to programme officer; data due within five working days.',
    escalationStatus: 'not-escalated',
    status: 'open',
    lifecycleStage: 'operations',
    statusHistory: [{ period: 'Oct 2025', status: 'open' }],
  },
  {
    id: 'BTN-2025-009',
    issue: 'Environmental permit renewal overdue for mini-grid cluster',
    category: 'permitting',
    severity: 'medium',
    pillar: 'last-mile-access',
    linkedRecord: 'IMP-2025-0108 — DARES mini-grid cluster 4',
    institution: 'Rural Electrification Agency',
    dateRaised: '2025-07-22T00:00:00Z',
    ageDays: 96,
    followUp: 'Permit resubmitted after clarifying site boundary; awaiting response.',
    escalationStatus: 'resolved',
    status: 'resolved',
    lifecycleStage: 'commissioning',
    statusHistory: [
      { period: 'Jul 2025', status: 'open' },
      { period: 'Sep 2025', status: 'in-progress' },
      { period: 'Oct 2025', status: 'resolved' },
    ],
  },
  {
    id: 'BTN-2025-030',
    issue: 'Procurement for feeder rehabilitation lots re-advertised',
    category: 'procurement',
    severity: 'medium',
    pillar: 'generation-network',
    linkedRecord: 'IMP-2025-0134 — Feeder Rehabilitation Programme',
    institution: 'Transmission Company of Nigeria',
    dateRaised: '2025-09-30T00:00:00Z',
    ageDays: 26,
    followUp: 'Technical evaluation committee reconvenes next week.',
    escalationStatus: 'not-escalated',
    status: 'open',
    lifecycleStage: 'procurement',
    statusHistory: [{ period: 'Sep 2025', status: 'open' }],
  },
]

const ESCALATIONS: EscalationRecord[] = [
  {
    id: 'ESC-2025-004',
    bottleneckId: 'BTN-2025-004',
    decisionRequired: 'Approve interim subsidy funding to close the tariff gap',
    level: 'ministerial',
    owner: 'Federal Ministry of Finance',
    dueDate: '2025-10-10T00:00:00Z',
    daysOverdue: 4,
    status: 'overdue',
    resolution: null,
    evidenceUrl: null,
  },
  {
    id: 'ESC-2025-022',
    bottleneckId: 'BTN-2025-022',
    decisionRequired: 'Authorise emergency transmission line upgrade budget',
    level: 'steering-committee',
    owner: 'Transmission Company of Nigeria',
    dueDate: '2025-10-20T00:00:00Z',
    // Not yet due — a negative value reads as "days until due" in the UI.
    daysOverdue: -6,
    status: 'escalated',
    resolution: null,
    evidenceUrl: null,
  },
  {
    id: 'ESC-2025-009',
    bottleneckId: 'BTN-2025-009',
    decisionRequired: 'Confirm revised site boundary for environmental permit',
    level: 'institution-leadership',
    owner: 'Rural Electrification Agency',
    dueDate: '2025-09-05T00:00:00Z',
    daysOverdue: 0,
    status: 'resolved',
    resolution: 'Boundary confirmed; permit reissued 2025-09-18.',
    evidenceUrl: 'https://files.example.gov.ng/permits/dares-cluster-4-renewal.pdf',
  },
]

export const bottlenecksFilterOptions: BottlenecksFilterOptions = {
  severities: [
    { value: 'all', label: 'All severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  categories: [
    { value: 'all', label: 'All categories' },
    { value: 'financing', label: 'Financing' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'permitting', label: 'Permitting' },
    { value: 'regulatory-approval', label: 'Regulatory approval' },
    { value: 'coordination', label: 'Coordination' },
    { value: 'technical-constraint', label: 'Technical constraint' },
    { value: 'implementation-delay', label: 'Implementation delay' },
    { value: 'data-or-reporting', label: 'Data or reporting' },
  ],
  institutions: [
    { value: 'all', label: 'All institutions' },
    { value: 'Federal Ministry of Power', label: 'Federal Ministry of Power' },
    { value: 'NERC', label: 'NERC' },
    { value: 'Rural Electrification Agency', label: 'Rural Electrification Agency' },
    {
      value: 'Transmission Company of Nigeria',
      label: 'Transmission Company of Nigeria',
    },
    { value: 'Ikeja DisCo', label: 'Ikeja DisCo' },
  ],
  pillars: [
    { value: 'all', label: 'All pillars' },
    { value: 'generation-network', label: 'Generation & network' },
    { value: 'last-mile-access', label: 'Last-mile access' },
    { value: 'financially-viable-utilities', label: 'Viable utilities' },
    { value: 'private-sector-participation', label: 'Private sector' },
    { value: 'regional-integration', label: 'Regional integration' },
    { value: 'clean-cooking', label: 'Clean cooking' },
  ],
  linkedRecords: [
    { value: 'all', label: 'All linked records' },
    ...Array.from(
      new Set(REGISTER.map((r) => r.linkedRecord).filter(Boolean)),
    ).map((value) => ({ value, label: value })),
  ],
  lifecycleStages: [
    { value: 'all', label: 'All stages' },
    { value: 'identification', label: 'Identification' },
    { value: 'design', label: 'Design' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'implementation', label: 'Implementation' },
    { value: 'commissioning', label: 'Commissioning' },
    { value: 'operations', label: 'Operations' },
  ],
  escalationStatuses: [
    { value: 'all', label: 'All escalation statuses' },
    { value: 'not-escalated', label: 'Not escalated' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'resolved', label: 'Resolved' },
  ],
  validationStatuses: [
    { value: 'all', label: 'All validation statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'requires-validation', label: 'Requires validation' },
  ],
  reportingPeriods: [
    { value: 'q3-2025', label: 'Q3 2025' },
    { value: 'q2-2025', label: 'Q2 2025' },
    { value: 'fy-2025', label: 'FY 2025' },
  ],
}

/** Derives Section A/C/D aggregates from the register so they never drift. */
function buildOverview(): BottlenecksOverview {
  const open = REGISTER.filter(
    (r) => r.status === 'open' || r.status === 'in-progress' || r.status === 'escalated',
  )
  const openHighOrCritical = open.filter(
    (r) => r.severity === 'critical' || r.severity === 'high',
  )
  const delayed = REGISTER.filter((r) => r.status === 'in-progress')
  const blocked = REGISTER.filter((r) => r.status === 'blocked')
  const overdueEscalations = ESCALATIONS.filter((e) => e.status === 'overdue')

  const categories = [
    'financing',
    'procurement',
    'permitting',
    'regulatory-approval',
    'coordination',
    'technical-constraint',
    'implementation-delay',
    'data-or-reporting',
  ] as const
  const categoryLabels: Record<(typeof categories)[number], string> = {
    financing: 'Financing',
    procurement: 'Procurement',
    permitting: 'Permitting',
    'regulatory-approval': 'Regulatory approval',
    coordination: 'Coordination',
    'technical-constraint': 'Technical constraint',
    'implementation-delay': 'Implementation delay',
    'data-or-reporting': 'Data or reporting',
  }

  const stages = [
    'identification',
    'design',
    'procurement',
    'implementation',
    'commissioning',
    'operations',
  ] as const
  const stageLabels: Record<(typeof stages)[number], string> = {
    identification: 'Identification',
    design: 'Design',
    procurement: 'Procurement',
    implementation: 'Implementation',
    commissioning: 'Commissioning',
    operations: 'Operations',
  }
  const severities = ['critical', 'high', 'medium', 'low'] as const

  const institutionNames = Array.from(new Set(open.map((r) => r.institution)))

  return {
    lastUpdated: '2025-10-14T09:12:00Z',
    alerts: [
      {
        id: 'open-high-critical',
        title: 'Open high or critical bottlenecks',
        count: openHighOrCritical.length,
        targetLabel: 'Zero unresolved high or critical bottlenecks',
        supportingLabel: 'median 65 days open',
        trend: { change: 1, label: '+1 vs Q2 2025', direction: 'lower-is-better' },
        provenance: {
          definition: 'Open bottlenecks classified High or Critical.',
          methodology:
            'Count unique unresolved bottleneck records at the selected severities.',
          source: 'Bottleneck Register.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'delayed-priority',
        title: 'Delayed priority records',
        count: delayed.length,
        targetLabel: 'Zero delayed priority records',
        supportingLabel: 'average 52 days overdue',
        trend: { change: 0, label: 'no change vs Q2 2025', direction: 'lower-is-better' },
        provenance: {
          definition: 'Priority implementation records currently delayed.',
          methodology: 'Count unique priority records with Delayed status.',
          source: 'Implementation Register.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'blocked-priority',
        title: 'Blocked priority records',
        count: blocked.length,
        targetLabel: 'Zero blocked priority records',
        supportingLabel: 'affects 1 pillar',
        trend: { change: -1, label: '−1 vs Q2 2025', direction: 'lower-is-better' },
        provenance: {
          definition:
            'Priority records that cannot progress because of an unresolved dependency or constraint.',
          methodology: 'Count unique priority records with Blocked status.',
          source: 'Implementation Register and Bottleneck Register.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
      {
        id: 'overdue-escalations',
        title: 'Overdue escalations or decisions',
        count: overdueEscalations.length,
        targetLabel: 'Zero overdue escalation actions or decisions',
        supportingLabel: 'oldest: 4 days overdue',
        trend: { change: 1, label: '+1 vs Q2 2025', direction: 'lower-is-better' },
        provenance: {
          definition: 'Escalation actions or leadership decisions past their due date.',
          methodology:
            'Count unresolved escalation records whose due date is earlier than the reporting date.',
          source: 'Bottleneck Register and escalation tracker.',
          lastUpdated: '2025-10-14T09:12:00Z',
        },
      },
    ],
    register: { items: REGISTER, page: 1, pageSize: 10, total: REGISTER.length },
    byCategory: categories.map((category) => ({
      category,
      label: categoryLabels[category],
      count: open.filter((r) => r.category === category).length,
    })),
    byLifecycleStage: stages.map((stage) => {
      const rows = open.filter((r) => r.lifecycleStage === stage)
      return {
        stage,
        label: stageLabels[stage],
        total: rows.length,
        bySeverity: severities.map((severity) => ({
          severity,
          count: rows.filter((r) => r.severity === severity).length,
        })),
      }
    }),
    byInstitution: institutionNames
      .map((institution) => {
        const rows = open.filter((r) => r.institution === institution)
        return {
          institution,
          openCount: rows.length,
          criticalOrHighCount: rows.filter(
            (r) => r.severity === 'critical' || r.severity === 'high',
          ).length,
        }
      })
      .sort((a, b) => b.criticalOrHighCount - a.criticalOrHighCount),
    escalations: {
      items: ESCALATIONS,
      page: 1,
      pageSize: 10,
      total: ESCALATIONS.length,
    },
  }
}

export const bottlenecksRegister = REGISTER
export const bottlenecksEscalations = ESCALATIONS
export const bottlenecksOverview = buildOverview()
