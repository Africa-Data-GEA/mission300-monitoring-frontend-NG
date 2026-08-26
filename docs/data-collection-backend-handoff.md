# Data collection backend handoff

This note records the contract gaps found while connecting the frontend to
`https://nigeria.geappindia.org`. The backend was inspected and queried only;
no backend source code or data was changed.

## Current endpoint status

| Endpoint | Result | Frontend position |
| --- | --- | --- |
| `GET /api/data-submissions/filters` | 200 | Connected |
| `GET /api/data-submissions/obligations` | 200 | Connected with missing-value labels |
| `GET /api/data-submissions/obligations/{id}/entry` | 200 | Connected with structural normalization |
| `GET /api/data-submissions/obligations/{id}/upload` | 200 | Connected with structural normalization |
| `GET /api/data-submissions/submissions` | 200 | Connected; currently empty |
| `GET /api/data-submissions/validation` | 200 | Connected; currently empty |
| `GET /api/data-submissions/overdue` | 200 | Connected with missing-value labels |
| `GET /api/data-submissions/gaps` | 200 | Connected; unsupported fields/actions are hidden |
| `GET /api/data-submissions/datasets` | 404 | Blocked pending backend implementation |

## Items for the backend owner

1. Persist obligations, submissions, validation history, and decisions in the
   production database. The current implementation uses hard-coded arrays and
   a temporary JSON-file store.
2. Implement `GET /api/data-submissions/datasets` using the agreed dataset
   contract.
3. Return `focalPerson` and `datasetId` on every obligation.
4. Return `obligationId` on entry and upload definitions. Entry sections also
   need `id` and `description`; fields must return `helpText` as a string and
   `options` as an array, even when empty.
5. Return `dueDate` (ISO datetime) and `dueDateLabel` on overdue rows.
6. Return `id`, `institution`, `reportingPeriod`, `status`, and
   `availableActions` on data-gap rows.
7. Keep template `version` consistently typed (the frontend contract uses a
   string) and return a real `.xlsx` file. The current response is CSV text with
   an XLSX content type.
8. For drafts, do not return `submittedAtLabel: null` if the contract requires
   a display string. Submission detail history entries need `id`, `status`, and
   `occurredAtLabel`; `reviewer` must either be nullable by contract or always
   be a string.
   The deployed validation detail also uses automated-check codes such as
   `pass`; these must be documented separately from submission workflow codes.
9. Return the signed-in user's institution in the login response or provide an
   authenticated `/auth/me` endpoint. Without it, the frontend cannot safely
   scope an institution user's dashboard.
10. Confirm role/permission enforcement for entry, upload, review, decisions,
    downloads, and institution-level record access before production use.

## Release recommendation

Keep the data-collection workflow in pilot/read-only use until database
persistence, real workbook generation/parsing, institution scoping,
authorization, audit history, and the missing contracts above are completed.
Do not use the current temporary store for official submissions.
