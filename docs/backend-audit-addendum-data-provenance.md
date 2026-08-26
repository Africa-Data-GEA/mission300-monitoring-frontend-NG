# Backend Audit — Addendum: live endpoint findings

**Date:** 25 August 2026
**Status:** Addendum to `full-dashboard-backend-logic-audit.md`. That document
stands.
**Method:** Authenticated live probing of `https://nigeria.geappindia.org/api`
as `amina.bello@m300.gov.ng` (role: System Administrator). Read-only `GET`
requests only — no writes were issued. Findings are observed HTTP behaviour, not
code reading, except where stated.

---

## 0. Correction to an earlier draft

An earlier version of this addendum claimed the deployed database contained
health, education and infrastructure records rather than Mission 300 data. That
was based on `nigeria_m300_mysql.sql`, the schema and seed committed to the
backend repository, which does contain exactly that — `Health`, `Education`,
`Infrastructure` pillars, an `Under-5 Mortality Rate` KPI, Ministries of Health
and Education.

**Live probing shows that is not what is deployed.** The running database holds
the six real Compact pillars, fourteen real M300 KPIs and eighteen real
institutions. The claim was wrong about production and is withdrawn.

What survives is a smaller but real problem: **the committed SQL does not match
the deployed database.** Anyone who clones that repository and runs its seed gets
a health-and-education system. There is no version-controlled artefact that
reproduces production, which means the deployment is not reproducible and the
schema cannot be reviewed.

*Ask the backend team for the schema and seed that match production, under
version control.*

---

## 1. Endpoint inventory

Twenty-nine `GET` endpoints probed with a valid admin token. Twenty-six return
`200`. Three return `404`:

| Endpoint | Response |
|---|---|
| `GET /api/pillars/generation-network` | `404 {"message":"Unknown pillar: generation-network"}` |
| `GET /api/reports/methodology` | `404 {"message":"No route matches ..."}` |
| `GET /api/data-submissions/datasets` | `404 {"message":"No route matches ..."}` |

Their route table also has no entry for four write paths the frontend calls:
`POST /programs`, `POST /programs/projects`, `PATCH /programs/projects/:id`,
`DELETE /programs/projects/:id`, and `POST /branding/reset`. This confirms §7 of
the main audit.

### 1.1 The API cannot be enumerated, and `401` means nothing

`GET /api/this-route-cannot-possibly-exist` returns **`401`**, not `404`. The
auth guard runs before the router, so an unauthenticated `401` does not
distinguish "exists but protected" from "does not exist". Every route above had
to be re-probed with a token to establish which were real.

Minor, but it costs every future integrator the same hour.

---

## 2. Which endpoints are live and which are static — provable from the payload

The responses carry their own tell. Endpoints backed by the database return a
`lastUpdated` of the moment they were called. Endpoints returning hardcoded
arrays return the literal `2025-10-14T09:12:00Z` — a timestamp typed into the
PHP source.

| `lastUpdated` returned | Endpoints |
|---|---|
| `2026-08-25T11:01:xx` (live) | `/kpi-explorer`, `/programs`, `/bottlenecks`, `/stakeholders`, `/administration` |
| `2025-10-14T09:12:00Z` (hardcoded) | `/executive-overview`, `/branding`, `/reports` |

This is a reliable, zero-effort test the team can apply to any endpoint they
claim is finished.

Data volumes on the live modules are real but thin: 18 institutions, 14 KPIs,
2 obligations, 1 submission, 1 validation-queue item, 2 comparison rows,
1 option in most `/reports/filters` lists.

---

## 3. The ID vocabulary mismatch breaks two modules outright

The database identifies pillars by **integer**. The frontend contract
(`pillarIdSchema`) identifies them by **slug**, as a closed enum.

Observed:

```
GET /api/pillars/1                 -> 200
GET /api/pillars/2                 -> 200
GET /api/pillars/3                 -> 200
GET /api/pillars/clean-cooking     -> 404  "Unknown pillar: clean-cooking"
```

The frontend only ever requests the slug form — its routes are
`/pillars/generation-network` and so on. **Every Pillar Dashboard page therefore
404s.** That module is not partially working; it is entirely unreachable.

The same mismatch appears inside otherwise-working payloads. `/kpi-explorer`
returns:

```json
{ "id": "2", "name": "Aggregate Technical, Commercial and Collection Loss Rate", "pillar": "2" }
```

`"pillar": "2"` is not a member of the frontend's enum, so zod rejects the
response and the client raises a `ContractError`.

This is one decision — integer keys versus the slug vocabulary the contract
specifies — and fixing it at the API boundary repairs both modules. It does not
require changing the database keys, only mapping them on the way out.

---

## 4. Executive Overview: filters move the lists but not the figures

Verified by calling `/executive-overview` with and without `?pillar=clean-cooking`:

| | All pillars | `pillar=clean-cooking` | |
|---|---|---|---|
| People with electricity access | 137.3M | 137.3M | **unchanged** |
| Electricity access rate | 70.0% | 70.0% | **unchanged** |
| Available generation capacity | 5.4 GW | 5.4 GW | **unchanged** |
| Clean cooking access | 26.0% | 26.0% | **unchanged** |
| `nationalPerformance` rows | 6 | 0 | filtered |
| `ongoingProjects` | 2 | 0 | filtered |
| `accessDelivery` rows | 3 | 3 | unchanged |
| `exceptions` | 1 | 1 | unchanged |

Selecting the Clean Cooking pillar empties the lists while continuing to display
the **national** figure for people with electricity access and generation
capacity, beside a heading that says Clean Cooking. That is worse than not
filtering at all: it presents national totals as pillar figures.

`appliedPillar` is echoed back as `clean-cooking`, so the response asserts the
filter was applied.

### 4.1 `reportingPeriod` is ignored entirely

`/executive-overview?reportingPeriod=2020-Q1` returns a **byte-identical**
response to the unfiltered call. A monitoring platform that cannot show a prior
period is not a monitoring platform. Of the filters tested, this was the only
one ignored outright — `pillar`, `institution`, `search` and `severity` all
changed their respective payloads on `/kpi-explorer`, `/programs`,
`/bottlenecks` and `/state-disco/states`.

---

## 5. The KPI database is a transcription of the hardcoded values, not a derivation

This is the finding that most changes how much progress the live modules
represent.

Every KPI value in the database matches the corresponding hardcoded value in the
Executive Overview controller exactly:

| KPI | KPI Explorer (database) | Executive Overview (hardcoded) |
|---|---|---|
| ATC&C Loss Rate | 31.2% | 31.2% |
| Metering Rate | 57.4% | 57.4% |
| Market Remittance Rate | 76.4% | 76.4% |
| Renewable Energy Share | 27.4% | 27.4% |
| Tariff Shortfall | 22.9% | 22.9% |
| Available generation capacity | 5400 MW | 5.4 GW |
| Clean cooking access | 26% | 26.0% |
| People with electricity access | 137,300,000 | 137.3M |

Two sources agreeing is normally reassuring. Here it is the opposite, because of
what the KPI records do *not* contain. Fetching `/kpi-explorer/kpis/2` returns:

```
formula:            null
baseline:           null
target:             null
sourceInstitution:  null
history[0]:         { "period": "Q2 2025", "value": 32.6, "submissionId": null }
```

No formula, no baseline, no target, no source institution, and history entries
with **no submission lineage**. These values were not computed from anything.
They were entered to match the numbers already in the controller.

So the database is not yet an independent source of truth being read by one
module and ignored by another. It is a second copy of the same unsourced
figures. "KPI Explorer is database-backed" is true and does not mean the numbers
are derived.

Note also `reportingPeriod: "Q3 2025"` against a `lastUpdated` of 2026-08-13:
the published figures are roughly a year stale.

---

## 6. Auth and access control

- **Login returns no permissions or scopes.** The payload is
  `{accessToken, expiresAt, user:{id, name, email, role}}`. `role` is a display
  string (`"System Administrator"`). There is no permission set and no
  institution/geography scope, so the client cannot enforce anything and the
  server has nothing scoped to enforce against. This corroborates §5.6 of the
  main audit.
- **User enumeration on `/auth/identify`.** A registered address returns `200`;
  an unregistered one returns `404` with *"We could not find an active account
  for that email."* That is an unauthenticated oracle for which addresses hold
  accounts. Cheap to fix: return `200` in both cases and let the password step
  fail.
- **Authorization was not tested.** Only an administrator credential was
  available, so the main audit's claim that a provider account can read
  Administration data could neither be confirmed nor refuted here. **Testing
  this requires a non-admin account** — it is the single most valuable
  outstanding test, because it is a security boundary rather than a data-quality
  problem.
- **Transport hygiene is sound.** `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  and no `Access-Control-Allow-Origin` is emitted even for an arbitrary `Origin`
  — so browsers block cross-origin calls. That is why the Vite proxy is
  required, and it is the correct posture.
- `/api/public/overview` is correctly public and cacheable
  (`Cache-Control: public, max-age=60, stale-while-revalidate=300`) but ignores
  every query parameter and returns byte-identical content on repeat calls.

---

## 7. The unused asset: real NERC data and a working importer

Unchanged from the previous draft, and unaffected by the correction in §0.

`docs/Compiled NERC Data 2020 - 2026 (1).xlsx` is in this repository: twelve
sheets, one row per DisCo per month, ~9,600 rows spanning 2020–2026.

`m300-demo-backend/src/submissions/nerc-workbook-reshape.ts` already reads five
of them **under their exact real names, typo included** (`'Disco Energy
Recieved'`), normalises the inconsistent DisCo spellings (`PH` / `Port
Harcourt` / `portharcourt`), reports unrecognised names instead of dropping
them, and feeds the same validate → calculate → persist pipeline as a manual
upload. It is unit-tested against the real workbook shape.

The seven sheets it does not read map directly onto figures the PHP backend
hardcodes:

| Hardcoded figure | Source sheet(s) already in hand |
|---|---|
| `5.4 GW` available generation | Genco AVG Avail. Capacity |
| `13,600 MW` installed | Genco Installed Capacity |
| `76.4%` market remittance | Disco MO Invoice + MO Remittances; NBET Invoice + NBET Remittances |
| `22.9%` tariff shortfall | Disco Allowed Tariffs *(partial — needs the approved cost-reflective tariff series)* |

`renewable-share` and `private-capital` are not in this workbook and need
another source.

Six years of monthly readings is also exactly the **history** the dashboard
currently lacks — the frontend now defaults `history` and both sparklines to
empty because the PHP backend sends none, which is why trend views and evolution
charts render nothing.

---

## 7A. Data Submission — the module is a stub that reports success

This is the most serious finding in the addendum, because Data Submission is the
module every other number is supposed to come from. It does not ingest data. It
records that a file arrived and then reports a fixed result.

### 7A.1 The uploaded file is never opened

`DataSubmissionsController::upload` reads exactly one thing from the upload:
`$_FILES['file']['name']`. The bytes are never read. There is no spreadsheet or
CSV parser anywhere in the backend — a search across all of `src/` for
`PhpSpreadsheet`, `fgetcsv`, `str_getcsv`, `ZipArchive` or `simplexml` returns
nothing, and no such library is in `composer.json`.

The extracted KPI value is a literal in the source, sitting directly beneath a
comment describing the work that was not done:

```php
// Template parsing + business-rule validation + KPI formula
// calculation run SYNCHRONOUSLY here in a real backend, so the
// submission is already validated by the time this responds.
$extracted = array(
    array('kpiId' => 'M300-P3-004', 'kpiName' => 'Metering Rate',
          'reportingPeriod' => $ob['reportingPeriod'], 'value' => 57.4),
);
```

Every other outcome field is a constant too:

| Field | Value | Depends on the file? |
|---|---|---|
| `automatedCheck` | `pass` | no |
| `issueCount` | `0` | no |
| `issues` | `[]` | no |
| `validationSummary` | "Automated checks passed with 0 issues." | no |
| `extractedValues[0].value` | `57.4` | no |
| `reviewer` | "Grace Etim" | no — assigned before any review |
| `submittedBy` | `usr-006` | no — ignores the authenticated user |

Any file of any type will produce "Automated checks passed with 0 issues" and a
Metering Rate of 57.4%. A photograph would pass.

### 7A.2 There is already live proof of this

The validation queue contains one real submission, `SUB-2026-0001`, uploaded
2026-08-25T07:23:38Z, with `fileName: "Compiled NERC Data 2020 - 2026.xlsx"` —
the genuine NERC workbook, whose `Disco Metering` sheet holds 721 rows across
eleven DisCos and six years.

Its extracted value is **57.4** — the literal from the controller. Real data was
uploaded and the response was the hardcoded number.

Its `kpiId` is `M300-P3-004`, which is `m300-demo-backend`'s identifier scheme.
The deployed backend's own KPI table uses integer ids, where Metering Rate is
`8`. So the extracted value does not reference any KPI that exists in this
system.

### 7A.3 Approval publishes nothing

`decide()` validates the decision and comment, updates the submission's status
in a JSON/file store, then:

```php
if (in_array($decision, array('approved', 'provisional'), true)) {
    $published = $s['extractedValues'];
}
```

`$published` is copied into the HTTP response and the message reads "Published
to Metering Rate." **No database write occurs.** Nothing reaches
`kpi_definition`, `kpi_values` or `metric_observation`. The `submission` and
`validation_issue` tables are never touched by any code path — approving a
submission changes a JSON file and a sentence on screen.

The decision actor is hardcoded `usr-014` regardless of who is signed in, so the
review trail records the wrong person.

### 7A.4 The templates are not spreadsheets

`GET /data-submissions/templates/metering-performance-v3.xlsx` returns **50
bytes** with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
and `Content-Disposition: filename="metering-performance-v3.xlsx"`.

The 50 bytes are a CSV header line:

```
metered_customers,total_customers,reporting_notes
```

A real `.xlsx` is a ZIP archive beginning `50 4b 03 04`; this begins `6d 65 74 65`
("mete"). Excel will refuse it or warn. `X-Content-Type-Options: nosniff` is set,
so the browser will not silently correct the type either.

The header is also insufficient on its own terms: three columns, with no DisCo,
no state and no reporting period, so a returned file could not identify which
utility or which quarter its rows describe. Compare `m300-demo-backend`, which
generates a real workbook from `dataset_fields` at download time so the template
cannot drift from what the parser accepts.

### 7A.5 Compliance dates are fabricated

Obligation due labels do not derive from their own due dates. Observed on
2026-08-25:

| Obligation | `dueDate` | Label returned | Reality |
|---|---|---|---|
| OBL-2026-0021 | 2026-10-15 | "Due in 5 days" | 51 days away |
| OBL-2026-0022 | 2026-10-05 | "6 days overdue" | 41 days in the future |

OBL-2026-0022 also appears in `GET /data-submissions/overdue`. The compliance
view reports an obligation as breached six weeks before it is due. Any
escalation driven off this list would be acting on invented urgency.

### 7A.6 What this means

The main audit called this module "simulation, not an ingestion pipeline". The
live evidence is stronger than that: it is a stub that **reports success
unconditionally**. That is more dangerous than an empty module, because a
custodian who uploads a genuine return receives confirmation that their data was
validated and published when neither happened, and no one is alerted.

`GET /data-submissions/datasets`, which the frontend calls, returns `404`.

**Recommendation.** Do not extend this module. `m300-demo-backend` already
implements the whole path for real — schema-generated templates, CSV/XLSX
parsing, generic field validation, dataset-specific business rules, server-side
calculation, one canonical submission row with issues and status history, a
review decision, publication into KPI history, obligation linkage and an audit
event — and it already reads this exact NERC workbook (§7). The work is to adopt
that pipeline, not to reimplement it in PHP.

Until it is replaced, the upload and review actions should be disabled in the
UI. A submission path that always says "passed" is worse than one that is
visibly unavailable.

## 8. What to put to the backend team

Additions to the main audit's §10 list:

15. Provide the schema and seed that match the deployed database, under version
    control. `nigeria_m300_mysql.sql` seeds a health/education/infrastructure
    system and does not reproduce production.
16. `/api/pillars/:pillar` accepts integer ids; the frontend contract uses the
    six pillar slugs, so every Pillar Dashboard request 404s. Which side maps?
17. Executive Overview headline cards do not respond to `pillar`, and
    `reportingPeriod` is ignored on every section. When will headline figures be
    derived per-slice?
18. KPI records carry no `formula`, `baseline`, `target`, `sourceInstitution`,
    and history rows carry `submissionId: null`. What produced these values, and
    what is the plan for lineage?
19. Why does `/auth/identify` distinguish registered from unregistered emails?
20. Provide a non-administrator test account so server-side authorization can be
    verified.
21. `POST /data-submissions/obligations/:id/upload` never reads the uploaded
    file and returns a hardcoded `57.4` Metering Rate with `issueCount: 0`
    regardless of content. What is the plan and date for real parsing,
    validation and calculation?
22. Approving a submission writes nothing to `kpi_values` or
    `metric_observation`, and the `submission` / `validation_issue` tables are
    unused. Where is an approved figure supposed to be persisted?
23. Templates are served as 50-byte CSV headers with `.xlsx` filenames and XLSX
    MIME types, and carry no DisCo, state or period column. When will templates
    be generated from the dataset field definitions?
24. Obligation due labels do not match their due dates — an obligation due
    2026-10-05 was reported "6 days overdue" on 2026-08-25 and listed under
    `/overdue`. What computes these?

## 9. Suggested order of work

1. **Map pillar ids at the API boundary.** One change; unbreaks Pillar Dashboard
   entirely and removes the KPI Explorer contract error. Highest value per unit
   of effort on this list.
2. **Get a non-admin account and test authorization.** It is a security boundary
   and it is currently unverified.
3. **Make Executive Overview read the KPI tables** rather than its literals, and
   apply `reportingPeriod`. The KPI rows already exist; the wiring does not.
4. **Give KPI values lineage** — formula, baseline, target, source, and a real
   `submissionId` on history.
5. **Extend the NERC importer from five sheets to twelve**, so those values are
   derived from NERC's own data with six years of history behind them, rather
   than transcribed.

Steps 1–2 are days. Steps 3–5 are the actual project.
