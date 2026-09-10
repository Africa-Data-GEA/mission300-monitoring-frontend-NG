import type { LearningLogEntry } from '@/api/schemas/learning-log'

/**
 * Seed data for the Learning & Decision Log.
 *
 * The first three entries are real: they record the actual decisions made
 * during the SE4ALL MRL alignment review (docs/se4all-mrl-alignment-
 * renewable-private-capital.md), not invented examples — this is genuinely
 * what the log exists to capture.
 */
export const learningLogEntries: LearningLogEntry[] = [
  {
    id: 'LOG-2026-001',
    title: 'Split renewable share into two distinct KPIs',
    area: 'kpi-methodology',
    decision:
      'Renamed M300-P1-004 to "Renewable Generation Share" (unchanged GWh/GWh figure) and added a new KPI, M300-P1-015 "Renewable Installed Capacity Share" (MW/MW). Both are preserved; neither replaces the other. The Compact Progress Report export now reads M300-P1-015, while the day-to-day dashboard headline keeps showing M300-P1-004.',
    rationale:
      "SE4ALL's CPR-canonical indicator is installed capacity share, not generation-mix share — a genuinely different quantity (a grid can have high capacity share and low generation share, or vice versa). Reporting one as the other would misstate progress against the CPR target in either direction.",
    relatedRecord: 'M300-P1-015',
    reviewCycle: 'SE4ALL MRL alignment review, Sep 2026',
    status: 'decided',
    decidedBy: 'EMRC platform team',
    decidedAt: '2026-09-10T09:00:00Z',
  },
  {
    id: 'LOG-2026-002',
    title: 'Added a transaction-level private-capital ledger',
    area: 'kpi-methodology',
    decision:
      'Added M300-P4-008, a canonical private-capital KPI computed from a real transaction ledger that excludes public co-funding and collapses guarantee-for-loan pairs. M300-P4-002 (the existing manually-entered total) is left untouched pending national-scale ledger coverage. The Compact Progress Report export now reads M300-P4-008.',
    rationale:
      "SE4ALL requires the private-capital figure to exclude public funding and duplicate guarantees — a rule that can only be checked against individual transactions, not a single rolled-up quarterly total. A manually-typed number can't be audited for double-counting after the fact.",
    relatedRecord: 'M300-P4-008',
    reviewCycle: 'SE4ALL MRL alignment review, Sep 2026',
    status: 'decided',
    decidedBy: 'EMRC platform team',
    decidedAt: '2026-09-10T09:15:00Z',
  },
  {
    id: 'LOG-2026-003',
    title: 'Dashboard headline figures stay on legacy KPIs pending national scale',
    area: 'kpi-methodology',
    decision:
      "Chose NOT to switch the Executive Overview dashboard's renewable-share and private-capital headline cards to the new canonical KPIs yet — they still show M300-P1-004 and M300-P4-002. Only the Compact Progress Report export was repointed.",
    rationale:
      'Silently changing an already-published headline figure carries real risk if the new KPI is still pilot-scale (10 sample transactions; a hydro-plus-estimate capacity figure). The CPR is the one place SE4ALL actually reads, so that got the canonical figure first; the dashboard switches once the underlying data reaches national submission volume.',
    relatedRecord: null,
    reviewCycle: 'SE4ALL MRL alignment review, Sep 2026',
    status: 'decided',
    decidedBy: 'EMRC platform team',
    decidedAt: '2026-09-10T09:20:00Z',
  },
  {
    id: 'LOG-2026-004',
    title: 'Workbook row shift for private capital — needs Victor to scope',
    area: 'data-governance',
    decision: 'Not yet actioned — could not be located in this frontend repository.',
    rationale:
      "Victor's memo flags a workbook row that shifted for the private-capital figure. Nothing in this repo (export-excel.ts, data-submissions templates) has private-capital-specific row logic, so this is very likely in an external submission workbook or the backend repo. Logged here so it isn't lost, pending Victor pointing at the specific file.",
    relatedRecord: 'M300-P4-002',
    reviewCycle: 'SE4ALL MRL alignment review, Sep 2026',
    status: 'proposed',
    decidedBy: 'EMRC platform team',
    decidedAt: '2026-09-10T09:25:00Z',
  },
]
