# SupplyShield

SupplyShield is a pre-merge security scanner for open-source repositories and pull requests that analyzes dependency version bumps and proposed code changes before they reach production. It inspects both the PR diff and registry artifacts from npm and PyPI for supply-chain attack vectors—such as install script execution, encoded payloads, typosquatting, and network calls—computing an explainable 0–100 risk score with deterministic security floors, plain-English summaries, and automated GitHub Check Runs. For architecture specifications, data schemas, and threat vectors, see the [Design Document](docs/design.md).

## Architecture

- **Frontend (`frontend/`)**: Next.js App Router (TypeScript, Tailwind CSS v4, TanStack Query, Zod).
- **Backend API (`backend/`)**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2.
- **Worker (`backend/`)**: Background worker executing analysis jobs via `arq` and Redis.
- **Database & Queue**: PostgreSQL and Redis.
- **Design Specifications**: Full architectural breakdown available in [`docs/design.md`](docs/design.md).

## Status

Implementation status across the codebase is tracked automatically in [`docs/status.md`](docs/status.md) (generated via `python scripts/generate_status.py` and validated in CI).

### Module Implementation Summary

- **Total Backend Modules**: 137
- **Complete Modules**: 80 (contain 0 `NotImplementedError` occurrences)
- **Stub / In-Progress Modules**: 57 (contain `NotImplementedError` stubs)
- **Total `NotImplementedError` Occurrences**: 75

### Subsystem Status Overview

| Subsystem | Status | Details |
| :--- | :--- | :--- |
| **Frontend UI & Dashboard** | Functional (Mock Fixtures) | Complete Next.js 15 UI with procedural 3D shield, command palette, and overview pages (`NEXT_PUBLIC_USE_MOCKS=true`). |
| **Help Chatbot Widget** | In Progress | Frontend component integrated with backend `/chat` router; fallback FAQ classification active. |
| **Authentication & Sessions** | In Progress | Fail-closed mock dev authentication (`ALLOW_MOCK_AUTH`); production session stores scheduled for Phase 2. |
| **Configuration & Security** | Complete | Startup validation refuses insecure secrets, fail-closed mock auth in production, and standard security headers. |
| **Machine Learning Pipeline** | Prototype (Unvalidated) | Calibrated LightGBM model in `backend/app/ml/`; default `ML_MODE=off`. Details in [`docs/ml-status.md`](docs/ml-status.md). |
| **Analysis Engine & Extraction** | Stub (In Progress) | AST analysis, archive safe extraction, and scoring algorithms are Phase 0 stubs (`NotImplementedError`). |
| **GitHub App & Webhooks** | Stub (In Progress) | Webhook HMAC verification and check-run reporting are Phase 0 stubs (`NotImplementedError`). |
| **Worker Queue & Pipelines** | Stub (In Progress) | Job execution queue and background scheduling are Phase 0 stubs (`NotImplementedError`). |

For the complete line-by-line module inventory, see [`docs/status.md`](docs/status.md).

## License

This project is licensed under the [MIT License](LICENSE).

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
