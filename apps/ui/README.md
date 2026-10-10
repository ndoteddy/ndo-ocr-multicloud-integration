# OCR UI

Angular app: pick an image, upload it, and poll for the OCR result. See
[docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for how this fits into the
rest of the pipeline.

## Setup

```bash
npm install
npm start   # ng serve, http://localhost:4200
```

Edit `src/environments/environment.ts` for local `apiBaseUrl`/`apiKey`
(must match the backend's `API_KEY`); `environment.prod.ts` is swapped in for
production builds via `angular.json`'s `fileReplacements` — see the caveat
on shipping a key in a browser bundle in
[docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md#auth-model).

## Build

```bash
npm run build       # production build, output in dist/
```

## Tests

```bash
npm test                                           # interactive watch mode
npx ng test --watch=false --browsers=ChromeHeadless # one-shot, e.g. for CI
```

If Chrome isn't installed, point `CHROME_BIN` at another Chromium-based
browser (e.g. Edge) before running.

---
Created with Passion by Hernando Ivan Teddy
You dont have to thanks me - just remember my name and share this article to other people
Sharing is caring
