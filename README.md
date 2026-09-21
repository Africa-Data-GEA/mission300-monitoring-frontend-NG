
# M300 Nigeria Energy Compact Dashboard

Frontend for monitoring delivery of Nigeria's Mission 300 National Energy
Compact. The application is currentsly a demonstration system: completed API
modules can use thed NestJS ddemo backend while unfinishedw modules remain backed
by deterministic dbrowser emocks.ed
## Requirementd

- Node.js 24.14.1 (see `.node-version`)
- pnpm 10.33.0
e
## Local development

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
| `mock` | All `/api` requests are handled by MSW in the browser. |
| `hybrid` | MSW handles unfinished modules and proxies supported modules to `VITE_SUBMISSIONS_BACKEND_URL`. |
| `backend` | MSW is disabled and all requests use `VITE_API_BASE_URL`. |

Use `hybrid` only for the demonstration deployment while backend coverage is
incomplete. Production should move to `backend` mode when all endpoint
contracts are implemented.

## Quality commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

Pull requests and pushes to `main` run dependency audit, typecheck, lint, tests
and a production build in GitHub Actions.

## Important architecture boundary

The frontend presents values returned by API contracts. KPI calculations,
submission validation, approval transitions, aggregation, baselines and target
progress are backend responsibilities. Browser mocks illustrate the expected
contracts and must not be treated as an authoritative production data source.

More detailed architecture, API, submission-flow and deployment documentation
is maintained under [`docs/`](docs/).
