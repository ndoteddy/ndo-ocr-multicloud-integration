# OCR Backend

Express API. Publishes new OCR jobs onto Kafka and serves back whatever
analysis result MongoDB already has. See
[docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for how this fits into the
rest of the pipeline.

## Setup

```bash
cp .env.example .env   # fill in real values
npm install
npm run dev             # node --watch src/server.js
```

## Endpoints

| Method | Path                        | Auth           | Notes                              |
| ------ | --------------------------- | -------------- | ----------------------------------- |
| GET    | `/hello_world`               | none           | Liveness check                     |
| GET    | `/analysis/image?name=`      | `x-api-key`     | Looks up a stored result by image name |
| POST   | `/analysis/image`            | `x-api-key`     | `{ imgName, imgBase64 }`; publishes to Kafka |

`x-api-key` must equal the `API_KEY` env var; the server compares it with a
timing-safe comparison. See `.env.example` for every variable.

## Tests

```bash
npm test        # Jest + Supertest, Mongo/Kafka calls mocked
npm run lint
```
