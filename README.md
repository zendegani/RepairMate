# RepairMate

Hackathon demo monorepo for an agentic appliance repair assistant.

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

The diagnosis form is prefilled for a washing machine that does not drain. Submitting it calls `POST /api/diagnose` and renders a repair recommendation, likely causes, repair plan, sustainability impact, safety warnings, agent timeline, and a React Flow execution graph. The response is produced by `app/services/pipeline.py`, currently a static payload that the agent pipeline will grow into behind the same response shape.
