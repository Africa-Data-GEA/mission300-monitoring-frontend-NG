# SE4ALL MRL alignment — Renewable Share & Private Capital

**Date:** 27 August 2026
**Trigger:** Victor's memo (confidential SE4ALL MRL guidance note, not yet
published) flagging two explicit **conflicts** between EMRC's current KPI
baseline and SE4ALL's CPR-canonical definitions. Every other row in his table
was "Partial Gap" or "Aligned" — additive fixes. These two are the only rows
where the *existing number means a different thing* than what SE4ALL will
require, so they're the ones that need a decision before any code changes.
**Status:** Proposal for review on the next call. Nothing described here has
been implemented yet.

---

## 1. Renewable share

### 1.1 What exists today

`M300-P1-004` in `src/mocks/data/kpi-explorer.ts:1146-1188` (surfaced on the
dashboard as `'renewable-share'` via `src/mocks/data/executive-overview.ts:265`,
and read into the Compact Progress Report's Key Targets page via
`buildCompactProgressReportData()` in
`src/features/reports/lib/compact-progress-report-data.ts:100-101, 119-124`):

| Field | Current value |
|---|---|
| Name | "Renewable Energy Share in Generation Mix" |
| Formula | `(Total renewable generation GWh ÷ total generation GWh) × 100` |
| Current reading | 38.31% |
| Own `limitations` field (already on record) | *"Current figure counts hydro only — solar and wind generation-mix data is not yet consistently reported, so the true renewable share may differ materially once included."* |

So the app already knows this number is a generation-mix figure, and already
flags it as incomplete (hydro-only). That transparency is good; it doesn't
change the fact that it answers a different question than SE4ALL's.

### 1.2 The conflict

SE4ALL's CPR-canonical indicator is **installed capacity share**:
`installed renewable capacity MW ÷ total installed capacity MW`. This is not a
relabeling of the same number — a grid can have a high renewable *capacity*
share and a low renewable *generation* share (intermittent sources with low
capacity factors), or vice versa. Reporting one as if it were the other would
misstate progress against the CPR target in either direction.

### 1.3 Proposed disposition

Per Victor's required disposition ("preserve both KPIs, rename them
distinctly, and map capacity share to CPR"):

1. **Rename `M300-P1-004`**, keep its current formula and history untouched:
   `"Renewable Energy Share in Generation Mix"` → **"Renewable Generation
   Share"**. No data changes — this stays the hydro-only GWh/GWh figure,
   still under `M300-P1-004`, still feeding the pillar dashboard's existing
   `generation-network` KPI list (`src/mocks/data/pillar-dashboard.ts:31`).
2. **Add a new KPI**, tentatively `M300-P1-013` (next free ID in that
   pillar's sequence — confirm against the live KPI registry before
   assigning), **"Renewable Installed Capacity Share"**:
   - Formula: `(Installed renewable capacity MW ÷ total installed capacity
     MW) × 100`
   - Same shape as every other `KpiRecord` (definition, formula, unit,
     baseline/current/target, history, provenance) — no new schema needed,
     just a new row.
3. **Point the CPR export at the new KPI, not the old one.** Today
   `compact-progress-report-data.ts:100-101` does:
   ```ts
   const renewables = nationalPerformance.find((metric) => metric.id === 'renewable-share')
   ```
   This becomes a lookup against the new capacity-share KPI's id instead —
   the one place in the app where the CPR-canonical number, not the
   generation-mix number, needs to appear. The dashboard's own headline/pillar
   cards keep showing generation share (still a legitimate, useful metric —
   just not the CPR one), so nothing on the day-to-day dashboard silently
   changes value or shifts un-explained.
4. Both KPIs stay visible and separately labeled in the KPI Directory, so an
   auditor can see the two are deliberately distinct rather than one replacing
   the other.

### 1.4 Open question for the call

Nigeria's actual installed-capacity-by-source breakdown isn't in the mock
data yet (only generation-by-source is). Confirm whether Victor/CDMU can
supply a real baseline figure, or whether this ships first as
`requires-validation` placeholder data like `M300-P4-002` already does.

---

## 2. Private capital

### 2.1 What exists today

`M300-P4-002` in `src/mocks/data/kpi-explorer.ts:1929-1971`
(`'private-capital'` in `executive-overview.ts:310`):

| Field | Current value |
|---|---|
| Name | "Private Capital Mobilized for Last-Mile Access" |
| Formula | "Sum of confirmed private capital commitments under approved capital-counting rules" |
| Current reading | USD 210M (Q4 2025), against a USD 15.5B 2030 target |
| Own `limitations`/`validationStatus` (already on record) | Already marked `requires-validation` — *"No formal Compact tracking baseline exists yet... illustrative early-pipeline trajectory, not institutionally confirmed data."* |

This is a single running total per quarter (see `history` array) — there is no
transaction-level record behind it anywhere in the app.

### 2.2 The conflict

SE4ALL's definition — "cumulative verified committed private financing,
excluding public funding and duplicate guarantees/transactions" — is
conceptually close to what's already written down, but the current KPI has no
mechanism to *enforce* the exclusions. A single quarterly total can't be
audited for double-counted guarantees or accidentally-included public
co-funding; you'd have to trust whoever typed the number in.

Victor also flags a **workbook row shift** — I could not find this inside
this frontend repository (`export-excel.ts` is generic and has no
private-capital-specific row logic; nothing in `src/features/data-submissions`
references a private-capital template). This is very likely in an external
submission workbook or the backend repo, not something reachable from here.
**Needs Victor to point at the specific file before this can be scoped.**

### 2.3 Proposed disposition

1. **Add a transaction-level ledger** as a new record type, e.g.
   `PrivateCapitalTransaction`:
   ```ts
   interface PrivateCapitalTransaction {
     id: string
     amountUsd: number
     instrument: 'equity' | 'debt' | 'guarantee' | 'grant-leveraged' | 'other'
     isPublicFunding: boolean       // excluded from the KPI roll-up if true
     linkedGuaranteeId: string | null  // de-dup key for guarantee chains
     committedDate: string
     verificationStatus: 'unverified' | 'verified' | 'rejected'
     sourceInstitution: string
   }
   ```
2. **`M300-P4-002` becomes a derived figure**: sum of `amountUsd` where
   `isPublicFunding === false` and `verificationStatus === 'verified'`, with
   guarantee chains collapsed by `linkedGuaranteeId` so a guarantee and the
   loan it backs aren't both counted. The KPI keeps its existing id, name and
   target — only how `current` is computed changes, from "manually entered
   total" to "computed from the ledger."
3. This is additive to the existing data-submissions validation states
   (`pending/returned/rejected/provisional/confirmed` — already aligned per
   Victor's own table) — each ledger entry moves through the same states,
   just at transaction grain instead of KPI-total grain.

### 2.4 Open question for the call

Whether the ledger is entered directly (new submission template, backend
schema addition) or derived from existing Programme/Project financing fields
already in `mocks/data/programs.ts` — and where exactly the "workbook row
shifted" bug lives, since that's evidently a known, already-identified issue
Victor can point at directly rather than something to go hunting for.

---

## 3. What this proposal deliberately does not touch

Per Victor's own alignment table, everything else (results-framework linkage,
canonical CPR crosswalk in general, electricity-access and clean-cooking
redefinition, taxonomy/metadata, submission/validation, auditability,
governance roles, ingestion architecture, learning log, privacy controls,
independent verification) is either "Aligned" or a "Partial Gap" that's
additive rather than a redefinition of an existing number. Those are real
follow-up work but don't carry the same risk of silently changing what an
already-published figure means, so they're out of scope for this note and can
be sequenced separately.
