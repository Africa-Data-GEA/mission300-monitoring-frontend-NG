/**
 * Transaction-level ledger backing the canonical private-capital KPI
 * (M300-P4-008), added per the SE4ALL MRL alignment review (docs/se4all-
 * mrl-alignment-renewable-private-capital.md).
 *
 * WHY THIS EXISTS. The pre-existing `M300-P4-002` ("Private Capital
 * Mobilized for Last-Mile Access") is a single manually-entered quarterly
 * total (currently USD 210M) with no transaction trail behind it — nothing
 * enforces SE4ALL's rule that the figure must exclude public co-funding and
 * must not double-count a guarantee alongside the loan it backs. Those rules
 * can't be checked against a single rolled-up number after the fact; they
 * need the individual deals that add up to it, the same reasoning that put a
 * beneficiary-event ledger under the electricity-access and clean-cooking
 * canonical KPIs (see beneficiary-events.ts).
 *
 * M300-P4-002 is left untouched — this is a smaller, separately-tracked
 * "canonical" figure sitting alongside it, not a replacement.
 */

export type FinancingInstrument = 'equity' | 'debt' | 'guarantee' | 'grant-leveraged' | 'other'
export type TransactionVerificationStatus = 'unverified' | 'verified' | 'rejected'

export interface PrivateCapitalTransaction {
  readonly id: string
  readonly amountUsdMillion: number
  readonly instrument: FinancingInstrument
  /** True for a transaction that is itself public funding (e.g. a DFI
   * concessional loan) — excluded from the private-capital total entirely. */
  readonly isPublicFunding: boolean
  /**
   * Set only on a `guarantee`-instrument transaction: the id of the
   * financing instrument (typically a `debt` transaction) it backs. A
   * guarantee backing an already-counted loan is not itself new capital, so
   * it is excluded from the total whenever this is non-null — otherwise the
   * same underlying money would be counted twice, once as the loan and once
   * as the guarantee behind it.
   */
  readonly guaranteeFor: string | null
  readonly verificationStatus: TransactionVerificationStatus
  readonly committedDate: string
  readonly sourceInstitution: string
}

/** Ten transactions: a mix of counted capital, a public-funded one, an
 * unverified one, a rejected one, and two guarantee-for-loan pairs — every
 * exclusion rule this KPI enforces has at least one transaction on record to
 * prove it actually excludes something. */
export const PRIVATE_CAPITAL_TRANSACTIONS: readonly PrivateCapitalTransaction[] = [
  { id: 'TXN-001', amountUsdMillion: 25, instrument: 'equity', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-02-10', sourceInstitution: 'Africa Finance Corporation' },
  { id: 'TXN-002', amountUsdMillion: 40, instrument: 'debt', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-05-14', sourceInstitution: 'Standard Chartered Nigeria' },
  { id: 'TXN-003', amountUsdMillion: 40, instrument: 'guarantee', isPublicFunding: false, guaranteeFor: 'TXN-002', verificationStatus: 'verified', committedDate: '2025-05-14', sourceInstitution: 'MIGA' },
  { id: 'TXN-004', amountUsdMillion: 15, instrument: 'grant-leveraged', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-06-20', sourceInstitution: 'GEAPP' },
  { id: 'TXN-005', amountUsdMillion: 10, instrument: 'equity', isPublicFunding: true, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-07-01', sourceInstitution: 'Federal Ministry of Finance' },
  { id: 'TXN-006', amountUsdMillion: 20, instrument: 'debt', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'unverified', committedDate: '2025-08-15', sourceInstitution: 'Sun King Nigeria' },
  { id: 'TXN-007', amountUsdMillion: 8, instrument: 'equity', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-09-10', sourceInstitution: 'All On' },
  { id: 'TXN-008', amountUsdMillion: 5, instrument: 'other', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'rejected', committedDate: '2025-09-25', sourceInstitution: 'Unnamed developer' },
  { id: 'TXN-009', amountUsdMillion: 30, instrument: 'debt', isPublicFunding: false, guaranteeFor: null, verificationStatus: 'verified', committedDate: '2025-10-30', sourceInstitution: 'FSD Africa Investments' },
  { id: 'TXN-010', amountUsdMillion: 30, instrument: 'guarantee', isPublicFunding: false, guaranteeFor: 'TXN-009', verificationStatus: 'verified', committedDate: '2025-10-30', sourceInstitution: 'GuarantCo' },
]

export interface PrivateCapitalSummary {
  readonly totalUsdMillion: number
  readonly countedTransactions: number
  readonly excludedPublicFunding: number
  readonly excludedUnverifiedOrRejected: number
  readonly excludedDuplicateGuarantees: number
  readonly asOfPeriod: string
}

/** Applies SE4ALL's two rules: drop public funding, and drop a guarantee
 * transaction whenever it merely backs an already-counted instrument rather
 * than being new capital in its own right. Only `verified` transactions
 * count at all — `unverified`/`rejected` are excluded regardless. */
export function summarizePrivateCapital(
  transactions: readonly PrivateCapitalTransaction[] = PRIVATE_CAPITAL_TRANSACTIONS,
): PrivateCapitalSummary {
  const isDuplicateGuarantee = (t: PrivateCapitalTransaction) => t.instrument === 'guarantee' && t.guaranteeFor !== null

  const counted = transactions.filter(
    (t) => t.verificationStatus === 'verified' && !t.isPublicFunding && !isDuplicateGuarantee(t),
  )

  return {
    totalUsdMillion: counted.reduce((sum, t) => sum + t.amountUsdMillion, 0),
    countedTransactions: counted.length,
    excludedPublicFunding: transactions.filter((t) => t.isPublicFunding).length,
    excludedUnverifiedOrRejected: transactions.filter((t) => !t.isPublicFunding && t.verificationStatus !== 'verified').length,
    excludedDuplicateGuarantees: transactions.filter((t) => !t.isPublicFunding && isDuplicateGuarantee(t)).length,
    asOfPeriod: transactions.reduce((latest, t) => (t.committedDate > latest ? t.committedDate : latest), '2025-01-01'),
  }
}
