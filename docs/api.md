# SupplyShield API Reference

*Note: This documentation will be generated from OpenAPI schema in Phase 9.*

## Overview

All client-facing dashboard calls route via Next.js `/api/*` rewrites to the FastAPI backend.

- `GET /health` - Liveness probe
- `GET /ready` - Readiness check (verifies PostgreSQL and Redis connectivity)
- `GET /auth/github/login` - Initiates GitHub OAuth flow with signed state cookie
- `GET /auth/github/callback` - OAuth callback, sets session cookie, redirects to frontend
- `POST /auth/logout` - Revokes current session
- `GET /me` - Authenticated user profile
- `GET /me/installations` - List of GitHub App installations accessible by the user
- `GET /repos` - Repositories accessible by user with latest verdict summaries
- `GET /repos/{owner}/{repo}/verdicts` - Paginated verdict history for repository
- `GET /repos/{owner}/{repo}/trends` - Daily risk score trends and counts
- `POST /analyses` - Trigger manual PR analysis (`{"pr_url": string}`)
- `GET /analyses/{id}` - Poll analysis progress and status
- `GET /verdicts/{id}` - Verdict details, findings, overrides, and metadata
- `POST /verdicts/{id}/overrides` - Submit user override (`{"action": "accept"|"reject", "reason": string}`)
- `POST /webhooks/github` - Inbound GitHub webhook endpoint (HMAC signature verified)
