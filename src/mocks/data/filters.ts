import type { DashboardFilterOptions } from '@/types/filters'

/**
 * Mock payload for GET /api/filters — the option lists for the global filter
 * bar, matching the seven filters in the Executive Overview specification.
 */
export const filterOptions: DashboardFilterOptions = {
  reportingPeriods: [
    { value: 'q3-2025', label: 'Q3 2025' },
    { value: 'q2-2025', label: 'Q2 2025' },
    { value: 'q1-2025', label: 'Q1 2025' },
    { value: 'fy-2025', label: 'FY 2025' },
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
  institutions: [
    { value: 'all', label: 'All institutions' },
    { value: 'fmop', label: 'Federal Ministry of Power' },
    { value: 'fmof', label: 'Federal Ministry of Finance' },
    { value: 'nerc', label: 'NERC' },
    { value: 'rea', label: 'Rural Electrification Agency' },
    { value: 'tcn', label: 'Transmission Company of Nigeria' },
    { value: 'niso', label: 'Nigerian Independent System Operator' },
    { value: 'nbet', label: 'Nigerian Bulk Electricity Trading Plc' },
  ],
  priorities: [
    { value: 'priority', label: 'Priority actions' },
    { value: 'all', label: 'Complete portfolio' },
  ],
  geographicScopes: [
    { value: 'national', label: 'National' },
    { value: 'state', label: 'By state' },
    { value: 'disco', label: 'By Distribution Company' },
  ],
  distributionCompanies: [
    { value: 'all', label: 'All Distribution Companies' },
    { value: 'abuja', label: 'Abuja DisCo' },
    { value: 'benin', label: 'Benin DisCo' },
    { value: 'eko', label: 'Eko DisCo' },
    { value: 'enugu', label: 'Enugu DisCo' },
    { value: 'ibadan', label: 'Ibadan DisCo' },
    { value: 'ikeja', label: 'Ikeja DisCo' },
    { value: 'jos', label: 'Jos DisCo' },
    { value: 'kaduna', label: 'Kaduna DisCo' },
    { value: 'kano', label: 'Kano DisCo' },
    { value: 'ph', label: 'Port Harcourt DisCo' },
    { value: 'yola', label: 'Yola DisCo' },
  ],
  technologies: [
    { value: 'all', label: 'All technologies' },
    { value: 'grid', label: 'Grid extension' },
    { value: 'mini-grid', label: 'Mini-grids' },
    { value: 'shs', label: 'Solar Home Systems' },
    { value: 'hydro', label: 'Hydro' },
    { value: 'solar', label: 'Solar' },
    { value: 'gas', label: 'Gas' },
    { value: 'clean-cooking', label: 'Clean cooking' },
  ],
}
