# Architecture

An OCR pipeline that threads a single image through three clouds: AWS
(Rekognition + S3 + Lambda + API Gateway), Confluent Kafka, and MongoDB
Atlas.

```
┌──────────┐  POST /analysis/image   ┌──────────┐   Kafka produce    ┌───────────┐
│  UI       │ ───────────────────▶   │ Backend  │ ──────────────────▶│  Kafka    │
│ (Angular) │  (x-api-key)           │(Express) │                    │  topic    │
└──────────┘                         └──────────┘                    └─────┬─────┘
     ▲                                     ▲                               │ consume
     │ GET /analysis/image                 │ findOne()                     ▼
     │ (polls every 5s)                    │                        ┌───────────┐
     │                               ┌──────────┐                   │ Consumer  │
     └───────────────────────────────│ MongoDB  │◀── SaveAsync() ───│ (.NET)    │
                                      │  Atlas   │                   └─────┬─────┘
                                      └──────────┘                         │ x-api-key
                                                                            ▼
                                                                     ┌─────────────┐
                                                                     │ API Gateway │
                                                                     │  + Lambda   │
                                                                     │(Rekognition,│
                                                                     │     S3)     │
                                                                     └─────────────┘
```

## Flow

1. **UI** (`apps/ui`) reads a file, base64-encodes it client-side, and
   `POST`s `{ imgName, imgBase64 }` to the backend.
2. **Backend** (`apps/backend`) is a thin Express API. It re-publishes the
   payload onto a Kafka topic (via a Kafka REST proxy) and, separately,
   serves back whatever analysis MongoDB already has for a given image name.
   It never talks to AWS or does the OCR itself.
3. **Consumer** (`apps/consumer`) is a long-running .NET console app that
   consumes from that Kafka topic, calls the Lambda-backed API Gateway
   endpoint to run OCR, and writes the result into MongoDB.
4. **Lambda** (`apps/lambda`) sits behind API Gateway: it decodes the image,
   archives it to S3, runs Rekognition `detect_text`, and returns the
   detections back up the chain to the consumer.
5. The **UI polls** the backend's `GET /analysis/image?name=...` every 5s
   until the consumer has written a result, then renders it.

## Why 4 "projects" became one repo

Each piece is a different runtime (Node, .NET, Python Lambda, Angular), but
none of them are independently useful — they're stages of one pipeline. They
now live under `apps/*` in a single repo so a change that spans the pipeline
(e.g. the auth rework below) is one PR instead of four, and so there's one
root README instead of four partial ones.

## Auth model

Originally none of the inter-service calls were authenticated, and every
secret (Mongo URI, Kafka endpoint + token, Rekognition API key) was a
placeholder baked directly into source. That's been reworked:

| Hop                          | Mechanism                                                                 |
| ----------------------------- | -------------------------------------------------------------------------- |
| UI → Backend                  | `x-api-key` header (`ApiKeyInterceptor` in the UI, `apiKeyAuth` middleware in the backend), timing-safe compare server-side |
| Backend → Kafka REST proxy    | Bearer token from `KAFKA_PRODUCER_AUTH` (env var, not committed)          |
| Consumer → API Gateway/Lambda | `x-api-key` header, validated by an API Gateway usage plan                |
| Backend/Consumer → MongoDB    | Connection string from env var, never committed                           |

See each app's README/`.env.example` for the exact variable names.

**Caveat on the UI → Backend key**: a key shipped in a browser bundle is
visible to anyone who opens dev tools — it stops casual/automated hits on the
API, not a motivated attacker. If this app ever handles real user data, that
hop should move to per-user auth (e.g. a login + short-lived JWT) or a
backend-for-frontend that holds the real key server-side.

## Local development

Node and npm are required for `apps/backend` and `apps/ui`. `apps/consumer`
needs the .NET SDK (net10.0); `apps/lambda` needs Python 3.12+. See each
app's README for exact commands; the root `package.json` only wires up the
two Node projects (`npm test`, `npm run lint` from the repo root run both).
