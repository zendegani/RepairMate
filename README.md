# FixWise

AI that helps you repair, not replace.

Hackathon demo monorepo for an agentic appliance repair assistant. (The repo and
package slug remain `repairmate`; `FixWise` is the product name.)

## Apps

- `apps/frontend`: Next.js, TypeScript, Tailwind, React Flow
- `apps/backend`: FastAPI, Python, Pydantic

## Layout

```
apps/
  frontend/            # Next.js App Router
    app/               # routes, layout, global styles
    components/        # UI components (RepairFlow, ...)
    lib/               # api client + shared types
  backend/
    app/
      main.py          # FastAPI app + middleware wiring
      schemas.py       # Pydantic request/response models
      routers/         # HTTP routes (diagnose)
      services/        # diagnosis pipeline + agent modules
    tests/             # pytest API tests
```

The JS side is an npm workspace, so a single `npm install` at the repo root installs
the frontend and produces one root `package-lock.json`.

## Run Locally

Install frontend dependencies (from the repo root):

```bash
npm install
```

Backend (from the repo root):

```bash
npm run dev:backend
```

Frontend (from the repo root):

```bash
npm run dev:frontend
```

Open `http://localhost:3000`.

The frontend calls `NEXT_PUBLIC_API_URL` when set, otherwise `http://localhost:8000`
(see `apps/frontend/.env.example`).

## Test

```bash
npm run test:backend
```

## Demo Path

The diagnosis form is prefilled for a washing machine that does not drain. Submitting it calls `POST /api/diagnose`, which runs the deterministic agent pipeline in `app/services/pipeline.py` (intake → retrieval → diagnosis → planner → sustainability → safety → graph_builder) over the mock data in `app/data/*.json`. The UI renders the recommendation with a confidence gauge, retrieved evidence, ranked causes, repair plan, repair-vs-replace impact, safety warnings, the agent log, and a React Flow reasoning graph.
