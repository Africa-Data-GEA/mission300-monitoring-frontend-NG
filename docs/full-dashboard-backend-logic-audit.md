# M300 Monitoring Platform — Full Dashboard Backend Logic Audit

**Date:** 25 August 2026  
**Scope:** Entire dashboard, not only document upload  
**Systems compared:** React frontend, deployed Nigeria PHP backend source, `m300-demo-backend`, approved requirements and source documents  
**Constraint observed:** No backend code or backend data was changed.

## 1. Executive conclusion

The deployed PHP backend is **not a production-ready monitoring backend** for the dashboard shown by the frontend. It is a partial API-shaped prototype containing a mixture of database reads, fixed arrays, mock records and temporary JSON/file persistence.

Successful login and HTTP `200` responses do not prove that the dashboard is working. Many routes return structurally valid responses while failing the more important tests:

- the figures are not calculated from approved source records;
- uploaded data does not flow through validation, approval and publication into KPIs;
- filters are ignored or only partially applied;
- programme, project and bottleneck workflows are incomplete;
- several frontend actions call routes that do not exist in PHP;
- role and institutional scope are not enforced consistently on the server;
- reports do not aggregate the actual dashboard data;
- most actions do not create an audit trail;
- public pages depend on protected endpoints even though a public endpoint exists;
- fixed values are presented with credible-looking provenance and validation labels.

The strongest implementation in the available code is the separate `m300-demo-backend` submission pipeline. It genuinely parses, validates, calculates, reviews, publishes and audits **two datasets/KPIs only**. Its own documentation explicitly says it is a proof of the pipeline and does not implement the complete dashboard.

## 2. Sources of truth used

The assessment used the following approved or project-provided material:

- `public/GEAPP Reporting.xlsx`
- `public/M 300 Initial Setup Questions.xlsx`
- `public/Snapshot of CDMU Convening Slides.pptx.pdf`
- `docs/EMRC - Inception Report for the Design and Implementation of the M300 Monitoring Dashboard for Nigeria v0-1 2026-02-16.docx`
- `docs/EMRC - M300 KPI Matrix v2-0 2026-06-29.xlsx`
- `docs/M300 Monitoring Platform Feedback.pptx`, including slide notes
- `docs/source/EMRC - M300 Dashboard Page Specifications v0-3 2026-07-17.xlsx`
- `docs/source/EMRC - M300 Dashboard Configuration Wireframe v0-1 2026-06-10.pdf`
- all module specifications under `docs/specs/`
- the frontend runtime schemas and `docs/API.md`
- PHP routes, controllers, repositories and SQL schema under `mission300-monitoring-backend-NG/api/`
- the separate `m300-demo-backend` source, database migrations, framework seed, tests and backend contract.

The inception report is explicit that this is not merely a visual dashboard. It must provide an integrated monitoring architecture with acquisition, validation, aggregation, reporting, governance, traceability and access control.

## 3. Which backend the frontend currently uses

The frontend is configured as follows:

```text
VITE_DATA_MODE=backend
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=https://nigeria.geappindia.org
```

Therefore, normal frontend requests currently go to the deployed Nigeria PHP backend through the Vite proxy. They do **not** use `m300-demo-backend`. Because backend mode disables the frontend mock router, functionality that exists only in frontend mocks cannot serve as a fallback.

## 4. Full module assessment

| Dashboard area | Required behavior | What the deployed PHP backend actually does | Assessment |
|---|---|---|---|
| Authentication | Real account lifecycle, secure login, reset/invite completion, roles and scopes returned to the client, revocation/logout and auditable security events | Login is database-backed and includes lockout/token expiry, but forgot-password is a stub, invitations send no email, access scopes are not applied, and the login payload does not provide the complete permissions/scope context | **Partial; account lifecycle incomplete** |
| Authorization | Least privilege enforced by the API for View, Submit, Edit, Validate, Approve, Export and Administer, with institution/dataset/geography/programme scope | A global bearer token is required, but `requireRole` is used on only a few writes. Most module reads and several writes accept any authenticated user. Frontend navigation hiding is not a security boundary | **Critical failure** |
| Executive Overview | Calculated snapshot from validated KPI, target and implementation records; every filter applied; empty result when no match; current period, provenance and freshness | Headline cards, access delivery, performance and project values are fixed arrays. Pillar/institution filtering affects only parts of the payload; period and technology are ignored. Fixed 2025 dates remain | **Placeholder, not live monitoring** |
| Pillar dashboards | Each pillar is a filtered view over KPI, programme/project and bottleneck records; four most important dynamic indicators; useful record-level drill-downs | KPI list has some database data, but headline cards and delivery summaries are representative fixed values. Bottlenecks are deliberately empty because the join is not implemented. The same generic content is reused across pillars | **Mostly placeholder** |
| KPI Explorer | Full KPI master, definitions, formula, unit, aggregation, source, readiness, baselines/targets, observations/history, versioning, validation lineage; add/edit/deactivate workflow | Some KPI tables are read from the database and metadata can be patched by an admin. There is no general calculation/publishing engine in PHP, no add/deactivate workflow, incomplete metadata dimensions, and inconsistent ID/status terminology | **Partial catalogue; not a reliable KPI engine** |
| Programmes & Projects / Implementation Register | Complete programme, project, milestone and action lifecycle; status history, evidence, priority, dates, owners, linkages, filters and editable records | Database-backed reads exist. Create programme, create project, update project and delete project routes used by the UI do not exist. Actions have no API. Institution filtering compares the wrong field. Milestone “on time” does not compare actual date with due date; pending/missed are incorrectly presented as delayed/blocked | **Reads partial; core business logic incorrect/incomplete** |
| Bottlenecks & Exceptions | Register linked to implementation records, severity/category/lifecycle, accountable owner, age, follow-up, escalation, decisions, resolution, evidence, history and audit | List/create/by-project exist, but the frontend create contract and PHP fields do not align. No full update/resolution/escalation workflow, evidence workflow, decision history or audit exists. Pillar and linked-record relationships are largely absent. Any authenticated user can create | **Incomplete workflow and unsafe permissions** |
| Data Submission & Validation | Dataset catalogue; generated versioned templates; preview; parse; field and business validation; issue list; calculation; immutable history; role-based review; approval/provisional publication into KPI history; obligation compliance; evidence and audit | Obligations and fields are fixed; submissions use a temporary store; file contents are not parsed; validation and KPI value are hardcoded; decisions do not publish observations into the PHP KPI tables. Templates are CSV text served with an XLSX identity. Dataset endpoint is missing | **Simulation, not an ingestion pipeline** |
| State & DisCo Performance | Calculations from validated metering, ATC&C, remittance, supply/tariff and implementation records, consistently filtered by period/DisCo/state/source; no fabricated state detail | Responses are fixed MockDb arrays with a very small Kaduna/Lagos/two-DisCo sample. Overview remains Kaduna-oriented and is disconnected from submissions and KPI observations | **Mock data** |
| Reports & Exports | Custom and standard reports built from approved live records; selected KPIs/period/filters; reusable configurations; CPR/Implementation Register mapping; genuine output files, provenance, versions, limitations and audit | Catalogue, preview tables and saved reports are fixed or temporary-store data. Preview/generate do not query the live modules. File references are not genuine server-generated artifacts. Methodology endpoint used by the frontend is missing; report DB tables are unused | **Mock report generator** |
| Stakeholders & Institutions | Institution registry, custodian assignments, focal roles, datasets, programmes/projects, geographies and responsibilities | Some institution and custodian data is database-backed, but the complete responsibility and scope model is absent and reads are not institution-scoped | **Partial directory** |
| User Administration | User lifecycle, role/permission matrix, multiple access scopes, edit/suspend/reactivate, MFA policy, invitations and audit log | User list and invite creation exist. Invite completion is impossible without real reset delivery. No edit/suspend/reactivate/scope management/MFA workflow is exposed. Administration data is readable by any authenticated account | **Incomplete and overexposed** |
| Public Gateway | Public, safe, approved and appropriately filtered national indicators with provenance; no sign-in required | PHP has a fixed `/public/overview`, but the frontend public gateway instead calls protected `/executive-overview` and `/state-disco/states`, so public data loading depends on authentication | **Frontend/backend integration failure** |
| Branding | Persisted configuration with admin-only writes and functional reset | Reads/writes use file/mock persistence. Writes are admin-gated, but the frontend reset route does not exist in PHP | **Partial** |
| Audit & activity | Immutable activity record for uploads, edits, decisions, approvals, exports, administrative changes and important actions | An `audit_event` table exists in SQL but controllers do not write to it. There is no cross-module activity API | **Missing** |

## 5. Cross-dashboard logic failures

### 5.1 Static values are presented as monitored results

The PHP Executive Overview contains values such as `57.4%`, `137.3M`, `5.4GW`, `26%`, fixed targets and fixed trend text directly inside controller arrays. Similar values are repeated in public, pillar, report and State/DisCo responses.

This creates the appearance of a functioning monitoring system while bypassing the required chain:

```text
approved source → dataset/version → submission → validation → decision
→ calculated observation → KPI snapshot → dashboard/report
```

Until that chain exists, a value should not be labelled “confirmed” merely because it was typed into source code or a seed.

### 5.2 No shared calculation and provenance engine

The initial setup workbook requires every calculated response field to have a formula and mapped database dependencies. That formula mapping was never completed. The PHP modules calculate independently or not at all, which leads to repeated values and inconsistent semantics.

Every KPI needs, at minimum:

- stable KPI identifier and active/version state;
- definition, formula and aggregation rule;
- input dataset and field mappings;
- unit and currency metadata;
- baseline and dated target;
- reporting frequency and allowed period format;
- disaggregation rules;
- responsible custodian/reviewer/validator;
- validation and confidence status;
- source reference/evidence;
- limitations and last-updated information;
- observation history linked to its accepted submission or approved public source.

### 5.3 Filters do not define the data slice

The frontend contract requires the backend to apply every supplied filter before calculating response sections. The PHP overview only partially filters projects/performance, while its headline values remain unchanged. Several other modules expose filter options that are ignored, incomplete or do not correspond to visible fields.

Acceptance rule: for every filter, automated tests must demonstrate both a changed result and an empty result for a non-matching slice. Returning unfiltered national data for an unmatched query is incorrect.

### 5.4 Status vocabularies are fragmented

The reporting workbook, implementation pages, submissions, validation issues and escalation workflows each have controlled vocabularies. PHP maps unrelated database states into frontend labels and returns shapes that have already caused runtime contract failures.

One governed status model is required for each domain, with explicit transition rules. Status labels must not be inferred by substituting a different concept—for example, `pending` is not automatically `delayed`, `missed` is not automatically `blocked`, and an achieved milestone is not automatically on time.

### 5.5 Relationships are missing

The required hierarchy and cross-links are:

```text
Pillar
  └─ Programme
      └─ Project
          ├─ Action / milestone / evidence
          └─ Bottleneck / escalation / decision

Institution / user / dataset / geography / DisCo / KPI
  └─ scoped assignments linked into the same records
```

The SQL schema contains many of these entities, but the API does not consistently use them. Consequently, dashboard drill-downs, bottleneck accountability, access scopes, report lineage and cross-page links cannot be reliable.

### 5.6 Server-side authorization is not implemented as a platform rule

The backend currently treats “authenticated” as sufficient for most operations. A provider account was able to receive Administration data and unrelated obligation data during read-only live checks.

Required rule: every request must be authorized by action **and** scope. Examples:

- a provider views/submits only assigned datasets and institutions;
- a reviewer sees only assigned review queues;
- a validator/approver can make only permitted decisions;
- an oversight/read-only user cannot mutate records;
- only administrators manage accounts, roles, scopes and branding;
- public users receive only explicitly publishable observations.

### 5.7 Database tables exist but are bypassed

The PHP SQL schema includes submissions, validation issues, metric observations, evidence, actions, audit events, access scopes and report tables. The corresponding controllers frequently use fixed arrays or temporary JSON/file stores instead. Defining a table does not implement a workflow; controllers and transactions must use it.

## 6. Key formula and behavior checks

These are examples of rules that must be implemented and tested centrally:

- **Metering rate:** total metered active customers ÷ total active registered customers × 100. Use the same DisCo and period; do not average DisCo percentages without weights.
- **Metering gap:** active customers − metered customers for matching slices.
- **Billing efficiency:** energy billed ÷ energy received × 100.
- **Collection efficiency:** revenue collected ÷ revenue billed × 100.
- **ATC&C loss:** use the approved two-stage energy/billing and revenue/collection method, not an unverified display value.
- **Remittance performance:** actual remittance ÷ applicable obligation × 100, calculated separately for market components before any combined presentation.
- **Priority milestone on-time rate:** priority milestones completed on or before due date ÷ priority milestones due by the reporting date × 100.
- **Overdue escalation:** unresolved escalation/decision with due date earlier than the reporting date.
- **Compliance:** compare expected obligations with accepted submissions for the same dataset, custodian and reporting period.
- **Electricity access:** clearly distinguish people from households; record and version the household coefficient if households are converted to people.
- **Clean cooking:** report the approved population percentage methodology and do not mix it with household counts without an explicit conversion.
- **Currency:** currency code/symbol must be data-driven, not hardcoded for reuse in another country.
- **Targets:** target value and target date must share the indicator’s unit or have an explicit, approved conversion.
- **Project status counts:** count records by governed status; never average statuses.

## 7. Frontend routes missing from PHP

At minimum, the current frontend calls or exposes the following functionality that the PHP route table does not implement:

- `GET /api/data-submissions/datasets`
- `GET /api/reports/methodology`
- `POST /api/branding/reset`
- `POST /api/programs`
- `POST /api/programs/projects`
- `PATCH /api/programs/projects/:projectId`
- `DELETE /api/programs/projects/:projectId`

The frontend also exposes pages for adding/editing programmes/projects even though the live backend supports only reads. These must either be implemented with authorization, validation, history and audit, or hidden until the backend contract is ready.

## 8. What the demo backend proves—and what it does not

`m300-demo-backend` is useful as a reference for the correct data-submission pattern:

1. generate template from the active dataset schema;
2. parse CSV/XLSX;
3. validate field types, required values, controlled references, period and duplicates;
4. run dataset-specific business rules;
5. calculate the KPI on the server;
6. persist one canonical submission plus issues and status history;
7. allow an authorized review decision;
8. publish approved/provisional values into KPI history;
9. link the accepted submission to the obligation;
10. write an audit event.

Its end-to-end tests verify this for Metering Rate and ATC&C Loss Rate. However:

- it implements only two upload/calculation datasets;
- other compact outcome KPI rows are seeded reference values rather than produced by this upload pipeline;
- it does not implement the complete dashboard modules;
- its documentation states that the remaining frontend KPI rows/modules are mock data;
- simple count-based submission IDs and discarded raw files are demo limitations;
- it is not the backend selected by the frontend’s current environment.

The demo backend should be treated as an architectural example, not evidence that the deployed Nigeria backend or the whole dashboard is live.

## 9. Priority remediation plan for the backend team

### P0 — Stop misleading output and close access exposure

1. Identify every fixed/mock/seed-only response and label or disable it until it has approved lineage.
2. Enforce module permission and record scope on every endpoint.
3. Remove Administration and unrelated institutional data from provider-level access.
4. Agree one API contract and controlled vocabulary; add contract tests for every response.
5. Confirm which backend is authoritative and which database/environment holds the actual Nigeria data.

### P1 — Build the platform data spine

1. Complete the master hierarchy: pillar, programme, project, action/milestone, bottleneck and evidence.
2. Complete institution, user, role and multi-scope assignments.
3. Complete dataset, field, template-version, formula and KPI mappings.
4. Implement the full submission/validation/decision/publication transaction using database tables.
5. Implement immutable observation lineage and cross-module audit events.
6. Rebuild Overview, Pillars and State/DisCo as queries over accepted observations and implementation records.

### P2 — Complete operational workflows

1. Programme/project/action CRUD with history, evidence and permission checks.
2. Bottleneck escalation, decision, resolution and follow-up workflow.
3. User invitation/reset, suspension/reactivation and access-scope administration.
4. Reports generated from live approved records, including saved custom configurations and CPR mapping.
5. Public gateway consuming only the public API and publishable data.
6. KPI add/edit/deactivate/version workflow.

### P3 — Acceptance and governance

1. Automated unit tests for every formula and boundary case.
2. Role/scope authorization matrix tests.
3. Contract tests generated from the frontend schemas.
4. End-to-end tests from submission to dashboard/report.
5. Filter correctness tests, including empty slices.
6. Data reconciliation against approved source workbooks/publications.
7. User acceptance testing with CDMU, SEforALL and designated custodians.

## 10. Questions requiring a written backend-team response

1. Is `https://nigeria.geappindia.org` the authoritative Nigeria production API and database, or is there another backend/environment containing the real data?
2. Which modules are declared production-ready, and which are acknowledged mock/representative implementations?
3. For every displayed KPI, what exact database observation, accepted submission, source reference and formula produced the value?
4. Where is the approved formula-to-dataset-field mapping requested in the initial setup workbook?
5. How are validation decisions published transactionally to KPI observations and obligations?
6. How are programme/project/action/bottleneck relationships represented and maintained?
7. What server-side permission and scope rule protects each endpoint?
8. Why can a provider account access Administration data and unrelated obligations?
9. Which status vocabularies and transition diagrams have been approved?
10. Which audit events are written for login, upload, edit, validation, approval, export and administration?
11. How are reports generated from live approved records, and where are the generated files/version histories stored?
12. How will the public gateway receive approved public data without authentication?
13. What is the migration plan from fixed/MockDb/temporary-store responses to database-backed logic?
14. Which acceptance tests demonstrate calculation accuracy, filter behavior, authorization and end-to-end publication?

## 11. Recommended go-live gate

The platform should not be described as live-data-ready merely because its routes respond. A module should pass go-live only when all of the following are demonstrable:

- its displayed records originate from an identified authoritative source;
- formulas and mappings are approved and tested;
- every value has period, unit, target basis, validation state and provenance;
- filters change the server-side data slice correctly;
- authorized users can complete the full intended workflow;
- unauthorized and out-of-scope users are rejected by the server;
- all state transitions persist and appear consistently across pages;
- important actions create immutable audit events;
- reports reconcile to the same records displayed in the dashboard;
- the result survives an end-to-end test without relying on frontend mocks.

## 12. Final assessment

The PHP backend has useful scaffolding—authentication, route coverage, parts of the database schema and some database-backed directories—but the dashboard as a whole is **mostly a presentation prototype over incomplete business logic**. The immediate need is not additional frontend patching. It is a backend agreement on authoritative data, formulas, workflows, scopes and acceptance tests, followed by systematic replacement of representative controller responses with traceable database-backed behavior.
