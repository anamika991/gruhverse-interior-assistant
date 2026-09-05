# GruhVerse — AI Interior Design Assistant (prototype)

A focused Next.js prototype for GruhVerse: a customer briefs a room, receives an AI-assisted interior recommendation, can modify it in natural language, and add materials to a project.

This is a **product prototype**, not a production application. Design generation is mocked behind a REST-shaped service layer so a Java / Spring Boot API can replace it later without rewriting screens.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test        # unit tests (validation + instruction parser)
npm run build   # production build
```

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` when a real backend is available.

## What you can do

1. **Brief** — room type, dimensions, budget, style, colour, optional photo, **Generate design**.
2. **Result** — scene image, palette, furniture, materials, approximate budget.
3. **Modify** — e.g. *“Make it more minimal and reduce the budget to ₹1.5 lakh.”* The UI streams progress, then swaps in an updated scheme.
4. **Materials** — plywood, MDF, laminate/Sunmica, hardware, sofa material. Search, filter, **Add to project**.

Loading, empty, success and error states are handled on generate, result fetch and the catalogue.

## Architecture

```
src/
  app/                 # App Router pages + mock REST handlers
    api/v1/            # Drop-in shape for a future Spring Boot /api/v1
  components/          # Presentation only
  lib/api/             # Typed client, design + material services
  lib/ai/              # Mock “model”: compose + parse modifications
  lib/validation/      # Form rules (also used conceptually by the API)
  store/               # Client session (current design, history, basket)
  data/                # In-memory catalogue + design map (server)
```

**Technical decisions**

- **Next.js App Router + TypeScript** — one deployable frontend, API routes only as a mock backend.
- **Service layer, not fetch-in-components** — `design-service` / `material-service` talk HTTP. Pages never import the design engine.
- **Envelope JSON** — `{ data, message, timestamp }` on success; `{ error: { code, message, details } }` on failure. Easy to mirror with Spring `ResponseEntity`.
- **Zustand + persist** — session history and project basket survive refresh without a fake auth layer (auth was out of scope).
- **SSE-style streaming** — `POST /api/v1/designs/stream` emits progress then a complete design. The client uses `fetch` + `ReadableStream` (POST; `EventSource` is GET-only).
- **Instruction parser** — the mock “AI” actually reads style keywords and Indian budget phrasing (`₹1.5 lakh`) so the modification flow is demonstrable, not a random shuffle.

## What is mocked vs a real API

| Capability | This prototype | Production Spring Boot |
| --- | --- | --- |
| `POST /api/v1/designs` | Composes JSON from rules + Unsplash scenes | Persist brief, call model / pipeline |
| `POST /api/v1/designs/stream` | Timed progress events | Token/status stream from the worker |
| `POST /api/v1/designs/{id}/modifications` | Parses instruction, recomposes | Same contract; server owns history |
| `GET /api/v1/materials` | Static catalogue in `src/data/materials.ts` | SKU service, live price & stock |
| Room photo | Filename stored; preview is local | Object storage + vision context |
| Design images | Stock interiors keyed by room × style | Generated or retrieved assets |
| Server design map | In-memory (lost on restart) | Database |

Switching backends: set `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:8080/api/v1` (or the deployed gateway) and keep the same paths and envelopes. CORS and auth headers would be added on the Spring side and in `apiFetch`.

## If this moved to production

- Real generation (and possibly a human designer-in-the-loop) with persisted jobs, not in-memory maps.
- Auth, project ownership, and a proper cart with quantities tied to take-off from drawings.
- Image upload to object storage; use the photo as model context.
- Accessibility pass, analytics, and contract tests against OpenAPI generated from Spring.
- Indian GST, vendor SKUs, and availability from the materials network — not indicative list prices.

## Live deployment

[https://gruhverse-interior-assistant.vercel.app](https://gruhverse-interior-assistant.vercel.app)

The mock APIs run as Next.js route handlers on the same origin.
