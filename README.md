# SupplyShield

Pre-merge security scanner for open-source pull requests and dependency updates.

SupplyShield inspects pull requests and dependency version bumps before they are merged into your repository. It analyzes both the PR code diff and the registry artifacts (npm and PyPI) for newly introduced dependencies, producing an explainable 0–100 risk score, plain-English summary, and automated GitHub Check Run and PR comments.

## Architecture

- **Frontend (`frontend/`)**: Next.js App Router (TypeScript, Tailwind CSS v4, TanStack Query, Zod).
- **Backend API (`backend/`)**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2.
- **Worker (`backend/`)**: Background worker executing analysis jobs via `arq` and Redis.
- **Database & Queue**: PostgreSQL and Redis.

## Status

| Area | Status | Description |
| :--- | :--- | :--- |
| **Frontend UI & Visuals** | Mock data only | Next.js 15 dashboard, 3D shield, command palette, and reports running against local mock fixtures (`NEXT_PUBLIC_USE_MOCKS=true`). |
| **Help Chatbot Widget** | In progress | UI and backend router with FAQ fallback; session token validation integrated. |
| **Authentication & Sessions** | In progress | Fail-closed mock authentication (`ALLOW_MOCK_AUTH`); real database sessions planned for Phase 2. |
| **Detection Analyzer Engine** | Not started | Core detection rules, AST visitor, and manifest parsers are Phase 0 stubs (`NotImplementedError`). |
| **GitHub Webhook Ingestion** | Not started | Webhook endpoint and HMAC signature verification are Phase 0 stubs (`NotImplementedError`). |
| **GitHub App Integration** | Not started | Check runs, PR comment publishing, and installation tokens are Phase 0 stubs (`NotImplementedError`). |
| **Worker Pipeline & Jobs** | Not started | Background extraction and execution queues are Phase 0 stubs (`NotImplementedError`). |
| **Machine Learning Risk Model**| In progress (Unvalidated) | Prototype trained on synthetic data; default `ML_MODE=off`. Details in [`docs/ml-status.md`](docs/ml-status.md). |

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

## Security

SupplyShield follows strict zero-trust engineering standards documented in our [Threat Model](docs/threat-model.md) and [Security Rules](.agent/rules/10-security.md).

- **No Secrets in Repository**: The repository must not contain secrets, live tokens, or private keys. Environment variables must be loaded from local, git-ignored `.env` files matching the template in `.env.example`.
- **Reporting Vulnerabilities**: If you discover a security vulnerability, please consult our [Threat Model](docs/threat-model.md) and report it responsibly.
