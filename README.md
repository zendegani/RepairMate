# RepairMate

Hackathon demo monorepo for an agentic appliance repair assistant.

## Apps

- `apps/frontend`: Next.js, TypeScript, Tailwind, React Flow
- `apps/backend`: FastAPI, Python, Pydantic

## Run Locally

Backend:

```bash
cd apps/backend
uv run uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd apps/frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend calls `NEXT_PUBLIC_API_URL` when set, otherwise `http://localhost:8000`.

## Demo Path

The diagnosis form is prefilled for a washing machine that does not drain. Submitting it calls `POST /api/diagnose` and renders a static repair recommendation, likely causes, repair plan, sustainability impact, safety warnings, agent timeline, and a React Flow execution graph.
