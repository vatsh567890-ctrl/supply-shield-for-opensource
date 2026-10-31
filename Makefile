.PHONY: dev test lint migrate seed test-backend test-frontend lint-backend lint-frontend

dev:
	docker compose up -d postgres redis
	@echo "Services started. Run backend with 'cd backend && uv run uvicorn app.main:app --reload' and frontend with 'cd frontend && pnpm dev'"

lint: lint-backend lint-frontend

lint-backend:
	cd backend && uv run ruff check .
	cd backend && uv run ruff format --check .
	cd backend && uv run mypy app/security app/analyzer

lint-frontend:
	cd frontend && pnpm lint
	cd frontend && pnpm tsc --noEmit

test: test-backend test-frontend

test-backend:
	cd backend && uv run pytest tests/unit tests/security tests/integration -v

test-frontend:
	cd frontend && pnpm test

migrate:
	cd backend && uv run alembic upgrade head

seed:
	@echo "Seeding initial development fixtures"
