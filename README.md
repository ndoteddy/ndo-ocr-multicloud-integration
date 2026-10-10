# ndo-ocr-multicloud-integration

An OCR pipeline wired across three clouds: a user uploads an image in an
Angular app, an Express API hands it to Kafka, a .NET consumer picks it up
and calls an AWS Lambda (behind API Gateway) that runs Rekognition and
archives the image to S3, and the result flows back through MongoDB Atlas to
the UI.

Full data flow, the auth model, and why this is one repo instead of four:
see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Layout

```
apps/
  ui/        Angular — upload UI, polls for results           (Node)
  backend/   Express API — Kafka producer + Mongo read path    (Node)
  consumer/  .NET console app — Kafka consumer + Mongo writer   (.NET, net10.0)
  lambda/    AWS Lambda — Rekognition OCR + S3 archive          (Python)
docs/
  ARCHITECTURE.md
```

Each app has its own README with setup/test/env-var details:
[ui](apps/ui/README.md) · [backend](apps/backend/README.md) ·
[consumer](apps/consumer/README.md) · [lambda](apps/lambda/README.md).

## Quickstart

```bash
# Backend + UI (Node workspaces, from repo root)
npm install
cp apps/backend/.env.example apps/backend/.env   # fill in real values
npm run test:backend
npm run test:ui -- --watch=false --browsers=ChromeHeadless

# Consumer (.NET, from apps/consumer)
dotnet restore && dotnet build && dotnet test

# Lambda (Python, from apps/lambda)
pip install -r requirements-dev.txt && pytest
```

## What changed in this refactor

- **Structure**: 4 standalone folders → one `apps/*` monorepo, so a change
  that spans the pipeline is one PR instead of four.
- **Auth**: every inter-service hop (UI→backend, backend→Kafka,
  consumer→API Gateway, both→MongoDB) was either unauthenticated or secured
  with a secret hardcoded as a placeholder string in source. All of that is
  now environment-variable-driven — see `.env.example` files and each app's
  README — and the backend now requires an `x-api-key` header, checked with
  a timing-safe comparison, on every `/analysis/*` route.
- **Dependencies**: Express/MongoDB driver/Angular/.NET target framework/
  Confluent.Kafka/MongoDB.Driver were all several majors behind (Angular 15,
  .NET Core 3.1 — EOL since Dec 2022); all bumped to current stable/LTS and
  verified to install, build, and pass tests where a toolchain was available
  locally (see caveats below).
- **Tests**: none of the 4 projects had any. Added Jest+Supertest (backend),
  Jasmine/Karma (UI, including tests that pin down a real bug — see next
  point), xUnit+Moq (consumer), and pytest+moto (Lambda).
- **Bug fixes**: the UI's result-polling loop used a `setInterval` that was
  never cleared — it ran forever after a successful upload and stacked a new
  one on every subsequent upload, and it never actually checked whether the
  OCR result had arrived. Rewritten as a bounded RxJS poll that stops once a
  result shows up and unsubscribes on destroy.
- **Committed build artifacts**: `apps/consumer`'s `bin/`, `obj/`, and `.vs/`
  were checked into git; removed and gitignored.

## Verification caveats

This was done in an environment with Node/npm but no .NET SDK and no Python
interpreter installed:

- **Backend & UI**: actually installed and run. 11/11 backend Jest tests and
  12/12 UI Karma tests pass; both build cleanly (`npm run lint`, `ng build`).
- **Consumer & Lambda**: written carefully and reviewed by hand, but
  `dotnet build`/`dotnet test` and `pytest` have **not** been run. Do that
  before deploying either.
