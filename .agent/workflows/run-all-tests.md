# Workflow: Run All Tests

This workflow executes the full verification suite across backend and frontend. It must stop on the first failure and report the exact error.

## Steps

1. **Backend Linting**:
   ```bash
   cd backend && uv run ruff check .
   cd backend && uv run ruff format --check .
   ```

2. **Backend Type Checking**:
   ```bash
   cd backend && uv run mypy app/security app/analyzer
   ```

3. **Backend Unit Tests**:
   ```bash
   cd backend && uv run pytest tests/unit -v
   ```

4. **Backend Integration Tests**:
   ```bash
   cd backend && uv run pytest tests/integration -v
   ```

5. **Backend Security Tests**:
   ```bash
   cd backend && uv run pytest tests/security -v
   ```

6. **Frontend Linting**:
   ```bash
   cd frontend && pnpm lint
   ```

7. **Frontend Type Checking**:
   ```bash
   cd frontend && pnpm tsc --noEmit
   ```

8. **Frontend Unit Tests**:
   ```bash
   cd frontend && pnpm test
   ```

9. **Frontend Production Build**:
   ```bash
   cd frontend && pnpm build
   ```
