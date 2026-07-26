import type {
  StateCoverageRow,
  StateDetail,
} from '@/api/schemas/state-disco'

export const stateCoverageRows: StateCoverageRow[] = [
  {
    id: 'kaduna', state: 'Kaduna', zone: 'North West',
    miniGridConnections: '18,240', solarHomeSystems: '64,800',
    activeProgrammes: '4', activeProjects: '19', openBottlenecks: '3',
    validationLabel: 'Confirmed', coverageBarPercent: 82,
  },
  {
    id: 'niger', state: 'Niger', zone: 'North Central',
    miniGridConnections: '14,860', solarHomeSystems: '51,200',
    activeProgrammes: '3', activeProjects: '16', openBottlenecks: '2',
    validationLabel: 'Confirmed', coverageBarPercent: 67,
  },
  {
    id: 'lagos', state: 'Lagos', zone: 'South West',
    miniGridConnections: '4,210', solarHomeSystems: '12,940',
    activeProgrammes: '2', activeProjects: '11', openBottlenecks: '1',
    validationLabel: 'Provisional', coverageBarPercent: 28,
  },
]

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
  }]),
)
