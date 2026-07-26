import type { ExecutiveOverview } from '@/features/dashboard/types'

/**
 * Mock payload for GET /api/executive-overview.
 *
 * Follows the page specification (docs/specs/executive-overview.md) section by
 * section. Figures come from the wireframe's Q3 2025 view and the targets
 * named in the workbook, so the UI is exercised with realistic magnitudes,
 * currencies and edge cases — including a zero value (private capital), a
 * metric with no approved target (grid connections), and a pillar with no
 * records. Do not replace these with round numbers.
 */
export const executiveOverview: ExecutiveOverview = {
  lastUpdated: '2025-10-14T09:12:00Z',
  appliedPillar: 'all',


  /* ---------------- Section A — Headline cards (exactly four) -------- */
  headlineCards: {
    milestoneDelivery: {
      title: 'Priority milestones on time',
      icon: 'milestones',
      percentComplete: 15,
      breakdown: [
        { status: 'completed', label: 'completed', count: 8 },
        { status: 'on-track', label: 'on track', count: 31 },
        { status: 'delayed', label: 'delayed', count: 14 },
        { status: 'blocked', label: 'blocked', count: 8 },
      ],
      baselineLabel: 'baseline 0% (Jan 2025)',
      targetLabel: '100% of due priority milestones on time',
      trend: {
        change: 3,
        label: '+3 pts vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'live-cpr',
      provenance: {
        definition:
          'Share of priority milestones completed by their due date. This is an implementation-delivery measure, not an average of all Key Performance Indicators.',
        methodology:
          'Priority milestones completed by their due dates divided by priority milestones due by the selected reporting date, multiplied by 100.',
        source:
          'Approved Compact Progress Report, Implementation Register and updates from responsible institutions.',
        lastUpdated: '2025-10-14T09:12:00Z',
      },
    },

    accessRate: {
      title: 'Electricity access rate',
      icon: 'access',
      value: '70%',
      rawValue: 70,
      sourceYear: '2024',
      previousPublication: 'previous publication 68% (2023)',
      targetLabel: 'approved path 9%/year',
      trend: {
        change: 2,
        label: '+2 pts vs previous publication',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Latest officially published national electricity-access rate, shown with its source year.',
        methodology:
          'Use only the latest officially published national rate. Do not extrapolate the figure monthly or quarterly.',
        source:
          'Official Sustainable Development Goal 7 tracking publication and approved national source.',
        lastUpdated: '2025-06-30T00:00:00Z',
      },
    },

    generationCapacity: {
      title: 'Available generation capacity',
      icon: 'generation',
      availableMw: 5400,
      installedMw: 13600,
      value: '5.4 GW',
      availabilityRatio: 39.7,
      // Twelve monthly readings, oldest first.
      sparkline: [
        4900, 5050, 4820, 5180, 5240, 5010, 5320, 5460, 5280, 5390, 5350, 5400,
      ],
      benchmarkLabel: 'of 13.6 GW installed',
      trend: {
        change: 50,
        label: '+50 MW vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Average daily available or dispatched capacity against installed nameplate capacity. Installed, available, actual generation and transmission capacity are distinct measures.',
        methodology:
          'Average daily available or dispatched capacity during the selected reporting period. Availability ratio equals available capacity divided by installed nameplate capacity, multiplied by 100.',
        source:
          'Nigerian Independent System Operator, Transmission Company of Nigeria and NERC.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },

    escalations: {
      title: 'Critical escalations',
      icon: 'escalations',
      unresolvedCritical: 4,
      overdueDecisions: 3,
      longestDaysUnresolved: 118,
      targetLabel: 'zero unresolved critical escalations',
      // Improvement is a FALLING count, so this is lower-is-better.
      trend: {
        change: 1,
        label: '+1 vs Q2 2025',
        direction: 'lower-is-better',
      },
      source: 'live-cpr',
      provenance: {
        definition:
          'Unresolved critical bottlenecks, blocked priority actions and leadership decisions whose due dates have passed.',
        methodology:
          'Count unresolved critical bottlenecks, blocked priority actions and leadership decisions past their due date.',
        source: 'Implementation Register and Bottleneck Register.',
        lastUpdated: '2025-10-14T09:12:00Z',
      },
    },
  },

  /* ---------------- Section B — Access delivery by channel ----------- */
  accessDelivery: [
    {
      id: 'grid-connections',
      title: 'New grid connections',
      value: '412,880',
      rawValue: 412_880,
      // No approved target: the specification forbids deriving one from the
      // 9% access commitment, so this shows trend only.
      target: null,
      targetLabel: 'Annual target to be confirmed',
      percentComplete: null,
      trend: {
        change: 38_400,
        label: '+38,400 vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'requires-validation',
      provenance: {
        definition:
          'A direct customer connection to a Distribution Company network. Not a mini-grid connection.',
        methodology:
          'Current active registered grid customers minus comparable prior-period active registered customers.',
        source:
          'NERC Quarterly Reports and Monthly Metering Factsheet.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'mini-grid-connections',
      title: 'Mini-grid household connections',
      value: '128,450',
      rawValue: 128_450,
      target: 750_000,
      targetLabel: '750,000 by 2030 (DARES)',
      percentComplete: 17.1,
      trend: {
        change: 9_200,
        label: '+9,200 vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'live',
      confidence: 'requires-validation',
      provenance: {
        definition:
          'Cumulative active household connections served by operational mini-grids. Business connections are reported separately and must not be added without a clear label.',
        methodology:
          'Cumulative active household connections divided by the 750,000 DARES target.',
        source: 'Rural Electrification Agency programme records.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'solar-home-systems',
      title: 'Solar Home Systems deployed',
      value: '486,300',
      rawValue: 486_300,
      target: 2_750_000,
      targetLabel: '2.75 million by 2030',
      percentComplete: 17.7,
      trend: {
        change: 41_700,
        label: '+41,700 vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'live',
      confidence: 'requires-validation',
      provenance: {
        definition:
          'Cumulative eligible Solar Home Systems deployed through approved programmes since the approved baseline.',
        methodology:
          'Eligible additional systems deployed since the approved baseline, divided by 2.75 million. Reporting-period and cumulative deployment are distinguishable.',
        source:
          'Rural Electrification Agency programme records and approved national reports.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
  ],

  /* ---------------- Section C — National performance ---------------- */
  nationalPerformance: [
    {
      id: 'renewable-share',
      title: 'Renewable generation share',
      pillar: 'generation-network',
      scaleMin: 0,
      scaleMax: 60,
      baseline: 22,
      current: 24.8,
      expected: 27,
      target: 50,
      direction: 'higher-is-better',
      value: '24.8%',
      targetLabel: '50% by 2030',
      caption: 'Seasonal — retains the reporting period',
      trend: {
        change: 0.6,
        label: '+0.6 pts vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Renewable electricity generated as a share of total electricity generated. Renewable sources include hydro, solar and wind.',
        methodology:
          'Renewable electricity generated divided by total electricity generated, multiplied by 100. Renewable output is seasonal, so the reporting period must remain visible.',
        source: 'NISO, TCN and NERC generation records.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'metering-rate',
      title: 'National metering rate',
      pillar: 'financially-viable-utilities',
      scaleMin: 0,
      scaleMax: 100,
      baseline: 44,
      current: 55,
      expected: 68,
      target: 100,
      direction: 'higher-is-better',
      value: '55%',
      targetLabel: '100% by 2027',
      trend: {
        change: 2.1,
        label: '+2.1 pts vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Total metered active customers as a share of total active registered customers.',
        methodology:
          'Total metered active customers divided by total active registered customers, multiplied by 100.',
        source: 'NERC Monthly Metering Factsheet and Quarterly Reports.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'atcc-losses',
      title: 'ATC&C loss rate',
      pillar: 'financially-viable-utilities',
      scaleMin: 0,
      scaleMax: 60,
      baseline: 47,
      current: 33.3,
      expected: 31,
      // No single national Compact target; benchmark only.
      target: null,
      direction: 'lower-is-better',
      value: '33.3%',
      targetLabel: 'MYTO / PIP benchmark — no Compact target',
      caption: 'Lower is better',
      trend: {
        change: -1.4,
        label: '−1.4 pts vs Q2 2025',
        direction: 'lower-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Aggregate Technical, Commercial and Collection loss rate. Improvement is a falling value.',
        methodology:
          'Display the official NERC weighted national ATC&C loss rate. System recalculation may support quality checking but does not replace the official reported value.',
        source: 'NERC Quarterly Reports.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'market-remittance',
      title: 'Market-remittance performance',
      pillar: 'financially-viable-utilities',
      scaleMin: 0,
      scaleMax: 100,
      baseline: 62,
      current: 78.4,
      expected: 85,
      target: 100,
      direction: 'higher-is-better',
      value: '78.4%',
      targetLabel: '100% obligation compliance',
      trend: {
        change: 3.2,
        label: '+3.2 pts vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Actual remittance as a share of the applicable remittance obligation. NBET and Market Operator values are calculated separately before aggregation.',
        methodology:
          'Actual remittance divided by the applicable remittance obligation, multiplied by 100.',
        source: 'NERC market-remittance tables.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'tariff-shortfall',
      title: 'Tariff shortfall',
      pillar: 'financially-viable-utilities',
      scaleMin: 0,
      scaleMax: 3,
      baseline: 2.6,
      current: 2.2,
      expected: 1.7,
      target: 0,
      direction: 'lower-is-better',
      value: '₦2.2tn',
      targetLabel: 'Zero by 2027',
      caption: 'Outstanding = approved requirement − funded',
      trend: {
        change: -0.15,
        label: '−₦0.15tn vs Q2 2025',
        direction: 'lower-is-better',
      },
      source: 'public-source',
      confidence: 'confirmed',
      provenance: {
        definition:
          'Approved annual or year-to-date tariff shortfall. Outstanding shortfall equals approved subsidy requirement minus subsidy funded or paid.',
        methodology:
          'Display the approved annual or year-to-date tariff shortfall in Nigerian naira.',
        source: 'NERC and Federal Ministry of Finance.',
        lastUpdated: '2025-09-30T00:00:00Z',
      },
    },
    {
      id: 'private-capital',
      title: 'Private capital mobilized',
      pillar: 'private-sector-participation',
      scaleMin: 0,
      scaleMax: 15.5,
      baseline: 0,
      current: 0,
      expected: 2.4,
      target: 15.5,
      direction: 'higher-is-better',
      value: '$0.0B',
      targetLabel: 'USD 15.5bn by 2030',
      caption: 'Tracked from the January 2025 baseline',
      trend: {
        change: 0,
        label: 'no change vs Q2 2025',
        direction: 'higher-is-better',
      },
      source: 'requires-validation',
      confidence: 'requires-validation',
      provenance: {
        definition:
          'Cumulative eligible private capital mobilized for last-mile access since the January 2025 Mission 300 tracking baseline.',
        methodology:
          'Cumulative eligible private capital mobilized divided by the USD 15.5 billion target. Excludes public funding and duplicate transactions.',
        source:
          'Federal Ministry of Power, REA, NERC, Federal Ministry of Finance and implementing institutions.',
        lastUpdated: '2025-10-01T00:00:00Z',
      },
    },
  ],

  /* ---------------- Section D — Delivery status and exceptions ------- */
  deliveryStatus: {
    trend: {
      change: 2,
      label: '+2 exceptions vs Q2 2025',
      direction: 'lower-is-better',
    },
    provenance: {
      definition:
        'Consolidated priority delivery status by pillar, linked to unresolved bottlenecks and overdue decisions.',
      methodology:
        'Count approved priority records by Completed, On Track, At Risk, Delayed and Blocked status. Rank exceptions by severity, delivery impact and days unresolved. Unrelated performance percentages are never averaged.',
      source:
        'Compact Progress Report, Implementation Register and Bottleneck Register.',
      lastUpdated: '2025-10-14T09:12:00Z',
    },
    pillars: [
      {
        pillar: 'generation-network',
        label: 'Generation & network',
        total: 18,
        counts: [
          { status: 'completed', count: 2 },
          { status: 'on-track', count: 7 },
          { status: 'at-risk', count: 3 },
          { status: 'delayed', count: 4 },
          { status: 'blocked', count: 2 },
        ],
      },
      {
        pillar: 'last-mile-access',
        label: 'Last-mile access',
        total: 21,
        counts: [
          { status: 'completed', count: 4 },
          { status: 'on-track', count: 12 },
          { status: 'at-risk', count: 2 },
          { status: 'delayed', count: 3 },
          { status: 'blocked', count: 0 },
        ],
      },
      {
        pillar: 'financially-viable-utilities',
        label: 'Viable utilities',
        total: 16,
        counts: [
          { status: 'completed', count: 1 },
          { status: 'on-track', count: 5 },
          { status: 'at-risk', count: 4 },
          { status: 'delayed', count: 4 },
          { status: 'blocked', count: 2 },
        ],
      },
      {
        pillar: 'private-sector-participation',
        label: 'Private sector',
        total: 9,
        counts: [
          { status: 'completed', count: 0 },
          { status: 'on-track', count: 3 },
          { status: 'at-risk', count: 3 },
          { status: 'delayed', count: 2 },
          { status: 'blocked', count: 1 },
        ],
      },
      {
        pillar: 'regional-integration',
        label: 'Regional integration',
        // No approved priority records yet — renders as an empty bar with a
        // "no records" label rather than a misleading full-width segment.
        total: 0,
        counts: [],
      },
      {
        pillar: 'clean-cooking',
        label: 'Clean cooking',
        total: 7,
        counts: [
          { status: 'completed', count: 1 },
          { status: 'on-track', count: 4 },
          { status: 'at-risk', count: 1 },
          { status: 'delayed', count: 1 },
          { status: 'blocked', count: 0 },
        ],
      },
    ],
    exceptions: [
      {
        id: 'cpr-004',
        title: 'Tariff shortfall / cost-reflectivity',
        category: 'Financing',
        institution: 'NERC / FMoF',
        reference: '₦2.2tn subsidy',
        severity: 'critical',
        daysUnresolved: 118,
        provenance: {
          definition:
            'Outstanding tariff shortfall blocking progress toward cost-reflective tariffs.',
          methodology:
            'Approved subsidy requirement minus subsidy funded or paid.',
          source: 'NERC and Federal Ministry of Finance.',
          lastUpdated: '2025-10-10T00:00:00Z',
        },
      },
      {
        id: 'cpr-015',
        title: 'Bilateral contracts on hold',
        category: 'Market reform',
        institution: 'NERC',
        reference: 'CPR-015/016/017',
        severity: 'regulatory',
        daysUnresolved: 74,
        provenance: {
          definition:
            'Bilateral contracting arrangements awaiting regulatory determination.',
          methodology: 'Tracked as an unresolved regulatory bottleneck.',
          source: 'Bottleneck Register.',
          lastUpdated: '2025-10-08T00:00:00Z',
        },
      },
      {
        id: 'cpr-011',
        title: 'Gas Master Plan update',
        category: 'Implementation',
        institution: 'FMoP',
        reference: 'CPR-011',
        severity: 'delayed',
        daysUnresolved: 52,
        provenance: {
          definition: 'Pending update to the Gas Master Plan.',
          methodology: 'Tracked as a delayed priority milestone.',
          source: 'Implementation Register.',
          lastUpdated: '2025-10-05T00:00:00Z',
        },
      },
      {
        id: 'cpr-016',
        title: 'Metering gap in franchise areas',
        category: 'Delivery',
        institution: 'NERC / DisCos',
        reference: 'CPR-016',
        severity: 'blocked',
        daysUnresolved: 39,
        provenance: {
          definition:
            'Metering rollout blocked in specific DisCo franchise areas.',
          methodology: 'Tracked as a blocked priority action.',
          source: 'Implementation Register.',
          lastUpdated: '2025-10-02T00:00:00Z',
        },
      },
      {
        id: 'cpr-022',
        title: 'Transmission evacuation constraint — North East',
        category: 'Implementation',
        institution: 'TCN',
        reference: 'CPR-022',
        severity: 'critical',
        daysUnresolved: 31,
        provenance: {
          definition:
            'Evacuation capacity constraint limiting dispatch of available generation.',
          methodology: 'Tracked as an unresolved critical bottleneck.',
          source: 'Bottleneck Register.',
          lastUpdated: '2025-10-11T00:00:00Z',
        },
      },
    ],
  },
}
