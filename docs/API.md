# Mission 300 Monitoring Dashboard — API contract

**Audience:** the backend team building the real API this frontend will run
against.
**Status:** frontend-defined contract, derived from the approved page
specifications. Every endpoint below is implemented as a mock and consumed by
a working frontend, so the shapes are exercised, not theoretical.

---

## Contents

1. [How this contract is defined](#how-this-contract-is-defined)
2. [Conventions](#conventions)
3. [Data modes — how the frontend decides where to fetch from](#data-modes)
4. [Authentication](#authentication)
5. [Global filters](#global-filters)
6. [Executive Overview](#executive-overview)
7. [Public Gateway](#public-gateway)
8. [KPI Directory (KPI Explorer)](#kpi-directory-kpi-explorer)
9. [Pillar Dashboards](#pillar-dashboards)
10. [Programs](#programs)
11. [Bottlenecks & Exceptions](#bottlenecks--exceptions)
12. [Data Submissions](#data-submissions)
13. [State & DisCo](#state--disco)
14. [Reports & Exports](#reports--exports)
15. [Administration (User Access)](#administration-user-access)
16. [Stakeholders & Institutions](#stakeholders--institutions)
17. [Shared enumerations reference](#shared-enumerations-reference)
18. [Open questions for the backend team](#open-questions-for-the-backend-team)
19. [Running the mocks](#running-the-mocks)

---

## How this contract is defined

The authoritative definition is **zod schemas** in
[`src/api/schemas/`](../src/api/schemas/). Everything else is derived from
them:

| Artifact | Source |
| --- | --- |
| TypeScript types | inferred with `z.infer` from the schemas |
| Runtime validation | the frontend validates every response against its schema |
| Mock responses | [`src/mocks/`](../src/mocks/), asserted to satisfy the schemas |
| This document | written directly against the schemas and the mock handlers that implement them |

**The frontend rejects responses that do not match their schema.** A
mismatch throws a validation error naming the offending field path — it does
not silently render blanks or `undefined`. Treat the schemas as binding. If a
shape needs to change, change the schema and this document together, and
tell us — a field **added** is harmless, a field **removed or retyped** is a
breaking change and needs a heads-up first.

Every module's mock implementation lives at a predictable path so you can
read the exact behaviour it's tested against:

- Schemas: `src/api/schemas/<module>.ts`
- Mock handlers (the executable form of this document): `src/mocks/handlers.ts` and `src/mocks/handlers/<module>.ts`
- Mock data fixtures: `src/mocks/data/<module>.ts`

---

## Conventions

- **Base URL** — everything is under `/api`. Configurable via
  `VITE_API_BASE_URL` (defaults to `/api`).
- **Content type** — `application/json` in both directions, except the two
  file-upload endpoints in Data Submissions, which use
  `multipart/form-data`, and the two Reports export endpoints, which return
  binary file downloads.
- **Timestamps** — ISO 8601 with timezone, e.g. `2025-10-14T09:12:00Z`. The
  frontend renders them in `Africa/Lagos`.
- **Errors** — non-2xx with a JSON body `{ "message": "human readable" }`.
  The frontend displays `message` directly to the user, so write it for a
  reader, not a log. `404` for "record not found", `400` for a failed
  validation/business rule, `401` for bad credentials.
- **Empty vs zero** — `0` is a real value and is rendered as `0`. Use `null`
  only where the schema allows it, and it means "not applicable / not yet
  approved", never "zero". See *Nullability carries meaning* below.
- **Enums are closed sets.** A value outside an enum's allowed options fails
  validation on the frontend. See [Shared enumerations reference](#shared-enumerations-reference)
  for the full list, and each module's section for module-specific ones.
- **`lastUpdated`** appears on nearly every overview payload — it is the
  timestamp the *data itself* was last refreshed, not the time the response
  was generated. The frontend surfaces it directly to the user as "as of …".

### Nullability carries meaning

Several fields are nullable on purpose, and the distinction is a
specification requirement, not a convenience:

- `AccessChannel.target` / `percentComplete` (Executive Overview) — `null`
  means **no approved target exists**. The specification forbids deriving a
  grid-connection target from the 9% access-rate commitment. When null, the
  UI shows period-on-period trend only and renders no progress bar. Do not
  send `0` here.
- `BulletMetric.target` (Executive Overview) — `null` means no Compact target
  is currently stated (e.g. ATC&C losses). `BulletMetric.expected` — `null`
  means no approved trajectory exists for the period.
- `PillarHeadlineCard.rawValue` / `.target` (Pillar Dashboards) — same rule:
  no value yet collected, or no approved target yet, respectively.
- `KpiProfile.baseline` / `.current` / `.target` (KPI Directory) — `null`
  means that figure is not yet available for this indicator (its
  `validationStatus` will be `future` when `current` is null).
- `ProjectRecord.fundingSource` / `.evidenceUrl`, `MilestoneRecord.actualDate`
  / `.evidenceUrl` (Programs) — `null` means not yet secured / not yet
  reached / no document attached, respectively. Never send an empty string.
- `SubmissionDetail.fileName` (Data Submissions) — `null` for a manual-entry
  submission, which has no uploaded file.
- `EscalationRecord.resolution` / `.evidenceUrl` (Bottlenecks) — `null` until
  resolved / until a document is attached.

### Pagination envelope

Shared by every paginated list in the product (KPI catalogue, Programmes,
Bottlenecks register & escalations, Data Submissions lists, Reports saved
list, Administration users/scope/audit). One convention, reused everywhere:

```jsonc
{
  "items": [ /* the current page only */ ],
  "page": 1,        // 1-based
  "pageSize": 25,
  "total": 312      // total matching records across ALL pages, not items.length
}
```

Query params: `?page=1&pageSize=25`. `pageSize` has a per-module maximum (see
each module's query table). Sorting is currently **client-side over the
returned page only** — see [open question 6](#open-questions-for-the-backend-team).

### `provenance` — required on every metric

The specification requires an information icon on every metric, exposing
four things. All four are **required, non-empty strings**:

```jsonc
{
  "definition":  "What this metric is, and what it is not.",
  "methodology": "How it is calculated, including exclusions.",
  "source":      "Which publication or register it comes from.",
  "lastUpdated": "2025-09-30T00:00:00Z"
}
```

This is not decoration. The dashboard's credibility rests on every figure
disclosing where it came from — several specification entries carry
explicit caveats that must reach the reader (e.g. that milestone delivery is
an implementation measure and *not* an average of all KPIs, or that
renewable generation share is seasonal).

### Pre-formatted display values — a decision the backend should confirm

Several fields are sent **pre-formatted** as display strings alongside a raw
number, e.g.:

```jsonc
{ "value": "₦2.2tn", "current": 2.2 }
{ "value": "$0.0B",  "current": 0 }
{ "value": "5.4 GW", "availableMw": 5400 }
```

This was done because the specification mandates metric-specific
presentation. **On reflection this is probably the wrong boundary** — it
makes the backend own currency/unit formatting and blocks locale or
compact-number changes on the frontend without a release. If you'd rather
send structured values (`{ "value": 2.2, "unit": "NGN", "scale": "trillion",
"precision": 1 }`) and let the frontend format them, say so before you build
against this — it's much cheaper to change now than later.

---

## Data modes

The frontend can run in three modes, controlled by build-time environment
variables (`src/config/environment.ts`):

| `VITE_DATA_MODE` | Behaviour |
| --- | --- |
| `mock` | Every `/api` request is intercepted and answered by MSW in the browser. No backend needed. This is the default in local development. |
| `hybrid` | MSW answers requests for modules that don't have a real backend yet, and **proxies** requests for finished modules to `VITE_SUBMISSIONS_BACKEND_URL`. Used for staged rollout of one module at a time (currently Data Submissions + two KPIs, `M300-P3-004` and `M300-P3-006`, proxy live). |
| `backend` | MSW is disabled entirely. Every request goes to `VITE_API_BASE_URL` for real. **This is what production should run once your API implements everything below.** |

`hybrid` mode requires `VITE_SUBMISSIONS_BACKEND_URL` to be set (it throws a
startup error otherwise). In all three modes the frontend always fetches
against the same relative path (`/api/...` under `VITE_API_BASE_URL`) — the
mode only changes what intercepts that request, never the path the
frontend calls.

**For your integration testing:** point your API at `VITE_API_BASE_URL` and
set `VITE_DATA_MODE=backend`. You do not need to touch MSW or any mock code.

---

## Authentication

Not yet specified by the product spec in detail, but the frontend implements
and depends on a specific **two-step login flow**. This is the one thing in
this document that is genuinely load-bearing UX, not just a data shape.

### `POST /api/auth/identify`

Step 1. The user enters only their email. This confirms an account exists
and returns the display identity used on the password screen, without
revealing whether the *password* is right yet.

**Request**
```jsonc
{ "email": "a.bello@finance.gov.ng" }
```

**Response** `200`
```jsonc
{
  "email": "a.bello@finance.gov.ng",
  "displayName": "Aisha Bello",
  "institution": "Federal Ministry of Finance"
}
```

**Response** `404` if no active account matches — `{ "message": "We could not find an active account for that email." }`.
An account with `status !== 'active'` (see [Administration](#administration-user-access)) must be treated the same as no account — do not confirm suspended/pending accounts exist.

### `POST /api/auth/login`

Step 2, shown only after `identify` succeeds. Full credential check.

**Request**
```jsonc
{ "email": "a.bello@finance.gov.ng", "password": "…" }
```

**Response** `200`
```jsonc
{
  "accessToken": "…",
  "user": {
    "id": "usr-006",
    "name": "Aisha Bello",
    "email": "a.bello@finance.gov.ng",
    "role": "oversight-user"
  }
}
```

`role` must be one of the [`SystemRole`](#administration-user-access) enum
values — the frontend uses it directly to decide which sidebar sections and
routes this user can reach. **Response `401`** for a wrong password or an
inactive account —
`{ "message": "The password you entered is incorrect." }`. Use one generic
message; don't distinguish "wrong password" from "account inactive" in the
response text, to avoid leaking account state.

The frontend stores `accessToken` and attaches it as a bearer token on every
subsequent request once your API expects one (not yet enforced by any
schema — confirm the scheme, see [open question 4](#open-questions-for-the-backend-team)).

### `POST /api/auth/forgot-password`

**Request** `{ "email": "…" }` → **Response** `200`, always the same body
regardless of whether the email matches an account (prevents account
enumeration):
```jsonc
{ "message": "If an active account exists for that email, reset instructions have been sent." }
```

---

## Global filters

### `GET /api/filters`

Option lists for the application-wide filter bar (used by Executive
Overview only — every other module has its own, larger filter set, listed
in that module's section). Cacheable for the session.

**Response** — every group is `{ value, label }[]`; `value` is the
identifier sent back in queries, `label` is displayed:

```jsonc
{
  "reportingPeriods":       [{ "value": "q3-2025", "label": "Q3 2025" }],
  "pillars":                [{ "value": "all", "label": "All pillars" }],
  "institutions":           [{ "value": "nerc", "label": "NERC" }],
  "priorities":             [{ "value": "priority", "label": "Priority" }],
  "geographicScopes":       [{ "value": "national", "label": "National" }],
  "distributionCompanies":  [{ "value": "all", "label": "All DisCos" }],
  "technologies":           [{ "value": "all", "label": "All technologies" }]
}
```

`pillars` values must match the six [`PillarId`](#shared-enumerations-reference)
values, plus `all`. Options are server-driven so adding a period or
institution needs no frontend release.

---

## Executive Overview

The Compact leadership view — see [`docs/specs/executive-overview.md`](specs/executive-overview.md).
Schema: [`src/api/schemas/executive-overview.ts`](../src/api/schemas/executive-overview.ts).

### `GET /api/executive-overview`

**Query parameters** — all optional, all from the global filter bar:

| Parameter | Example |
| --- | --- |
| `period` | `q3-2025` |
| `pillar` | `last-mile-access` or `all` |
| `institution` | `nerc` or `all` |

The backend must apply every supplied parameter before returning the
payload. The frontend does not calculate KPI values, project status totals
or progress — it renders the response and animates between the previous and
new server snapshots. When a filter has no matching records, return empty
arrays for the affected sections rather than reusing the unfiltered data.

**Response shape** (abbreviated — every field is in the schema):

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "appliedPillar": "all",         // echo back what you actually applied
  "headlineCards": { /* Section A — exactly four named cards, see below */ },
  "accessDelivery": [ /* Section B — three channels */ ],
  "nationalPerformance": [ /* Section C — six bullet metrics */ ],
  "deliveryStatus": { /* Section D — ongoing projects, chart counts + exceptions */ }
}
```

`appliedPillar` — echo the pillar the payload was actually calculated for
(`all` for All Pillars). The frontend uses this to confirm the server
applied what was asked, rather than assuming.

#### Section A — `headlineCards`

**Exactly four**, as **named fields**, not an array — a missing card fails
validation.

| Field | Card | Shape / notable requirements |
| --- | --- | --- |
| `peopleWithElectricityAccess` | People with electricity access | `compactOutcomeCardSchema` — baseline, current, 2030 target on a shared scale (`scaleMax > scaleMin`, enforced) |
| `accessRate` | Electricity access rate | `accessRateCardSchema` — **`sourceYear` is required**: an annual official publication, must never read as current-period data. `sparkline[]`, oldest→newest |
| `generationCapacity` | Available generation capacity | `generationCapacityCardSchema` — `availableMw`, `installedMw`, `availabilityRatio` (0–100), `sparkline[]` (≥2 points to render a line) |
| `cleanCookingAccess` | Clean cooking access | `compactOutcomeCardSchema`, same shape as `peopleWithElectricityAccess` |

Every headline card carries an *optional* `trend: { change, label, direction }`
— when present, the frontend renders it as a period-on-period pill (e.g.
"+9 pts vs prior published year"). Headline outcomes remain **national**
even when a pillar filter is applied — only Sections C and D narrow to the
selected pillar.

#### Section B — `accessDelivery`

Three channels, **in this order**: `grid-connections`, `mini-grid-connections`,
`solar-home-systems` (`accessChannelSchema`). Known targets from the
workbook: 750,000 mini-grid household connections by 2030 (DARES); 2.75
million Solar Home Systems by 2030. Grid connections have **no approved
target** — send `target: null`, `percentComplete: null` (see *Nullability
carries meaning*).

#### Section C — `nationalPerformance`

Six bullet metrics (`bulletMetricSchema`), ids: `renewable-share`,
`metering-rate`, `atcc-losses`, `market-remittance`, `tariff-shortfall`,
`private-capital`. Each carries **its own scale** (`scaleMin`/`scaleMax`,
`scaleMax > scaleMin` enforced) because the metrics are not comparable — a
percentage, a naira total and a loss rate share no axis.

`direction` must be `lower-is-better` for `atcc-losses` and
`tariff-shortfall` — this drives arrow colouring: for those two, a
**falling** value is an improvement and renders green.

#### Section D — `deliveryStatus`

- `ongoingProjects[]` — rows shared by the searchable table and map views.
  **Exclude `completed` records.** Each row: project/programme id and name,
  pillar + label, owner, location, `latitude`/`longitude`, `currentStatus`
  (excludes `completed`), `startDate`, `endDate`. IDs power the project/
  programme drill-down links; coordinates drive the Nigeria map — the
  frontend does not geocode location strings.
- `statusSummary[]` — backend-calculated overall counts for `on-track`,
  `at-risk`, `delayed`, `blocked` (excludes `completed`). The Apex donut
  chart renders these directly; it does not group or recompute by pillar.
- `exceptions[]` — ranked by severity, delivery impact and days unresolved
  (`bottleneckSchema` — a lighter shape than the full Bottlenecks register,
  see that module). The UI displays at most five; sending more is allowed
  and harmless.

**The specification is explicit: count records by status, never average
unrelated performance percentages.**

---

## Public Gateway

The unauthenticated landing page and its "National Progress" drill-down —
see [`docs/public-gateway-home.md`](public-gateway-home.md) for the full
page sketch (hero, headline strip, six pillars, delivery map, one story,
institutions).

**Current state: this is the one genuinely new endpoint the backend needs to
build.** It does not exist yet. The frontend today temporarily reads
`GET /api/executive-overview` (the authenticated payload above) for these
pages as a stopgap — **do not treat that as the real contract**; anything
shown on the public pages today is unreviewed for public release.

### `GET /api/public/overview` — not yet implemented, needed

- **No authentication.**
- Serves the headline strip, delivery channels and pillar indicators shown
  on the public home and progress pages.
- Every figure still carries `validationStatus` and `provenance` — the
  public version does not get to skip disclosure, if anything it matters
  more here.
- Send **display labels, not filter slugs** for anything shown as text
  (e.g. `"Q3 2025"`, not `"q3-2025"`) — this bit the authenticated app once
  already (fixed in `applyPeriodFilter`) and must not regress here.
- **Cacheable.** This is read-only public data and will take the highest
  traffic volume of anything in the platform — design for that (e.g. a CDN
  cache with a short TTL, or `Cache-Control` headers the frontend can rely
  on).
- Recommended: **hold back anything not `confirmed` or `public-source`**
  validation status from this endpoint specifically, even though the
  authenticated Executive Overview shows every status. This is a product
  decision to confirm, not yet locked — see
  [open question 7](#open-questions-for-the-backend-team).

---

## KPI Directory (KPI Explorer)

The authoritative indicator catalogue and technical drill-down — see
[`docs/specs/kpi-explorer.md`](specs/kpi-explorer.md). Schema:
[`src/api/schemas/kpi-explorer.ts`](../src/api/schemas/kpi-explorer.ts).
The KPI identifier (e.g. `M300-P1-003`) is first-class here for
traceability, but the specification says it must **not** appear on
executive or pillar cards (see those sections).

### `GET /api/kpi-explorer`

**Query** (all optional): `search`, `pillar`, `category`, `readiness`,
`validationStatus`, `sourceInstitution`, `reportingPeriod`, `geography`,
`page`, `pageSize` (max 200).

**Response**:

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "summary": [ /* Section A — catalogue/readiness counts */ ],
  "catalogue": { "items": [ /* … */ ], "page": 1, "pageSize": 25, "total": 17 },
  "pillarDistribution": [ /* Section D — value coverage by pillar */ ],
  "readinessDistribution": [ /* Section D — Core / Supporting / Future */ ]
}
```

- `summary` and both `*Distribution` arrays describe the **full catalogue**,
  not the filtered slice — they are catalogue readiness facts, not a
  response to the query. Only `catalogue` (the paginated envelope) is
  filtered/paginated by the query params.
- `validationStatus` (per-row) is one of `confirmed`, `public-source`,
  `requires-validation`, `provisional`, `future` — see the full vocabulary
  in [Shared enumerations](#shared-enumerations-reference). `future` means
  no value exists yet — a catalogue fact, not a failure, and must never be
  presented as confirmed.
- `readiness` is `core`, `supporting` or `future`.
- Each `pillarDistribution[].byStatus` must sum to that pillar's `total`.

### `GET /api/kpi-explorer/kpis/:id`

Full profile for one indicator (the drill-down), fetched on demand so the
heavy payload isn't loaded for every catalogue row. **404** with
`{ "message": … }` for an unknown id.

Four panels' worth of data in one response:

- **Metadata** — `definition`, `formula`, `unit`, `aggregation`,
  `frequency`, `disaggregation`, `limitations` — shown "exactly as
  configured", not reformatted by the frontend.
- **Values** — `baseline`, `current`, `target` (all nullable — see
  *Nullability carries meaning*), matching `*Label` display strings,
  `varianceLabel` (signed, following `direction`), `history[]` (each point:
  `period`, `value`, `validationStatus`, `submissionId` nullable — points
  seeded before submission-tracing existed).
- **Traceability** — `sourceInstitution`, `sourceDataset`, `sourceReference`,
  `reportingPeriod`, `validationStatus`, `validationDecision`, `version`,
  `confidence`, `provenance`.
- **`linkedRecords[]`** — delivery records (programme/project/milestone/
  action) joined through the indicator identifier, each with `type`,
  `title`, `institution`, `status`.

### `PATCH /api/kpi-explorer/kpis/:id`

Updates a KPI's **definition metadata** — methodology and reference points,
set once when the indicator is configured and changed rarely and
deliberately (e.g. a target renegotiated with NERC). Distinct from
`current`/`history`, which must **never** be editable here — those only
change through a data submission being approved and published (see
`POST /api/data-submissions/validation/:id/decisions`). **404** with
`{ "message": … }` for an unknown id.

**Request** — every field required, `baseline`/`target` nullable:
```jsonc
{
  "definition": "…", "formula": "…", "unit": "%",
  "aggregation": "…", "frequency": "Monthly", "disaggregation": "…", "limitations": "…",
  "baseline": 42, "baselineLabel": "Approx. 42% (2024 Compact baseline)",
  "target": 100, "targetLabel": "Metering gap closed by 2027",
  "sourceInstitution": "NERC", "sourceDataset": "Metering performance", "sourceReference": "…"
}
```

**Response** `200` — the full updated `KpiProfile` (same shape as
`GET /api/kpi-explorer/kpis/:id`), so the frontend can replace its cached
copy from this response alone without a second fetch.

**Access**: system-administrator only. The frontend hides the edit UI for
every other role (`canRoleReachModule`), but **that is not enforcement** —
see [open question 9](#open-questions-for-the-backend-team): the real API
must reject this call server-side for any other role once auth is wired up,
not rely on the frontend to withhold the button.

### `GET /api/kpi-explorer/filters`

This module's own eight filter option lists: `pillars`, `categories`,
`readinessTiers`, `validationStatuses`, `sourceInstitutions`,
`reportingPeriods`, `geographies` (same `{ value, label }[]` shape as global
filters, but this module does not use the global dashboard filter bar).

---

## Pillar Dashboards

`GET /api/pillars/:pillar` — deliberately has **no entities of its own**.
Per [`docs/database-structure.md`](database-structure.md), a pillar
dashboard is a **filtered view** over data that exists elsewhere: headline
cards are real KPI profiles selected for this pillar, and the delivery/
bottleneck panel is Programs and Bottlenecks records filtered by the same
`pillar` field they already carry. Schema:
[`src/api/schemas/pillar-dashboard.ts`](../src/api/schemas/pillar-dashboard.ts).

`:pillar` is one of the six [`PillarId`](#shared-enumerations-reference) values.

**Response**:

```jsonc
{
  "pillar": "generation-network",
  "label": "Generation & Network",
  "lastUpdated": "2025-10-14T09:12:00Z",
  "headlineCards": [ /* exactly 4 — real KpiProfile-sourced cards for this pillar */ ],
  "deliveryStatus": { "counts": [ /* by ExecutionStatus */ ], "total": 6 },
  "bottlenecks": [ /* ranked top-5 open bottlenecks for this pillar */ ],
  "kpis": [ /* every KPI Directory catalogue row tagged to this pillar */ ]
}
```

- `headlineCards` — **exactly 4** (`pillarHeadlineCardSchema`). Each carries
  `kpiId` (join key back to KPI Directory — but per spec, the id is **not**
  displayed on the card itself, only used for linking), `rawValue`/`target`
  nullable per the usual rule, `validationStatus`, `provenance`.
- `bottlenecks` — **max 5**, using the lighter `bottleneckRecordSchema`
  shape from the Bottlenecks module (see that section), not the Executive
  Overview's even-lighter exception shape.
- `kpis` — **every** catalogue row tagged to this pillar, not just the four
  headline ones — the same rows the KPI Directory reads, filtered by
  `pillar`.

Two of the six pillars (`generation-network`, `last-mile-access`) are
currently the only ones with a built frontend page; the other four
(`financially-viable-utilities`, `private-sector-participation`,
`regional-integration`, `clean-cooking`) are disabled in the sidebar
pending the same treatment — **the endpoint contract is identical for all
six**, this is a frontend rollout sequencing decision, not a backend one.

---

## Programs

The consolidated Programmes → Projects → (Milestones, Bottlenecks)
drill-down. There is no dedicated workbook specification for this page —
the original standalone Implementation Register spec
([`docs/specs/implementation-register.md`](specs/implementation-register.md))
and the standalone Bottlenecks & Exceptions page have both been folded into
this one. Schema: [`src/api/schemas/programs.ts`](../src/api/schemas/programs.ts).
**There is deliberately no Actions tracker and no bulk import/export here**
— neither survived the consolidation.

### `GET /api/programs`

**Query** (all optional): `search`, `pillar`, `institution`, `status`,
`page`, `pageSize` (max 200).

**Response**:

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "headlineCards": { "summary": {…}, "milestoneOnTime": {…}, "delayedOrBlocked": {…}, "evidenceOverdue": {…} },
  "programmes": { "items": [ /* … */ ], "page": 1, "pageSize": 25, "total": 40 }
}
```

`headlineCards` is **four named fields**, each its own shape (mirrors the
Executive Overview pattern):

| Field | Notable fields |
| --- | --- |
| `summary` | `activeProgrammes`, `activeProjects`, `newThisCycle`, `closedThisCycle` |
| `milestoneOnTime` | `percentOnTime` (0–100), `dueCount`, `completedCount`, `delayedCount`, `blockedCount` |
| `delayedOrBlocked` | `count`, `supportingLabel` (free text, e.g. "3 blocked ≥30 days"), `trend` **required** (not optional here) |
| `evidenceOverdue` | `count`, `supportingLabel` (e.g. "median 61 days since last update"), `trend` **required** |

`programmes` is the paginated register (`programmeRecordSchema`) — each row:
`leadInstitution`, `supportingInstitutions[]`, `pillar`, `objectives`,
`financing` (nullable — held at project level for some programmes),
`status` (`ExecutionStatus`), `priority` (`priority`/`standard`),
`startDate`/`endDate`, `bottlenecks[]` (ids), `bottleneckCategory`
(nullable), `validationStatus`, `lastUpdate`.

### `GET /api/programs/filters`

`{ pillars, institutions, statuses }`, each `{ value, label }[]`.

### `GET /api/programs/:programmeId`

Single programme record (`programmeRecordSchema`). 404 if not found.

### `GET /api/programs/:programmeId/projects`

**Query** (optional): `search`, `status`. Returns `ProjectRecord[]` for this
programme — **not paginated** (a programme's project list is expected to
stay small; revisit if that stops being true).

### `GET /api/programs/projects/:projectId`

Single project (`projectRecordSchema`), aligned to the Programme & Project
tracking workbook's column set. Notable fields:

- `pillar` — the workbook's "M300 Pillar Alignment"; **a project can align
  to a different pillar than its parent programme's primary pillar.**
- `lifecycleStage`, `programType`, `fundingSource` (nullable — not yet
  secured), `fundingStructure`, `fundingStatus`.
- `projectedStatus` vs `currentStatus` — both `ExecutionStatus`, shown
  side by side so a gap between plan and reality is visible at a glance.
- `evidenceUrl` (nullable), `bottlenecks[]`, `bottleneckCategory` (nullable),
  `comment` (workbook's "Comment – Issues/Main Risk/Bottlenecks"),
  `suggestion`.
- `profile` — a nested object: `description`, `budgetUsd`, `disbursedUsd`,
  `contractor` (nullable), `contactName`, `contactEmail`, `documents[]`
  (`{label, url}`), `updates[]` (`{date, note}`).

### `GET /api/programs/projects/:projectId/milestones`

Returns `MilestoneRecord[]` for this project — not paginated. Each:
`priority`, `expectedDate`, `actualDate` (nullable — until reached),
`status`, `leadInstitution`, `evidenceUrl` (nullable), `risk`, `nextAction`,
`bottleneckCategory` (nullable), `validationStatus`.

---

## Bottlenecks & Exceptions

The full delivery-constraint register — richer than the lightweight
`Bottleneck` shown in Executive Overview's Section D exception list, and
richer than Pillar Dashboards' `bottleneckRecordSchema` view. Specification:
[`docs/specs/bottlenecks-exceptions.md`](specs/bottlenecks-exceptions.md).
Schema: [`src/api/schemas/bottlenecks.ts`](../src/api/schemas/bottlenecks.ts).

**Note on severity vocabularies:** this module's `RegisterSeverity`
(`critical`/`high`/`medium`/`low`) is a **different enum** from Executive
Overview's `BottleneckSeverity` (`critical`/`regulatory`/`delayed`/
`blocked`) — they answer different questions (how bad vs. what kind) for
different audiences. Do not conflate them.

### `GET /api/bottlenecks`

**Query** (all optional): `search`, `severity`, `category`, `institution`,
`pillar`, `linkedRecord`, `lifecycleStage`, `escalationStatus`,
`validationStatus`, `reportingPeriod`, plus pagination: `page`, `pageSize`
(max 200), **and** `escalationPage` — the register and the escalation
tracker paginate **independently** even though both come back in the same
payload.

**Response**:

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "alerts": [ /* exactly 4 headline alert cards */ ],
  "register": { "items": [ /* … */ ], "page": 1, "pageSize": 25, "total": 90 },
  "byCategory": [ /* Section C */ ],
  "byLifecycleStage": [ /* Section C */ ],
  "byInstitution": [ /* Section D */ ],
  "escalations": { "items": [ /* … */ ], "page": 1, "pageSize": 25, "total": 12 }
}
```

- `alerts` — **exactly 4** (`alertCardSchema`). Every one targets zero and
  compares against the previous reporting cycle. **None are performance
  KPIs** — they are alert counts, so none carry a progress bar. `trend` is
  **required** (not optional) on this card.
- `register` — the full record (`bottleneckRecordSchema`): `issue`,
  `category`, `severity`, `pillar`, `linkedRecord` (free-text reference to
  the indicator/programme/project it relates to), `institution`,
  `dateRaised`, `ageDays`, `followUp`, `escalationStatus`, `status`
  (`open`/`in-progress`/`blocked`/`escalated`/`resolved`), `lifecycleStage`.
- `byCategory` / `byLifecycleStage` / `byInstitution` — aggregate counts
  over the **full register**, not the filtered/paginated page (same
  "describes the whole, not the slice" rule as KPI Directory's summary
  cards).
- `escalations` — `escalationRecordSchema`: `bottleneckId` (join key),
  `decisionRequired`, `level` (`programme-management`/`institution-
  leadership`/`steering-committee`/`ministerial`), `owner`, `dueDate`,
  `daysOverdue`, `status`, `resolution` (nullable), `evidenceUrl` (nullable).

### `POST /api/bottlenecks`

Creates a new register entry.

**Request** (`createBottleneckRequestSchema`):
```jsonc
{
  "issue": "Transmission evacuation constraint limiting dispatch, North East",
  "category": "technical-constraint",
  "severity": "critical",
  "pillar": "generation-network",
  "linkedRecord": "IMP-2025-0055",       // optional
  "institution": "Transmission Company of Nigeria",
  "lifecycleStage": "implementation",
  "followUp": "…"                        // optional, max 1000 chars
}
```

**Response** `201`:
```jsonc
{ "record": { /* full bottleneckRecordSchema, server-assigned id, dateRaised, etc. */ }, "message": "…" }
```

### `GET /api/bottlenecks/filters`

Nine option groups: `severities`, `categories`, `institutions`, `pillars`,
`linkedRecords`, `lifecycleStages`, `escalationStatuses`,
`validationStatuses`, `reportingPeriods`.

### `GET /api/bottlenecks/by-project/:projectId`

Returns bottleneck records linked to a specific project (used by the
Programs project drill-down). Not paginated.

---

## Data Submissions

The full Data Submissions → validation → calculation → approval → KPI-publish
pipeline. This is the module with the most operational business logic in
the product — read it carefully. Schemas:
[`src/api/schemas/data-submissions/`](../src/api/schemas/data-submissions/)
(split across `common.ts`, `obligations.ts`, `submissions.ts`,
`compliance.ts`, `filters.ts`).

### Shared workflow vocabulary

Every list item across this module carries a `status: WorkflowStatus`
object, not a bare string:

```jsonc
{ "code": "pending-review", "label": "Pending review", "tone": "warning" }
```

`code` is one of: `due`, `draft`, `validation-failed`, `ready`,
`pending-review`, `returned`, `rejected`, `provisional`, `approved`,
`overdue`, `missing`, `open`, `in-progress`, `resolved`. `tone` is one of
`neutral`/`info`/`warning`/`danger`/`success` — the frontend colours the
status pill from `tone`, not by re-deriving meaning from `code`, so send the
tone that matches the severity you intend, not just a code that happens to
exist.

Every list item also carries `availableActions: WorkflowAction[]` —
`enter-data`, `upload-template`, `view`, `review`, `download-template`,
`correct`, `submit`, `contact-owner`. **The backend decides which actions
are available for a given row's current state** — the frontend renders
exactly the buttons this array lists, it does not compute availability
itself.

### `GET /api/data-submissions/filters`

Eight groups: `institutions`, `datasets`, `reportingPeriods`,
`submissionStatuses`, `validationStatuses`, `reviewers`, `readinessTiers`,
`overdueStatuses`.

### `GET /api/data-submissions/obligations`

The reporting-obligation register — what each institution owes, by when.

**Query**: `search`, `institution`, `dataset`, `reportingPeriod`,
`submissionStatus`, `validationStatus`, `reviewer`, `readinessTier`,
`overdueStatus`, `page`, `pageSize` (max 100).

**Response**: paginated `Obligation[]` — `institution`, `dataset`,
`reportingPeriod`, `frequency`, `dueDate`, `dueLabel` (display string, e.g.
"Due in 5 days"), `status`, `template: { id, version, fileName,
downloadUrl }`, `acceptedSubmissionId` (nullable — the submission currently
counted as fulfilling this obligation, once one is approved/provisional),
`availableActions`.

### `GET /api/data-submissions/obligations/:id/entry`

Returns the **manual-entry form definition** for this obligation —
`manualEntryDefinitionSchema`: `title`, `institution`, `dataset`,
`reportingPeriod`, `sections[]`, each with `fields[]`
(`entryFieldSchema`: `id`, `label`, `helpText`, `type`
(`text`/`number`/`date`/`select`/`textarea`), `required`, `unit` (nullable),
`placeholder`, `options` for `select` fields). **The form is entirely
server-driven** — the frontend renders whatever fields you send, so adding
a data-collection field is a backend-only change.

### `POST /api/data-submissions/obligations/:id/entry`

Submits manual entry.

**Request**: `{ "values": { "<fieldId>": "<string>", ... }, "sourceReference": "…", "notes": "…" }`
(all values are sent as strings regardless of the field's `type` — the
backend parses/validates by type).

**Response** `201` (`draftSavedSchema`):
```jsonc
{ "submissionId": "…", "version": 1, "status": { "code": "pending-review", … }, "message": "…", "nextUrl": "/data-submissions/validation/…" }
```

### `GET /api/data-submissions/obligations/:id/upload`

Returns the **upload definition** — `uploadDefinitionSchema`: `institution`,
`dataset`, `reportingPeriod`, `template` (same shape as above),
`acceptedFileTypes[]` (e.g. `['.xlsx']`), `acceptedFileTypesLabel`,
`maxFileSizeMb`.

### `POST /api/data-submissions/obligations/:id/upload`

**`multipart/form-data`**, not JSON. Form fields:

| Field | Required | Notes |
| --- | --- | --- |
| `file` | yes | The completed template. `400` if missing. |
| `sourceReference` | yes | `400` if blank. |
| `notes` | no | Defaults to empty string. |

**Response** `201` — same shape as the manual-entry response above
(`submissionId`, `version`, `status`, `message`, `nextUrl`).

**Backend responsibility, not the frontend's:** parsing the uploaded file,
validating every row against the dataset's field definitions, running the
dataset's calculation formula, and producing the `extractedValues` shown on
the review screen (see `submissionDetailSchema` below). The frontend does
not calculate KPI values from an upload — it only uploads the file and
displays what the backend computed.

### `GET /api/data-submissions/templates/:fileName`

Downloads the current template workbook for a dataset, generated fresh from
the dataset's current field configuration (so adding a field to the
dataset changes the downloadable template with no separate release).
Returns the file with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

### `GET /api/data-submissions/submissions`

**Query**: `search`, `institution`, `dataset`, `reportingPeriod`,
`submissionStatus`, `page`, `pageSize`.

**Response**: paginated `SubmissionListItem[]` — `method`
(`manual-entry`/`template-upload`/`api`), `methodLabel`, `version`,
`submittedBy`, `submittedAt` (nullable — null for a draft never submitted),
`submittedAtLabel`, `status`, `validationSummary` (free text), plus the
shared `institution`/`dataset`/`reportingPeriod`/`availableActions`.

### `GET /api/data-submissions/validation`

The review queue. **Query**: same as `/submissions`, plus (implicitly) only
rows awaiting a decision. **Response**: paginated `ValidationQueueItem[]` —
extends `SubmissionListItem` with `reviewer`, `ageLabel`, `automatedCheck`
(a `WorkflowStatus` — pass/fail of the backend's automated validation pass),
`issueCount`.

### `GET /api/data-submissions/validation/:id`

Full review detail — `submissionDetailSchema`, extends
`ValidationQueueItem` with:

- `fileName` (nullable — null for manual entry).
- `issues[]` (`validationIssueSchema`): `type`, `location`, `field`,
  `message`, `requiredCorrection` — **every failed validation rule the
  backend found**, specific enough that a reviewer or submitter can act on
  it without guessing.
- `history[]` (`statusHistoryItemSchema`): every status transition this
  submission has been through, with `actor`, `occurredAt`, `comment`.
- `permittedDecisions[]` — subset of `['approved', 'provisional',
  'returned', 'rejected']`. **The backend decides which decisions are
  legal from the current state** (e.g. a submission with unresolved
  critical issues should not permit `approved`) — the frontend only shows
  buttons for what's in this array.
- `extractedValues[]` (`kpiExtractionSchema`): `kpiId`, `kpiName`,
  `reportingPeriod`, `value` — **what publishing this submission would
  write to which KPI**, shown to the reviewer *before* they decide, and
  echoed back (confirmed) in the decision response below.

### `POST /api/data-submissions/validation/:id/decisions`

Records a reviewer's decision.

**Request**: `{ "decision": "approved" | "provisional" | "returned" | "rejected", "comments": "…" }`
(`comments` min 3 chars — `400` if shorter, and reject if `decision` is not
in this submission's current `permittedDecisions`).

**Response** `200` (`validationDecisionResponseSchema`):
```jsonc
{
  "submissionId": "…",
  "status": { "code": "approved", … },
  "message": "Decision recorded: Approved. Published to Metering Rate.",
  "nextUrl": "…",
  "published": [ /* kpiExtractionSchema[] — empty for 'returned'/'rejected', or if nothing was extracted */ ]
}
```

**This is the point where a KPI's current value and history actually
change.** `approved` and `provisional` decisions publish every entry in
`extractedValues` to its KPI (updates `KpiProfile.current`, appends a
`KpiHistoryPoint` with `submissionId` set to this submission, and should
also update the obligation's `acceptedSubmissionId`). `returned` and
`rejected` publish nothing. The `published` array in the response should
reflect exactly what was written, so the frontend can confirm the
publish happened rather than assuming it did.

### `GET /api/data-submissions/overdue`

Paginated `OverdueItem[]` — obligations past their `dueDate` with no
accepted submission. `overdueLabel` (e.g. "12 days overdue"), `owner`,
`status`, `availableActions`.

### `GET /api/data-submissions/gaps`

Paginated `DataGap[]` — KPIs with no submission ever received for the
current period. `kpiId`, `kpiName`, `pillar`, `category`, `readinessTier`,
`owner`, `nextAction`.

---

## State & DisCo

Six separate endpoints rather than one parameterised view — schemas split
across [`src/api/schemas/state-disco/`](../src/api/schemas/state-disco/).
Every response wraps its rows in a shared `meta` block
(`pageMetaSchema`: `title`, `description`, `lastUpdatedLabel`,
`sourceLabel`) so each view can carry its own framing text even though the
page shell is shared.

### `GET /api/state-disco/filters`

Eight groups: `reportingPeriods`, `views`, `distributionCompanies`,
`states`, `utilityMetrics`, `serviceBands`, `validationStatuses`, `sources`.

### `GET /api/state-disco/overview`

```jsonc
{ "meta": { … }, "selectedUtility": "…", "metrics": [ /* exactly 4 performanceMetricSchema */ ] }
```

Each metric: `value`, `supportingLabel`, `benchmarkLabel`, `varianceLabel`,
`progressPercent` (0–100), `trend` (**required**), `provenance`.

### `GET /api/state-disco/comparison`

**Query**: `distributionCompany` — a DisCo id, or `national` (the sentinel
for "all DisCos", **not** `all` — this one endpoint's convention differs
from every other module's `all`, so match it exactly). Rows
(`discoComparisonRowSchema`) carry pre-computed
display strings for active/metered/unmetered customers, metering rate,
energy received/billed + billing efficiency, revenue billed/collected +
collection efficiency, remittance performance, plus paired bar-percent
fields (`energyReceivedBarPercent`, `energyBilledBarPercent`,
`revenueBilledBarPercent`, `revenueCollectedBarPercent`, each 0–100) driving
the comparison bars.

### `GET /api/state-disco/supply-tariff`

**Query**: `distributionCompany` (same convention as `/comparison` above).
Rows (`utilityOperationsRowSchema`): `utility`, `effectiveOrder`, and
**exactly 5** `bands` (`serviceBandCellSchema`: `band` — `A`–`E` — plus
`supplyHours`, `tariff`, `intensityPercent`). Service bands are shown
separately per the spec — **no unweighted tariff average across bands.**

### `GET /api/state-disco/delivery`

**Query**: `distributionCompany` (same convention as `/comparison` above).
Rows (`deliveryRowSchema`): `milestone`, `dueDateLabel`, `executionStatus`,
`achievedLabel`, `evidenceLabel`, `reportingCompliance`, `bottleneck` (free
text, may be empty string when none).

### `GET /api/state-disco/states`

**Query**: `state` (a state id, or `all`/omitted for every state).
Rows (`stateCoverageRowSchema`): `state`, `zone`, `miniGridConnections`,
`solarHomeSystems`, `activeProgrammes`, `activeProjects`,
`openBottlenecks`, `validationLabel`, `coverageBarPercent` (0–100). Also
carries a `notice` string — **connection counts must not be converted into
an inferred state electricity-access rate**; state-level access rate is not
a value this endpoint should invent.

### `GET /api/state-disco/states/:id`

Single-state detail (`stateDetailSchema`): the matching
`stateCoverageRowSchema` row plus `records[]`
(`stateRecordSchema`: `type` — `programme`/`project`/`bottleneck` —
`name`, `owner`, `status`, `deliveryLabel`, `sourceLabel`). 404 if the state
id doesn't exist.

---

## Reports & Exports

Specification: [`docs/specs/reports-exports.md`](specs/reports-exports.md).
Schema: [`src/api/schemas/reports.ts`](../src/api/schemas/reports.ts). The
spec groups reports into four **categories** (`compact`, `performance`,
`delivery`, `data-governance`), each containing one or more **report
types** — a report type, not a category, is what a user actually generates
or finds in Saved Reports; category is a display grouping over them
(`REPORT_TYPE_CATEGORY` in the schema is the fixed mapping).

### `GET /api/reports/filters`

Ten groups, including `exportFormats` (`pdf`/`xlsx`).

### `GET /api/reports`

**Query**: `search`, `category`, `page`, `pageSize` (max 50) — applies
**only to the Saved Reports list** (Section C). The catalogue (Section A)
and Compact-export cards (Section D) describe the fixed set of available
report types, not filtered results.

**Response**:
```jsonc
{
  "lastUpdated": "…",
  "catalogue": [ /* reportCatalogueCardSchema[] — every report type, with definition/methodology/dataSource */ ],
  "compactExports": [ /* compactExportCardSchema[] — 'compact-progress-report' and 'implementation-register' */ ],
  "savedReports": { "items": [ /* … */ ], "page": 1, "pageSize": 10, "total": … }
}
```

### `POST /api/reports/preview`

**Request** (`reportConfigSchema`): `reportType`, `period`, `pillar`,
`kpiCategory`, `state`, `distributionCompany`, `programmeOrAgency`,
`validationStatus`, `readinessTier`, `format`. `400` on a schema mismatch.

**Response** (`reportPreviewSchema`): `metadata` (`reportMetadataSchema` —
`title`, `reportingPeriod`, `appliedFilters[]` as `{label, value}` pairs,
`generatedAt`, `dataVersion`, `sourceNotes`, `validationStatus`, `units`,
`limitations` — **all required**, the specification mandates this context
accompany every report, not just the raw data) and `sections[]`
(`reportSectionSchema` — generic `{title, columns[], rows[][]}` tables). The
same shape backs both the on-screen preview and the generated file, so
build one renderer, not two.

### `POST /api/reports/generate`

Same request as `/preview`. **Response**: `{ preview, savedReport }` —
generates the actual downloadable file (per `config.format`) *and* persists
a `savedReportSchema` row (id, owner, `fileReference`, `createdAt`,
`lastGeneratedAt`, the `config` that produced it) so it appears in Saved
Reports afterward.

### `DELETE /api/reports/saved/:id`

`204` on success. `404` with `{ message }` if the id doesn't exist.

---

## Administration (User Access)

Specification: [`docs/specs/user-access-administration.md`](specs/user-access-administration.md).
Schema: [`src/api/schemas/administration.ts`](../src/api/schemas/administration.ts).
**This module is account/permission administration, not performance
measurement** — the spec is explicit: "these cards summarise account and
permission administration. They are not performance targets."

### `GET /api/administration`

**Query**: `search` (name/email/institution), `institution`, `role`,
`accountStatus`, `permission`, `accessScope`, `module`, `auditPeriod`.

**Response**:
```jsonc
{
  "lastUpdated": "…",
  "summary": [ /* accessSummaryCardSchema[] */ ],
  "users": { "items": [ /* userAccountSchema[] */ ], … },
  "roles": [ /* roleDefinitionSchema[] — all 7, not paginated */ ],
  "scopeAssignments": { "items": [ /* … */ ], … },
  "auditLog": { "items": [ /* … */ ], … }
}
```

- `summary[]` — each carries `breakdown[]` (label/count pairs) and
  `elevated: boolean` — true marks the one card needing visual emphasis
  (accounts with elevated/admin rights).
- `users[]` (`userAccountSchema`) — `role` is one of the **seven**
  `SystemRole` values (see [Shared enumerations](#shared-enumerations-reference)),
  `status` one of `active`/`pending`/`inactive`/`suspended`, `lastLogin`
  nullable (never signed in).
- `roles[]` (`roleDefinitionSchema`) — the role × permission matrix:
  `permissions[]` (subset of the seven `Permission` values), `modules[]`
  (free-text module names this role can reach, used by the frontend's
  role-based nav filtering), `assignedUsers` (**live count**, not static).
- `scopeAssignments[]` — a user's responsibility pinned to a `scopeLevel`
  (`national`/`state`/`distribution-company`/`institution`/`programme`/
  `project`/`dataset`/`indicator`) and a specific `scope` string (e.g.
  "Ikeja DisCo"). `effectiveTo` nullable (open-ended).
- `auditLog[]` (`auditEventSchema`) — `recordId`/`priorValue`/`newValue` all
  nullable (a creation has no prior value, a deletion has no new value),
  `result` one of `success`/`failure`/`rejected`.

### `GET /api/administration/filters`

Seven groups: `institutions`, `roles`, `accountStatuses`, `permissions`,
`accessScopes`, `modules`, `auditPeriods`. **This module has its own eight
filters** (per the spec) — the global filter bar does not apply here.

### `POST /api/administration/users/invite`

**Request** (`inviteUserRequestSchema`): `name`, `email`, `institution`,
`designation`, `role`, `accessScope` (a `ScopeLevel`),
`invitationMessage` (optional, max 500 chars).

**Response** `201`: `{ user: userAccountSchema, message: "…" }` — the new
account, status `pending` until the invitee accepts.

---

## Stakeholders & Institutions

Specification: [`docs/specs/stakeholders-institutions.md`](specs/stakeholders-institutions.md).
Schema: [`src/api/schemas/stakeholders.ts`](../src/api/schemas/stakeholders.ts).

### `GET /api/stakeholders`

**Query**: `search`, `institutionType`, `role`, `status`, `dataset`, `kpi`,
`programme`, `coverage` — all optional, all applied server-side (this
endpoint is **not paginated**; the full filtered list returns every time).

**Response**:
```jsonc
{
  "lastUpdated": "…",
  "summary": { "activeInstitutions": 24, "dataCustodians": 11, "pendingOnboarding": 2 },
  "institutions": [ /* institutionSchema[] */ ],
  "custodians": [ /* custodianAssignmentSchema[] */ ],
  "filters": { /* the same 7 groups the query above filters by */ }
}
```

- `institutions[]` — `type` one of `ministry`/`agency`/`regulator`/
  `utility`/`disco`/`programme-team`/`partner`; `status` one of
  `active`/`pending-onboarding`/`inactive`; `roles[]`/`datasets[]`/
  `programmes[]` as free-text arrays (identifiers or labels this
  institution is tied to).
- `custodians[]` (`custodianAssignmentSchema`) — who owns which dataset:
  `dataset`, `custodian`, `focalPerson`, `frequency`, `template`,
  `reviewer`, `validator`, `status` (`active`/`pending`).

---

## Shared enumerations reference

Closed sets used across multiple modules. A value outside these fails
frontend validation. (Module-specific enums — e.g. Data Submissions'
`WorkflowStatus`, Bottlenecks' `RegisterSeverity`, Administration's
`SystemRole` — are documented in their own section above; this table is
just the cross-cutting ones from `common.ts`.)

| Enum | Values |
| --- | --- |
| `PillarId` | `generation-network`, `last-mile-access`, `financially-viable-utilities`, `private-sector-participation`, `regional-integration`, `clean-cooking` |
| `DeliveryStatus` | `completed`, `on-track`, `at-risk`, `lagging`, `delayed`, `blocked`, `limited-data`, `provisional` |
| `DataConfidence` | `confirmed`, `requires-validation`, `future-gap` |
| `SourceTag` | `live`, `live-cpr`, `public-source`, `indicative`, `requires-validation` |
| `ImprovementDirection` | `higher-is-better`, `lower-is-better` |
| `MetricIconName` | `access`, `metering`, `losses`, `capital`, `generation`, `cooking`, `milestones`, `pillars`, `kpis`, `escalations`, `institutions`, `generic` |
| `ExecutionStatus` (Programs, reused by Pillar Dashboards & Executive Overview) | `on-track`, `at-risk`, `delayed`, `blocked`, `completed` |
| `ValidationStatus` (KPI Directory, reused by Programs) | `confirmed`, `public-source`, `requires-validation`, `provisional`, `future` |

`limited-data` and `provisional` (`DeliveryStatus`) are **not** performance
judgements. They mean the dashboard cannot yet assert how something is
performing — a pillar with no KPIs assigned must not be presented as
failing.

`MetricIconName` is a semantic name, not an icon — the frontend maps it to
a glyph internally, so the backend never needs to know about the icon
library.

---

## Open questions for the backend team

1. **Pillar-specific headline cards** — which two metrics should replace the
   middle cards for each of the six pillars? (Blocks full dynamic
   pillar-headline behaviour; today all four are the same generic shape for
   every pillar.)
2. **Pre-formatted values** — keep the display-string convention, or move
   to structured values (`{ value, unit, scale, precision }`) with
   formatting owned by the frontend? See the note under *Conventions*.
3. **Filter reach** — resolved for Executive Overview: only reporting
   period, Compact pillar and institution are accepted there. Every other
   module has its own, separate filter set, documented in that module's
   section — confirm you're building against each module's own list, not
   assuming the global one applies everywhere.
4. **Auth scheme** — the two-step identify/login flow above is settled UX.
   Not yet settled: whether the `accessToken` is a JWT, how long it lives,
   whether there's a refresh flow, and the exact header (`Authorization:
   Bearer <token>` is assumed but not yet confirmed against a real
   implementation).
5. **Pagination** — ✅ resolved. `?page=1&pageSize=25` → `{ items, page,
   pageSize, total }`, used identically everywhere paginated. Please
   implement it exactly as specified, including `total` being the full
   matching count, not `items.length`.
6. **Sorting** — currently client-side over the returned page only, so
   sorting page 1 of a paginated table sorts 25 rows, not the full result
   set. To sort properly we need server-side sorting — proposal:
   `?sort=<column>&order=asc|desc`, with `<column>` matching the response
   field name exactly. Confirm which columns you'll accept per module.
7. **Public Gateway data threshold** — should `GET /api/public/overview`
   (not yet built) return every KPI regardless of validation status, or
   hold back anything not `confirmed`/`public-source`? See that section
   above — recommended default is the latter, not yet locked in.
8. **`GET /api/public/overview`** — the one wholly new endpoint this
   contract requires that doesn't exist as a mock yet. See
   [Public Gateway](#public-gateway) for its full requirements.
9. **Role enforcement is entirely client-side today** — every
   role-restricted UI (KPI definition editing, branding/Customization) only
   *hides the control* for the wrong role; no endpoint currently checks the
   caller's role at all, because there's no auth scheme wired up yet (see
   open question 4). Once auth exists, `PATCH /api/kpi-explorer/kpis/:id`
   and `PUT /api/branding`/`PUT /api/branding/fonts` must reject any role
   other than `system-administrator` server-side — treat the frontend's
   hiding of these controls as a UX nicety, not a permission boundary.

---

## Running the mocks

The frontend runs fully standalone against the mocks — no backend needed:

```bash
pnpm install
copy .env.example .env.local
pnpm dev            # http://localhost:5173, VITE_DATA_MODE=mock by default in dev
```

Handlers live in [`src/mocks/handlers.ts`](../src/mocks/handlers.ts) and
[`src/mocks/handlers/`](../src/mocks/handlers/) and are the executable form
of this document — when in doubt about an edge case, the handler is the
tie-breaker over prose here (and if the two disagree, that's a bug in this
doc, please flag it).

To point the frontend at your real API instead:

```bash
VITE_DATA_MODE=backend VITE_API_BASE_URL=https://your-host/api pnpm dev
```

To proxy only specific finished modules while the rest stay mocked (staged
rollout):

```bash
VITE_DATA_MODE=hybrid VITE_SUBMISSIONS_BACKEND_URL=https://your-host pnpm dev
```
