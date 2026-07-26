import type {
  CustodianAssignment,
  Institution,
} from '@/api/schemas/stakeholders'

export const stakeholderInstitutions: Institution[] = [
  { id: 'ins-001', name: 'Federal Ministry of Power', shortName: 'FMoP', type: 'ministry', status: 'active', coverage: 'National', roles: ['Policy oversight', 'Approval'], datasets: ['National electrification milestones'], programmes: ['Mission 300 Compact'], lastUpdated: '2026-07-15T09:00:00Z' },
  { id: 'ins-002', name: 'Nigerian Electricity Regulatory Commission', shortName: 'NERC', type: 'regulator', status: 'active', coverage: 'National', roles: ['Data custodian', 'Validation'], datasets: ['DisCo performance', 'Tariff and subsidy'], programmes: ['Utility reform'], lastUpdated: '2026-07-16T10:15:00Z' },
  { id: 'ins-003', name: 'Rural Electrification Agency', shortName: 'REA', type: 'agency', status: 'active', coverage: 'National and states', roles: ['Lead implementer', 'Data custodian'], datasets: ['Off-grid connections', 'DARES delivery'], programmes: ['DARES', 'Nigeria Electrification Project'], lastUpdated: '2026-07-17T08:30:00Z' },
  { id: 'ins-004', name: 'Transmission Company of Nigeria', shortName: 'TCN', type: 'utility', status: 'active', coverage: 'National grid', roles: ['Data custodian', 'Implementer'], datasets: ['Transmission capacity', 'Grid availability'], programmes: ['Grid expansion'], lastUpdated: '2026-07-14T14:20:00Z' },
  { id: 'ins-005', name: 'Nigerian Independent System Operator', shortName: 'NISO', type: 'utility', status: 'active', coverage: 'National grid', roles: ['Data custodian', 'Reviewer'], datasets: ['Generation dispatch', 'Grid reliability'], programmes: ['Power market transition'], lastUpdated: '2026-07-17T07:45:00Z' },
  { id: 'ins-006', name: 'Federal Ministry of Finance', shortName: 'FMoF', type: 'ministry', status: 'active', coverage: 'National', roles: ['Financing oversight', 'Approval'], datasets: ['Sector financing', 'Subsidy exposure'], programmes: ['Power sector recovery'], lastUpdated: '2026-07-12T12:00:00Z' },
  { id: 'ins-007', name: 'Ikeja Electricity Distribution Company', shortName: 'Ikeja Electric', type: 'disco', status: 'active', coverage: 'Lagos', roles: ['Data provider', 'Implementer'], datasets: ['Metering', 'Collection efficiency'], programmes: ['Metering scale-up'], lastUpdated: '2026-07-16T16:10:00Z' },
  { id: 'ins-008', name: 'Green Energy Delivery Partnership', shortName: 'GEDP', type: 'partner', status: 'pending-onboarding', coverage: 'North West', roles: ['Development partner'], datasets: [], programmes: ['Distributed renewable energy'], lastUpdated: '2026-07-10T09:30:00Z' },
]

export const stakeholderCustodians: CustodianAssignment[] = [
  { id: 'cust-001', dataset: 'DisCo performance', custodian: 'NERC', focalPerson: 'Ngozi Okafor', frequency: 'Monthly', template: 'DISCO-PERF-v3', reviewer: 'EMRC Data Team', validator: 'NERC Validation Unit', status: 'active' },
  { id: 'cust-002', dataset: 'Off-grid connections', custodian: 'REA', focalPerson: 'Ibrahim Suleiman', frequency: 'Monthly', template: 'OFFGRID-v2', reviewer: 'FMoP Planning', validator: 'EMRC Validation Team', status: 'active' },
  { id: 'cust-003', dataset: 'Transmission capacity', custodian: 'TCN', focalPerson: 'Funmilayo Adeyemi', frequency: 'Weekly', template: 'GRID-CAP-v4', reviewer: 'NISO Operations', validator: 'EMRC Validation Team', status: 'active' },
  { id: 'cust-004', dataset: 'Generation dispatch', custodian: 'NISO', focalPerson: 'Chukwuemeka Nwosu', frequency: 'Daily', template: 'DISPATCH-v2', reviewer: 'FMoP Planning', validator: 'NERC Validation Unit', status: 'active' },
  { id: 'cust-005', dataset: 'Sector financing', custodian: 'FMoF', focalPerson: 'Aisha Bello', frequency: 'Quarterly', template: 'FINANCE-v1', reviewer: 'EMRC Finance Team', validator: 'FMoF Oversight', status: 'pending' },
]

export const stakeholderFilters = {
  institutionTypes: [
    { value: 'all', label: 'All institution types' },
    { value: 'ministry', label: 'Ministry' },
    { value: 'agency', label: 'Agency' },
    { value: 'regulator', label: 'Regulator' },
    { value: 'utility', label: 'Utility' },
    { value: 'disco', label: 'Distribution company' },
    { value: 'partner', label: 'Partner' },
  ],
  roles: [{ value: 'all', label: 'All roles' }, { value: 'Data custodian', label: 'Data custodian' }, { value: 'Lead implementer', label: 'Lead implementer' }, { value: 'Approval', label: 'Approval' }],
  statuses: [{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'pending-onboarding', label: 'Pending onboarding' }, { value: 'inactive', label: 'Inactive' }],
  datasets: [{ value: 'all', label: 'All datasets' }, ...stakeholderCustodians.map((item) => ({ value: item.dataset, label: item.dataset }))],
  kpis: [{ value: 'all', label: 'All KPIs' }, { value: 'connections', label: 'Connections' }, { value: 'reliability', label: 'Grid reliability' }, { value: 'losses', label: 'ATC&C losses' }],
  programmes: [
    { value: 'all', label: 'All programmes' },
    { value: 'DARES', label: 'DARES' },
    { value: 'Grid expansion', label: 'Grid expansion' },
    { value: 'Metering scale-up', label: 'Metering scale-up' },
    { value: 'Mission 300 Compact', label: 'Mission 300 Compact' },
  ],
  coverageAreas: [{ value: 'all', label: 'All coverage areas' }, { value: 'National', label: 'National' }, { value: 'National grid', label: 'National grid' }, { value: 'Lagos', label: 'Lagos' }, { value: 'North West', label: 'North West' }],
}
