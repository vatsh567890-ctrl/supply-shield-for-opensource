# SupplyShield

Pre-merge security scanner for open-source pull requests and dependency updates.

SupplyShield inspects pull requests and dependency version bumps before they are merged into your repository. It analyzes both the PR code diff and the registry artifacts (npm and PyPI) for newly introduced dependencies, producing an explainable 0–100 risk score, plain-English summary, and automated GitHub Check Run and PR comments.

## Architecture

- **Frontend (`frontend/`)**: Next.js App Router (TypeScript, Tailwind CSS v4, TanStack Query, Zod).
- **Backend API (`backend/`)**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2.
- **Worker (`backend/`)**: Background worker executing analysis jobs via `arq` and Redis.
- **Database & Queue**: PostgreSQL and Redis.

## Quickstart

### Prerequisites
- Python 3.12+ (managed with `uv`)
- Node.js 20+ and `pnpm`
- Docker and Docker Compose

### Local Development
```bash
# Start Postgres and Redis
docker compose up -d postgres redis

# Run backend API
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Run worker
cd backend
uv run python -m app.worker.main

# Run frontend
cd frontend
pnpm install
pnpm dev
```

### Running Tests
```bash
make lint
make test
```
