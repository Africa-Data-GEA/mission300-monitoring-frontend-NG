# M300 Dashboard — Database Structure (A–Z)

This is the full data model for the Mission 300 Monitoring & Evaluation Dashboard: every entity currently implemented (as Zod contracts in `src/api/schemas/`, backed by mock data in `src/mocks/data/` and served by `src/mocks/handlers/`), plus everything the real **M300 KPI Matrix** workbook (`docs/EMRC - M300 KPI Matrix v2-0 2026-06-29.xlsx`) specifies that has **not** been built yet.

Conventions used throughout:
- **PK** = primary key / unique identifier.
- **FK** = foreign key, an id field referencing another entity.
- Types are the Zod/TypeScript types actually declared in the schema files.
- "Contract file" points to the exact `src/api/schemas/...` file that owns the shape.

---

## Part 1 — Shared primitives

Used across multiple modules. Defined once, imported everywhere, so a shape can't drift between pages.

### `PillarId` (`common.ts`)
Enum, one of the six Compact pillars: `generation-network`, `last-mile-access`, `financially-viable-utilities`, `private-sector-participation`, `regional-integration`, `clean-cooking`.

### `Trend` (`common.ts`)
| Field | Type |
|---|---|
| change | number (signed) |
| label | string |
| direction | `'higher-is-better' \| 'lower-is-better'` |

### `MetricProvenance` (`common.ts`)
The definition/methodology/source payload behind every info-icon popover.
| Field | Type |
|---|---|
| definition | string |
| methodology | string |
| source | string |
| lastUpdated | ISO datetime |

### Other shared enums (`common.ts`)
- `DeliveryStatus`: completed / on-track / at-risk / lagging / delayed / blocked / limited-data / provisional
- `DataConfidence`: confirmed / requires-validation / future-gap
- `SourceTag`: live / live-cpr / public-source / indicative / requires-validation
- `ImprovementDirection`: higher-is-better / lower-is-better
- `MetricIconName`: access / metering / losses / capital / generation / milestones / pillars / kpis / escalations / institutions / generic

### `FilterOption` (`filters.ts`)
`{ value: string, label: string }` — the atom every dropdown/select is built from.

### Global dashboard filters (`filters.ts`)
`DashboardFilterValues`: `{ period, pillar, institution, priority, geographicScope, distributionCompany, technology }` — one shared filter bar state, read from the URL, applied by pages that opt in (`handle.globalFilters: true` in the route table).

### Pagination envelope — `paginated<T>()` (`administration.ts`)
Every paginated list in the app returns this shape:
| Field | Type |
|---|---|
| items | `T[]` |
| page | number |
| pageSize | number |
| total | number (matching records across **all** pages, not `items.length`) |

---

## Part 2 — Implemented modules

### 2.1 Auth (`auth.ts`)
No persisted entity of its own — thin request/response contracts against Administration's `UserAccount`.

| Schema | Fields |
|---|---|
| `IdentifyAccountRequest` | email |
| `IdentifiedAccount` | email, displayName, institution |
| `LoginRequest` | email, password |
| `LoginResponse` | accessToken, user: { id, name, email, role } |
| `ForgotPasswordRequest/Response` | email / message |

---

### 2.2 Executive Overview (`executive-overview.ts`)

No standalone entities — a read-only aggregation page. Four named headline cards (not an array, so none can go missing):

| Card | Key fields |
|---|---|
| `CompactOutcomeCard` (`peopleWithElectricityAccess`) | current, baseline, target, scaleMin/Max, reportingPeriod |
| `AccessRateCard` | value, rawValue, sourceYear, previousPublication, confidence |
| `GenerationCapacityCard` | availableMw, installedMw, availabilityRatio, sparkline[] |
| `CompactOutcomeCard` (`cleanCookingAccess`) | current, baseline, target, scaleMin/Max, reportingPeriod |

Plus:
- `AccessChannel[]` — one row per delivery channel (grid / mini-grid / SHS): value, rawValue, target (nullable), percentComplete (nullable).
- `BulletMetric[]` — national performance bars: scaleMin/Max, baseline, current, expected (nullable), target (nullable), pillar (FK → PillarId).
- `DeliveryStatusPanel` — `OngoingProject[]` rows shared by the searchable, paginated table and location map + backend-calculated `ProjectStatusSummary[]` for the Apex donut + ranked `Bottleneck[]`. Each project carries latitude/longitude, and completed projects are excluded before the payload is returned.

---

### 2.3 KPI Explorer (`kpi-explorer.ts`) — *just realigned to the real KPI Matrix*

#### `KpiCatalogueRow` — PK `id`
| Field | Type | Notes |
|---|---|---|
| id | string | Real registry id, e.g. `M300-P3-004` |
| name | string | |
| pillar | PillarId | FK |
| category | string | Indicator Type (Output/Outcome/System Performance/Financial/Investment/Governance/Pipeline/Access Quality/Impact — free text, not yet an enum) |
| unit | string | |
| sourceInstitution | string | ≈ "Likely Data Owner" in the real registry |
| sourceDataset | string | Links to Data Submissions' `dataset` field |
| frequency | string | |
| readiness | `'core' \| 'supporting' \| 'future'` | "Tier 1/2/3" |
| validationStatus | `ValidationStatus` (5 values, see below) | |
| lastUpdated | ISO datetime | |

#### `ValidationStatus` (real 5-value vocabulary, from the KPI Matrix's own Field Definition sheet)
`confirmed` / `public-source` / `requires-validation` / `provisional` / `future`.

#### `KpiProfile` — PK `id` (1:1 with `KpiCatalogueRow`, fetched separately since it's heavier)
| Field | Type |
|---|---|
| definition, formula, unit, aggregation, frequency, disaggregation, limitations | string |
| baseline, current, target | number \| null |
| baselineLabel, currentLabel, targetLabel, varianceLabel | string |
| direction | ImprovementDirection |
| trend | Trend (optional) |
| history | `KpiHistoryPoint[]` |
| sourceInstitution, sourceDataset, sourceReference, reportingPeriod | string |
| validationStatus | ValidationStatus |
| validationDecision | string |
| version | string |
| confidence | DataConfidence |
| provenance | MetricProvenance |
| linkedRecords | `LinkedRecord[]` |

#### `KpiHistoryPoint`
`{ period, value, validationStatus, submissionId: string | null }` — `submissionId` is the join key back to Data Submissions (§2.7); null for points seeded before that traceability existed.

#### `LinkedRecord`
`{ id, type: 'programme'|'project'|'milestone'|'action', title, institution, status }` — a KPI's cross-reference into Programs.

**Coverage note:** only 16 of the real registry's 86 KPIs are implemented (§3.1 has the rest).

---

### 2.4 Programs (`programs.ts`) — consolidates the former Implementation Register + Bottlenecks pages as a drill-down

#### `ProgrammeRecord` — PK `id` (e.g. `PRG-2025-001`)
| Field | Type |
|---|---|
| id, name | string |
| leadInstitution | string |
| supportingInstitutions | string[] |
| pillar | PillarId |
| objectives | string |
| financing | string \| null |
| status | ExecutionStatus |
| priority | `'priority' \| 'standard'` |
| startDate, endDate | ISO datetime |
| bottlenecks | string[] — **FK array** into `BottleneckRecord.id` |
| bottleneckCategory | BottleneckCategory \| null |
| validationStatus | ValidationStatus (KPI Explorer's vocabulary, reused) |
| lastUpdate | ISO datetime |

#### `ProjectRecord` — PK `id` (e.g. `PRJ-2025-011`) — FK `programmeId` → Programme
Aligned field-for-field to the real **Programme & Project tracking workbook** ("Project Register" sheet):
| Field | Type | Workbook column |
|---|---|---|
| id | string | Project Register ID |
| name | string | Projects |
| programmeId, programmeName | string | Program |
| owner | string | Agency / Organization |
| location, coverage | string | — |
| pillar | PillarId | M300 Pillar Alignment |
| lifecycleStage | LifecycleStage | — |
| programType | ProgramType | Program Type |
| fundingSource | string \| null | Funding Sources |
| fundingStructure | string | Funding Structure |
| fundingStatus | FundingStatus | Funding Status |
| projectedStatus | ExecutionStatus | Projected Status |
| currentStatus | ExecutionStatus | Current Project Status |
| endDate | ISO datetime | Projected Completion Date |
| comment | string | Comment – Issues/Main Risk/Bottlenecks |
| suggestion | string | Suggestion |
| bottlenecks | string[] (FK) | (derived from Comment/Risk column) |
| profile | ProjectProfile | (drill-down, not in the workbook row) |

`ProgramType`: grant / concessional-loan / ppp / government-funded / blended-finance.
`FundingStatus`: committed / disbursing / fully-disbursed / at-risk / unfunded.

#### `ProjectProfile` (embedded in ProjectRecord)
`{ description, budgetUsd, disbursedUsd, contractor: string|null, contactName, contactEmail, documents[{label,url}], updates[{date,note}] }`

#### `MilestoneRecord` — PK `id` — FK `projectId` → Project
`{ id, name, projectId, projectName, priority, expectedDate, actualDate: string|null, status: ExecutionStatus, leadInstitution, evidenceUrl: string|null, risk, nextAction, bottleneckCategory: BottleneckCategory|null, validationStatus }`

#### Headline cards (`ProgramsHeadlineCards`)
Four named cards: `summary` (active programmes/projects), `milestoneOnTime`, `delayedOrBlocked`, `evidenceOverdue` — same pattern as Executive Overview.

**Not implemented (dropped in the consolidation):** an Actions tracker entity, and bulk import/export of the register.

---

### 2.5 Bottlenecks (`bottlenecks.ts`) — now reached only via a project's detail page, not a standalone route

#### `BottleneckRecord` — PK `id` (e.g. `BTN-2025-004`)
| Field | Type |
|---|---|
| id, issue | string |
| category | BottleneckCategory (financing/procurement/permitting/regulatory-approval/coordination/technical-constraint/implementation-delay/data-or-reporting) |
| severity | RegisterSeverity (critical/high/medium/low) |
| pillar | PillarId |
| linkedRecord | string — free-text reference; **also** the value a project's `bottlenecks[]` array points back with |
| institution | string |
| dateRaised | ISO datetime |
| ageDays | number |
| followUp | string |
| escalationStatus | not-escalated/escalated/overdue/resolved |
| status | open/in-progress/blocked/escalated/resolved |
| lifecycleStage | LifecycleStage (identification/design/procurement/implementation/commissioning/operations) |

#### `EscalationRecord` — PK `id` — FK `bottleneckId` → BottleneckRecord
`{ id, bottleneckId, decisionRequired, level: EscalationLevel, owner, dueDate, daysOverdue, status, resolution: string|null, evidenceUrl: string|null }`

#### `CreateBottleneckRequest` (POST body)
`{ issue, category, severity, pillar, linkedRecord?, institution, lifecycleStage, followUp? }` — server assigns id, dateRaised, ageDays, initial status.

---

### 2.6 Data Submissions & Validation (`data-submissions/*`)

#### `WorkflowStatus` (shared)
`{ code, label, tone }` — code is one of: due/draft/validation-failed/ready/pending-review/returned/rejected/provisional/approved/overdue/missing/open/in-progress/resolved.

#### `Obligation` — PK `id`
`{ id, institution, dataset, reportingPeriod, frequency, dueDate, dueLabel, status: WorkflowStatus, template: SubmissionTemplate, acceptedSubmissionId: string|null, availableActions: WorkflowAction[] }`

#### `SubmissionListItem` — PK `id`
`{ id, institution, dataset, reportingPeriod, method: SubmissionMethod, methodLabel, version, submittedBy, submittedAt: string|null, submittedAtLabel, status, validationSummary, availableActions }`

#### `ValidationQueueItem` extends `SubmissionListItem`
Adds: `reviewer, ageLabel, automatedCheck: WorkflowStatus, issueCount`.

#### `SubmissionDetail` extends `ValidationQueueItem`
Adds: `fileName: string|null, sourceReference, notes, issues: ValidationIssue[], history: StatusHistoryItem[], permittedDecisions[], extractedValues: KpiExtraction[]`.

#### `KpiExtraction` — the join to KPI Explorer
`{ kpiId, kpiName, reportingPeriod, value }` — what a clean submission is ready to publish; empty array if the pipeline hasn't extracted anything yet (e.g. unresolved validation issues).

#### `ValidationDecisionRequest/Response`
Request: `{ decision: approved|provisional|returned|rejected, comments }`.
Response: `{ submissionId, status, message, nextUrl, published: KpiExtraction[] }` — `published` is non-empty only for approved/provisional decisions.

#### `ManualEntryDefinition` / `UploadDefinition`
Form/upload configuration per obligation: `EntrySection[]` of `EntryField` (text/number/date/select/textarea), or `SubmissionTemplate` + accepted file types.

#### `OverdueItem` — PK `id`
`{ id, institution, dataset, reportingPeriod, dueDate, dueDateLabel, overdueLabel, owner, status, availableActions }`

#### `DataGap` — PK `id` — FK `kpiId` → KpiCatalogueRow
`{ id, kpiId, kpiName, pillar, institution, reportingPeriod, category, readinessTier, owner, nextAction, status, availableActions }`

---

### 2.7 Stakeholders & Institutions (`stakeholders.ts`)

#### `Institution` — PK `id`
`{ id, name, shortName, type: InstitutionType, status: InstitutionStatus, coverage, roles: string[], datasets: string[], programmes: string[], lastUpdated }`
- `InstitutionType`: ministry/agency/regulator/utility/disco/programme-team/partner
- `InstitutionStatus`: active/pending-onboarding/inactive

#### `CustodianAssignment` — PK `id`
`{ id, dataset, custodian, focalPerson, frequency, template, reviewer, validator, status: active|pending }`

---

### 2.8 User Access & Administration (`administration.ts`)

#### `UserAccount` — PK `id`
`{ id, name, email, institution, designation, role: SystemRole, status: AccountStatus, lastLogin: string|null, createdAt }`
- `SystemRole`: system-administrator / institutional-data-provider / data-reviewer / validator / dashboard-manager / oversight-user / read-only-user
- `AccountStatus`: active/pending/inactive/suspended

#### `RoleDefinition` — PK `role`
`{ role, label, description, permissions: Permission[], modules: string[], assignedUsers }`
- `Permission`: view/submit/edit/validate/approve/export/administer

#### `ScopeAssignment` — PK `id` — FK `userId` → UserAccount
`{ id, userId, userName, level: ScopeLevel, scope, responsibility, effectiveFrom, effectiveTo: string|null, active }`
- `ScopeLevel`: national/state/distribution-company/institution/programme/project/dataset/indicator — **this is the real-world RBAC scoping model, defined but not yet enforced anywhere** (see §3.5).

#### `AuditEvent` — PK `id` — FK `userId` → UserAccount
`{ id, timestamp, userId, userName, action, module, recordId: string|null, priorValue: string|null, newValue: string|null, result: AuditResult, reference: string|null }`
- `AuditResult`: success/failure/rejected
- Already receiving real cross-module events (e.g. "Published KPI value" from the Data Submissions → KPI Explorer publish flow).

---

### 2.9 State & DisCo Performance (`state-disco/*`)

Mostly display-formatted (`value: string`, not raw numbers) since it's a wide comparison-table page, not a drill-down profile.

- `StateCoverageRow` — PK `id`: state, zone, miniGridConnections, solarHomeSystems, activeProgrammes, activeProjects, openBottlenecks, validationLabel, coverageBarPercent.
- `StateRecord` — `{ id, type: programme|project|bottleneck, name, owner, status, deliveryLabel, sourceLabel }` — a state-drill-down's linked records.
- `UtilityOperationsRow` — PK `id`: utility, effectiveOrder, `bands: ServiceBandCell[]` (band A–E: supplyHours, tariff, intensityPercent).
- `DeliveryRow` — PK `id`: utility, milestone, dueDateLabel, executionStatus, achievedLabel, evidenceLabel, reportingCompliance, bottleneck.
- `DiscoComparisonRow` — PK `id`: activeCustomers, meteredCustomers, unmeteredCustomers, meteringRate, energyReceived/Billed, billingEfficiency, revenueBilled/Collected, collectionEfficiency, remittancePerformance, validationLabel.

---

## Part 3 — Not yet implemented, per the M300 KPI Matrix

Everything below is real, specified structure from `docs/EMRC - M300 KPI Matrix v2-0 2026-06-29.xlsx` that has no corresponding code yet.

### 3.1 Full Master KPI Registry (86 KPIs vs. 16 implemented)

The real registry sheet has columns my `KpiCatalogueRow`/`KpiProfile` don't carry at all:

| Missing field | What it is |
|---|---|
| Likely Data Owner | Distinct from `sourceInstitution` — who *owns* the data, not just where it's read from |
| Primary Data Source / Secondary Data Source | Two separate fields; I only have one |
| Data Collection Method | How the value gets from source to dashboard |
| Data Format | PDF table / Excel factsheet / portal export, etc. |
| Calculation Logic | Full derivation formula (I have a shorter `formula` field) |
| Visualization Type | Each KPI specifies its own chart type (Summary Card / Trend Line / Distribution Chart) |
| Decision Use | Narrative: why this KPI matters for a management decision |
| **Confidence Level** | High/Medium/Low — a dimension entirely separate from Validation Status; not modelled at all |

Also unmodelled: the remaining 70 KPIs themselves, spanning Indicator Types I have no real examples of yet (Governance, Investment, Pipeline, Access Quality, Impact beyond the ones already ported).

### 3.2 Evidence Basis (KPI value/target traceability)

A full vocabulary exists for "what backs this value" that nothing in the app captures:
`Published Report` / `Agency Submission` / `Derived Value` / `Workbook Reference` / `Validation Note` / `No Evidence` — each with a required format (document name + reference period + page/table for a Published Report; submission date + agency + focal point for an Agency Submission; etc.).

**Proposed shape** (discussed, not built): a `KpiTargetRevision` entity — `{ id, kpiId, baseline, target, effectiveFrom, setBy, approvedBy, evidenceBasis, sourceReference, rationale }` — versioned so `KpiProfile.baseline/target` becomes *derived* (latest effective revision) instead of a flat mutable field, with every revision written to the existing `AuditEvent` log.

### 3.3 CPR Master (Compact Progress Report — the likely real source behind "Bottlenecks")

A parallel action-tracking sheet, structured very differently from my `BottleneckRecord`:

| Field | Notes |
|---|---|
| CPR Ref | PK, e.g. `CPR-001` |
| Policy Area | Groups actions (like `BottleneckRecord.category`, but a different taxonomy) |
| Action | The action text itself |
| Priority Action? | Yes/No flag — I have severity instead |
| Expected/Actual Completion Date | Two dates, mirrors Programs' projected/actual pattern |
| Status | Recolours automatically per a dropdown (On Track / etc.) |
| Last Update | |
| Comment | |
| M300 Tracked | Flag |
| Lead Custodian / Supporting Institutions | FK-style to Stakeholders |
| Milestone | Text, not a separate entity |
| Evidence Required / Evidence Status | Not Submitted / Submitted / etc. |
| Output | What the action produces |
| Data Collection Method | |
| Dashboard View | Which page surfaces this row |
| **Risk / Bottleneck** | Free text — suggests a "bottleneck" in the real system is a *field on an action row*, not a first-class entity the way I built it |
| Next Action | |
| CDMU Verification | Verification workflow state, distinct from my `validationStatus` |
| Reviewer Comment | |

This suggests **Programs' bottleneck model may need to fold into a CPR-style action tracker** rather than staying a separate top-level register — worth a design discussion before building it.

### 3.4 Stakeholder Map (richer than the implemented `Institution`)

| Field | Notes |
|---|---|
| Institution | matches existing `Institution.name` |
| Mandate (Public Source) | Full narrative — not modelled at all |
| Data Relevance to Dashboard | Narrative |
| Type of Data Controlled | List, more granular than `Institution.datasets` |
| Likely Access Pathway | e.g. "publicly available at nerc.gov.ng" vs "requires formal data request" — **this is exactly the institution-access-pathway concept RBAC needs** |
| Sensitivity Level | Low/Medium/High — not modelled |
| Primary / Secondary | Whether this institution is the primary or secondary source for its data |

### 3.5 Institution-scoped access (RBAC) — discussed, not built

`ScopeAssignment` (§2.8) already models "this user is scoped to this DisCo/programme/dataset," but **nothing enforces it**: the sidebar renders every ready nav item for every logged-in user regardless of role or scope, and no route or query filters by the current user's institution. Building this means:
- A current-user context (decode `LoginResponse.user` → look up `RoleDefinition.modules` + `ScopeAssignment[]`).
- Sidebar filtering by `RoleDefinition.modules`.
- Query-level filtering by scope (e.g. an Institutional Data Provider scoped to "Ikeja DisCo" only ever sees Ikeja's obligations/submissions).
- Per-institution template generation for Data Submissions (an agency downloads a template scoped to *its* expected KPIs only) — explicitly requested in the stakeholder meeting transcript.

### 3.6 Data Source Mapping

`{ Data Source, Custodian Institution, KPIs Supported, Access Type, URL/Reference, Update Frequency, Data Gap Flag }` — a many-to-many map between data sources and the KPIs they feed, with an explicit gap flag. Nothing today models "which KPIs does this one source feed" as its own entity — it's implicit in each `KpiCatalogueRow.sourceDataset`.

### 3.7 Preliminary Baseline & Source Details sheets

Reference data (53 and 50 rows respectively) not yet mapped to any implemented entity — likely source material for the `baseline`/`target` figures now populated in KPI profiles (§2.3), useful for extending coverage to the remaining 70 KPIs.

### 3.8 Pages with no implementation at all

- **Compact pillar dashboards** (`/pillars/:pillar`) — nav item exists, `ready: false`, no schema or page.
- **Reports & Exports** (`/reports`) — nav item exists, `ready: false`, no schema or page. The KPI Matrix's Visualization Type field (§3.1) would likely drive what this renders per KPI.
- **Actions tracker** — deliberately dropped when Implementation Register merged into Programs; §3.3's CPR Master suggests it may resurface as part of a bottleneck/action redesign rather than a standalone entity.
- **Bulk import/export of the register** — same, dropped in the Programs consolidation.

---

## Quick reference — entity relationship summary

```
UserAccount ──< ScopeAssignment
UserAccount ──< AuditEvent
RoleDefinition ──< UserAccount (by role)

Institution ──< CustodianAssignment (by dataset)

ProgrammeRecord ──< ProjectRecord (programmeId)
ProjectRecord ──< MilestoneRecord (projectId)
ProjectRecord >── BottleneckRecord (bottlenecks: string[])
BottleneckRecord ──< EscalationRecord (bottleneckId)

Obligation ──> SubmissionListItem (acceptedSubmissionId)
SubmissionListItem ──> ValidationQueueItem ──> SubmissionDetail
SubmissionDetail ──< KpiExtraction ──> KpiCatalogueRow (kpiId)
  (a publish decision writes a KpiHistoryPoint + an AuditEvent)

KpiCatalogueRow ──> KpiProfile (1:1, id)
KpiProfile ──< KpiHistoryPoint
KpiProfile ──< LinkedRecord (→ Programs entities)

DataGap ──> KpiCatalogueRow (kpiId)
```
