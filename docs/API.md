# Mission 300 Monitoring Dashboard — API contract

**Audience:** the gApp backend team.
**Status:** frontend-defined contract, derived from the approved page
specifications. Endpoints below are implemented as mocks and consumed by a
working frontend, so the shapes are exercised, not theoretical.

## How this contract is defined

The authoritative definition is **zod schemas** in
[`src/api/schemas/`](../src/api/schemas/). Everything else is derived from
them:

| Artifact | Source |
| --- | --- |
| TypeScript types | inferred with `z.infer` from the schemas |
| Runtime validation | the frontend validates every response against its schema |
| Mock responses | [`src/mocks/`](../src/mocks/), asserted to satisfy the schemas in CI |
| This document | written against the schemas |

**The frontend rejects responses that do not match.** A mismatch throws a
`ContractError` naming the offending field path — it does not silently render
blanks. Please treat the schemas as binding.

If a shape needs to change, change the schema and this document together, and
tell us — a field added is harmless, a field removed or retyped is a breaking
change.

## Conventions

- **Base URL** — everything is under `/api`. Configurable via `VITE_API_BASE_URL`.
- **Content type** — `application/json` in both directions.
- **Timestamps** — ISO 8601 with timezone, e.g. `2025-10-14T09:12:00Z`. The
  frontend renders them in `Africa/Lagos`.
- **Errors** — non-2xx with a JSON body `{ "message": "human readable" }`. The
  frontend displays `message` directly to the user, so write it for a reader.
- **Empty vs zero** — `0` is a real value and is rendered as `0`. Use `null`
  only where the schema allows it, and it means "not applicable / not yet
  approved", never "zero".

### Nullability carries meaning

Two fields are nullable on purpose, and the distinction is a specification
requirement rather than a convenience:

- `AccessChannel.target` / `percentComplete` — `null` means **no approved
  target exists**. The specification forbids deriving a grid-connection target
  from the 9% access-rate commitment. When null, the UI shows period-on-period
  trend only and renders no progress bar. Do not send `0` here.
- `BulletMetric.target` — `null` means no Compact target is currently stated
  (ATC&C losses). `BulletMetric.expected` — `null` means no approved
  trajectory exists for the period.

---

## `GET /api/filters`

Option lists for the global filter bar. Cached for the session by the
frontend, so it may be called once per page load.

**Response** — every group is an array of `{ value, label }`; `value` is the
identifier sent back in queries, `label` is displayed.

```jsonc
{
  "reportingPeriods":      [{ "value": "q3-2025", "label": "Q3 2025" }],
  "pillars":               [{ "value": "all", "label": "All pillars" }],
  "institutions":          [{ "value": "nerc", "label": "NERC" }]
}
```

Notes:
- `pillars` values must match the pillar IDs listed under *Enumerations* below,
  plus `all`.
- The Executive Overview exposes only reporting period, Compact pillar and
  institution. Other module-specific filters belong to their own endpoints.
- Options are server-driven so adding a period or institution needs no
  frontend release.

---

## `GET /api/executive-overview`

The Compact leadership view. Structure mirrors the page specification section
by section — see [`docs/specs/executive-overview.md`](specs/executive-overview.md).

**Query parameters** — all optional, all from the global filter bar:

| Parameter | Example |
| --- | --- |
| `period` | `q3-2025` |
| `pillar` | `last-mile-access` or `all` |
| `institution` | `nerc` or `all` |

The backend must apply every supplied parameter before returning the payload.
The frontend does not calculate KPI values, project status totals or progress;
it renders the endpoint response and animates between the previous and new
server snapshots. When a filter has no matching records, return empty arrays
for the affected sections rather than reusing the unfiltered data.

**Response** (abbreviated — see the schema for every field):

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "appliedPillar": "all",          // echo back what you actually applied
  "headlineCards": { … },          // Section A — exactly four, see below
  "accessDelivery": [ … ],         // Section B — three channels
  "nationalPerformance": [ … ],    // Section C — six bullet metrics
  "deliveryStatus": { … }          // Section D — ongoing projects, chart counts + exceptions
}
```

### `appliedPillar`

Echo the pillar the payload was actually calculated for (`all` for All
Pillars). The frontend uses this to confirm the server applied what was asked
rather than assuming.

### Section A — `headlineCards`

**Exactly four**, as named fields, not an array. The specification states "only
four cards appear at the top", so a missing card is a validation failure.

| Field | Card | Notable requirements |
| --- | --- | --- |
| `peopleWithElectricityAccess` | People with electricity access | Baseline, current value and 2030 target on a shared scale |
| `accessRate` | Electricity access rate | **`sourceYear` is required** — the spec says it must be visible at all times, because this is an annual official publication that must never read as current-period data |
| `generationCapacity` | Available generation capacity | `sparkline[]` — ordered oldest→newest; needs ≥2 points to render |
| `cleanCookingAccess` | Clean cooking access | Baseline, current percentage and 2030 target on a shared scale |

Headline outcomes remain national when a pillar is selected. Sections C and D
narrow to the selected pillar.

### Section B — `accessDelivery`

Three channels, in this order: `grid-connections`, `mini-grid-connections`,
`solar-home-systems`.

Targets named in the workbook: 750,000 mini-grid household connections by 2030
(DARES); 2.75 million Solar Home Systems by 2030. Grid connections have **no
approved target** — send `target: null`.

### Section C — `nationalPerformance`

Six bullet metrics: `renewable-share`, `metering-rate`, `atcc-losses`,
`market-remittance`, `tariff-shortfall`, `private-capital`.

Each carries **its own scale** (`scaleMin`/`scaleMax`) because the metrics are
not comparable — a percentage, a naira total and a loss rate share no axis.
`scaleMax` must be greater than `scaleMin` (enforced).

`direction` must be `lower-is-better` for `atcc-losses` and `tariff-shortfall`.
This drives arrow colouring: for those metrics a **falling** value is an
improvement and renders green.

### Section D — `deliveryStatus`

- `ongoingProjects[]` — compact project rows shared by the searchable table
  and map views. The backend must
  exclude `completed` records. Each row includes project/programme IDs and
  names, pillar and label, owner, location, latitude, longitude, current
  status, start date and end date. IDs power the project and programme
  drill-down links. Coordinates drive the Nigeria map. The frontend does not
  geocode location strings.
- `statusSummary[]` — backend-calculated overall counts for `on-track`,
  `at-risk`, `delayed` and `blocked`. The Apex donut chart renders these
  values directly and does not group or calculate them by pillar.
- `exceptions[]` — ranked by severity, delivery impact and days unresolved.
  The UI displays at most five; sending more is allowed and harmless.

The specification is explicit: **count records by status, never average
unrelated performance percentages.**

---

## Enumerations

Closed sets. A value outside these fails validation.

| Enum | Values |
| --- | --- |
| `PillarId` | `generation-network`, `last-mile-access`, `financially-viable-utilities`, `private-sector-participation`, `regional-integration`, `clean-cooking` |
| `DeliveryStatus` | `completed`, `on-track`, `at-risk`, `lagging`, `delayed`, `blocked`, `limited-data`, `provisional` |
| `DataConfidence` | `confirmed`, `requires-validation`, `future-gap` |
| `SourceTag` | `live`, `live-cpr`, `public-source`, `indicative`, `requires-validation` |
| `ImprovementDirection` | `higher-is-better`, `lower-is-better` |
| `BottleneckSeverity` | `critical`, `regulatory`, `delayed`, `blocked` |
| `MetricIconName` | `access`, `metering`, `losses`, `capital`, `generation`, `cooking`, `milestones`, `pillars`, `kpis`, `escalations`, `institutions`, `generic` |

`limited-data` and `provisional` are **not** performance judgements. They mean
the dashboard cannot yet assert how something is performing — a pillar with no
KPIs assigned must not be presented as failing.

`MetricIconName` is a semantic name, not an icon. The frontend maps it to a
glyph, so you never need to know about the icon library.

---

## `provenance` — required on every metric

The specification requires an information icon on every metric exposing four
things. All four are **required strings**; none may be empty.

```jsonc
{
  "definition":  "What this metric is, and what it is not.",
  "methodology": "How it is calculated, including exclusions.",
  "source":      "Which publication or register it comes from.",
  "lastUpdated": "2025-09-30T00:00:00Z"
}
```

This is not decoration. The dashboard's credibility rests on every figure
disclosing where it came from, and several specification entries carry explicit
caveats that must reach the reader — for example that milestone delivery is an
implementation measure and *not* an average of all KPIs, or that renewable
generation share is seasonal.

---

## Pre-formatted values — a decision to confirm

Several fields are sent **pre-formatted** as display strings alongside a raw
number:

```jsonc
{ "value": "₦2.2tn", "current": 2.2 }
{ "value": "$0.0B",  "current": 0 }
{ "value": "5.4 GW", "availableMw": 5400 }
```

This was done because the specification mandates metric-specific presentation.
**On reflection we think this is the wrong boundary** — it makes the backend
own currency and unit formatting, and blocks locale or compact-number changes
on the frontend.

**Proposal:** drop the display strings and send structured values instead:

```jsonc
{ "value": 2.2, "unit": "NGN", "scale": "trillion", "precision": 1 }
```

with formatting owned by the frontend. Please tell us which you prefer before
you build — this is much cheaper to change now than later.

---

## `GET /api/kpi-explorer`

The authoritative indicator catalogue (docs/specs/kpi-explorer.md). The KPI
identifier (e.g. `M300-FVU-001`) is first-class here for traceability, but the
specification says it must NOT appear on executive or pillar cards.

**Query** (all optional): `search`, `pillar`, `category`, `readiness`,
`validationStatus`, `sourceInstitution`, `reportingPeriod`, `geography`,
`page`, `pageSize`.

**Response**:

```jsonc
{
  "lastUpdated": "2025-10-14T09:12:00Z",
  "summary": [ … ],              // Section A — catalogue/readiness counts
  "catalogue": {                 // Section B — paginated (see envelope below)
    "items": [ … ], "page": 1, "pageSize": 25, "total": 17
  },
  "pillarDistribution": [ … ],   // Section D — value coverage by pillar
  "readinessDistribution": [ … ] // Section D — Core / Supporting / Future
}
```

Notes:
- The summary cards and distributions describe the **full catalogue**, not the
  filtered slice — they are catalogue readiness, not a response to the filter.
- Only `catalogue` is filtered and paginated by the query.
- `validationStatus` is one of `confirmed`, `provisional`, `pending`,
  `data-gap`. **A `pending` value must never be presented as confirmed**, and
  `data-gap` means no value exists — it is a catalogue fact, not a failure.
- `readiness` is `core`, `supporting` or `future`.
- Each `pillarDistribution[].byStatus` must sum to that pillar's `total`.

## `GET /api/kpi-explorer/kpis/:id`

Full profile for one indicator (Section C), fetched on drill-down so the heavy
payload is not loaded for every catalogue row. Returns 404 with
`{ "message": … }` for an unknown id.

Carries four panels' worth of data: metadata (definition, formula, unit,
aggregation, frequency, disaggregation, limitations), values (baseline,
current, target, variance, `history[]` for the trend chart), traceability
(source, reference, validation decision, version), and `linkedRecords[]` —
delivery records joined through the indicator identifier.

## `GET /api/kpi-explorer/filters`

This module's own eight filter option lists: `pillars`, `categories`,
`readinessTiers`, `validationStatuses`, `sourceInstitutions`,
`reportingPeriods`, `geographies`. (Same `{ value, label }[]` shape as the
global filters, but a distinct set — the KPI Explorer does not use the global
dashboard filters.)

---

## Pagination envelope

Shared by every paginated list (catalogue, users, scope assignments, audit
log). Agree this once; the four remaining table modules will reuse it.

```jsonc
{
  "items": [ … ],   // the current page only
  "page": 1,        // 1-based
  "pageSize": 25,
  "total": 312      // total matching records across ALL pages, not items.length
}
```

Query params: `?page=1&pageSize=25`. Sorting is currently **client-side over
the returned page only** — see open question 6.

---

## Open questions for gApp / the spec owner

1. **Pillar-specific headline cards** — which two metrics should replace the
   middle cards for each of the six pillars? (blocks full dynamic pillar
   behaviour)
2. **Pre-formatted values** — keep display strings, or move to structured
   values as proposed above?
3. **Filter reach** — resolved for Executive Overview: only reporting period,
   Compact pillar and institution are accepted. Module-specific geography,
   DisCo and technology filters remain outside this endpoint.
4. **Auth** — not yet specified. We assume a bearer token on every request;
   confirm the scheme and the login flow.
5. **Pagination** — ✅ resolved. Convention is `?page=1&pageSize=25` returning
   `{ items, page, pageSize, total }`, documented above and already used by the
   KPI catalogue, Users, Access scope and Audit log. Please implement it as
   specified.
6. **Sorting** — currently client-side over the returned page only, so sorting
   page 1 of a paginated table sorts 25 rows, not all of them. To sort the full
   result set we need server-side sorting: propose `?sort=<column>&order=asc`.
   Confirm the column identifiers you will accept (they should match the
   response field names).

---

## Running the mocks

The frontend runs fully standalone against the mocks — no backend needed:

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

Handlers live in [`src/mocks/handlers.ts`](../src/mocks/handlers.ts) and are
the executable form of this document. To point at a real backend instead:

```bash
VITE_ENABLE_MOCKS=false VITE_API_BASE_URL=https://your-host/api pnpm dev
```
