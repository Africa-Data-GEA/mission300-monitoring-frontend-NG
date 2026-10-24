
# Mission 300 Compact Monitoring Platform

Frontend for monitoring delivery of Nigeria's Mission 300 National Energy
Compact. The active API is the NestJS service in `mission300-monitoring-backend-NG`.
Local demonstrations can run with in-process mock handlers and data.
## Requirements
- Node.js 24.14.1 (see `.node-version`)
- pnpm 10.33.0
## Local developmentel

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

The default development mode is `mock`, so the frontend can run without a
backend. Environment variables are validated at startup.

## Data modes

| Mode | Behaviour |
| --- | --- |
| `mock` | The API client dispatches requests to in-process mock handlers in the browser. |
| `hybrid` | The in-process router forwards supported paths to `VITE_SUBMISSIONS_BACKEND_URL` and serves the rest from mocks. |
| `backend` | All API requests use `VITE_API_BASE_URL`. |

Use `hybrid` only for the demonstration deployment while backend coverage is
incomplete. Production should use `backend` mode when all endpoint contracts
are implemented. Node tests use MSW to intercept fetch requests; browser mock
and hybrid modes do not register a service worker.

## Quality commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

Pull requests and pushes to `main` run dependency audit, typecheck, lint, tests
and a mock-mode production build in GitHub Actions. A full browser-to-backend
acceptance suite is still needed.

## Important architecture boundary

The frontend presents values returned by API contracts. KPI calculations,
submission validation, approval transitions, aggregation, baselines and target
progress are backend responsibilities. Browser mocks illustrate the expected
contracts and must not be treated as an authoritative production data source.

Older material under [`docs/`](docs/) includes contracts written for the
previous PHP backend. Confirm routes and shapes against the active NestJS
controllers and frontend schemas before implementing against those documents.
