import type {
  StateCoverageRow,
  StateDetail,
  StateHistoryPoint,
} from '@/api/schemas/state-disco'

export const stateCoverageRows: StateCoverageRow[] = [
  {
    id: 'kaduna', state: 'Kaduna', zone: 'North West',
    miniGridConnections: '18,240', solarHomeSystems: '64,800',
    activeProgrammes: '4', activeProjects: '19', openBottlenecks: '3',
    validationLabel: 'Confirmed', coverageBarPercent: 82,
    validatedBy: 'Amina Yusuf, REA State Desk', validatedAt: '2025-10-09T00:00:00Z',
  },
  {
    id: 'niger', state: 'Niger', zone: 'North Central',
    miniGridConnections: '14,860', solarHomeSystems: '51,200',
    activeProgrammes: '3', activeProjects: '16', openBottlenecks: '2',
    validationLabel: 'Confirmed', coverageBarPercent: 67,
    validatedBy: 'Tunde Bakare, REA State Desk', validatedAt: '2025-10-07T00:00:00Z',
  },
  {
    id: 'lagos', state: 'Lagos', zone: 'South West',
    miniGridConnections: '4,210', solarHomeSystems: '12,940',
    activeProgrammes: '2', activeProjects: '11', openBottlenecks: '1',
    validationLabel: 'Provisional', coverageBarPercent: 28,
    validatedBy: null, validatedAt: null,
  },
]

const STATE_HISTORY: Record<string, StateHistoryPoint[]> = {
  kaduna: [
    { period: 'Q4 2024', miniGridConnections: 12_400, solarHomeSystems: 48_900, coverageBarPercent: 58 },
    { period: 'Q1 2025', miniGridConnections: 14_760, solarHomeSystems: 54_300, coverageBarPercent: 66 },
    { period: 'Q2 2025', miniGridConnections: 16_510, solarHomeSystems: 59_700, coverageBarPercent: 74 },
    { period: 'Q3 2025', miniGridConnections: 18_240, solarHomeSystems: 64_800, coverageBarPercent: 82 },
  ],
  niger: [
    { period: 'Q4 2024', miniGridConnections: 10_200, solarHomeSystems: 38_600, coverageBarPercent: 48 },
    { period: 'Q1 2025', miniGridConnections: 12_050, solarHomeSystems: 43_400, coverageBarPercent: 55 },
    { period: 'Q2 2025', miniGridConnections: 13_480, solarHomeSystems: 47_600, coverageBarPercent: 61 },
    { period: 'Q3 2025', miniGridConnections: 14_860, solarHomeSystems: 51_200, coverageBarPercent: 67 },
  ],
  lagos: [
    { period: 'Q4 2024', miniGridConnections: 2_950, solarHomeSystems: 9_100, coverageBarPercent: 19 },
    { period: 'Q1 2025', miniGridConnections: 3_320, solarHomeSystems: 10_400, coverageBarPercent: 22 },
    { period: 'Q2 2025', miniGridConnections: 3_780, solarHomeSystems: 11_700, coverageBarPercent: 25 },
    { period: 'Q3 2025', miniGridConnections: 4_210, solarHomeSystems: 12_940, coverageBarPercent: 28 },
  ],
}

const records = [
  {
    id: 'rec-001', type: 'programme' as const, name: 'DARES mini-grid portfolio',
    owner: 'REA', status: 'On track', deliveryLabel: '12 sites commissioned',
    sourceLabel: 'Approved programme register',
  },
  {
    id: 'rec-002', type: 'project' as const, name: 'Kaduna productive-use expansion',
    owner: 'REA / Developer consortium', status: 'In progress',
    deliveryLabel: '68% milestone completion', sourceLabel: 'Implementation Register',
  },
  {
    id: 'rec-003', type: 'bottleneck' as const, name: 'Right-of-way approval',
    owner: 'Kaduna State Government', status: 'Open',
    deliveryLabel: 'Unresolved for 24 days', sourceLabel: 'Bottleneck Register',
  },
]

export const stateDetails: Record<string, StateDetail> = Object.fromEntries(
  stateCoverageRows.map((state) => [state.id, {
    meta: {
      title: `${state.state} delivery profile`,
      description: 'Approved programmes, projects, and bottlenecks recorded against this state.',
      lastUpdatedLabel: 'Updated 14 October 2025',
      sourceLabel: 'REA and Implementation Register',
    },
    state,
    notice: 'No state electricity-access rate is inferred from connection counts.',
    records: state.id === 'kaduna' ? records : records.slice(0, 2),
    history: STATE_HISTORY[state.id] ?? [],
  }]),
)
