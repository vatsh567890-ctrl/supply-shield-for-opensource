# Workflow: Security Review

This review walks through every item in Section 8 of the SupplyShield specification and reports `pass`, `fail`, or `not-applicable` with specific evidence (file path and test name).

## Checklist

- [ ] **1. Webhook Signature**: HMAC-SHA256, constant-time compare, reject missing/invalid with 401 before parsing JSON, 1 MB body limit.
  - *Evidence*: `app/security/webhook_signature.py`, `tests/security/test_webhook_signature.py`
- [ ] **2. Replay & Duplicate Webhooks**: Deduplicate by `X-GitHub-Delivery` with unique index.
  - *Evidence*: `app/db/models/analysis.py`, `app/services/analysis_service.py`
- [ ] **3. No Package Code Execution**: No `npm install`, `pip install`, `eval`, or subprocess on package contents. Static analysis only.
  - *Evidence*: Codebase audit across `app/analyzer/`
- [ ] **4. Archive Safety**: Max file count, max single file size, max uncompressed size, compression ratio <= 100:1, reject symlinks, hardlinks, absolute paths, traversal, device files, overlapping entries.
  - *Evidence*: `app/analyzer/extraction/safe_extract.py`, `tests/security/test_archive_attacks.py`
- [ ] **5. SSRF Defense**: Outbound calls only through `integrations/http.py` with `host_allowlist.py`. Validate redirect targets. Timeouts and response size limits enforced.
  - *Evidence*: `app/security/host_allowlist.py`, `app/integrations/http.py`, `tests/security/test_ssrf.py`
- [ ] **6. Strict PR URL Parsing**: Accept only `https://github.com/{owner}/{repo}/pull/{number}`. Strict regex, reject ports, query params, auth.
  - *Evidence*: `app/security/url_validation.py`, `tests/unit/security/test_url_validation.py`
- [ ] **7. Session Management**: Server-side sessions, SHA-256 token hashing, HttpOnly, Secure, SameSite=Lax cookies, 7-day expiry, revocation on logout.
  - *Evidence*: `app/security/sessions.py`, `tests/unit/security/test_sessions.py`
- [ ] **8. OAuth Security**: Cryptographic random state bound to signed cookie, verified on callback. OAuth token never stored.
  - *Evidence*: `app/security/oauth_state.py`, `app/services/auth_service.py`
- [ ] **9. Authorization & IDOR**: `access_service.require_repo_access` on all repo/verdict data reads and writes.
  - *Evidence*: `app/services/access_service.py`, `tests/security/test_idor.py`
- [ ] **10. CSRF Defense**: Mutating requests require `X-SupplyShield-Request: 1` and Origin matching `FRONTEND_ORIGIN`.
  - *Evidence*: `app/security/csrf.py`, `tests/security/test_csrf.py`
- [ ] **11. Input Validation**: Pydantic v2 with `extra="forbid"`, string length limits, UUID validations.
  - *Evidence*: `app/api/schemas/`
- [ ] **12. SQL Injection Defense**: SQLAlchemy ORM / parameterized queries only. No raw SQL strings.
  - *Evidence*: `app/db/repositories/`
- [ ] **13. Output Encoding**: Markdown escaping and @mention neutralization (zero-width space). Never render untrusted text as HTML.
  - *Evidence*: `app/utils/markdown.py`, `tests/security/test_markdown_injection.py`
- [ ] **14. Prompt Injection Defense**: Wrapped in `<untrusted_content>`, no tool access for LLM, output schema enforced, rule floors immutable.
  - *Evidence*: `app/llm/prompts/`, `app/llm/schemas.py`, `tests/security/test_prompt_injection.py`
- [ ] **15. Secrets Redaction & Logging**: Token regex redaction on diffs before egress. Second-layer log filter.
  - *Evidence*: `app/llm/redaction.py`, `app/logging.py`, `tests/unit/llm/test_redaction.py`
- [ ] **16. Rate Limiting**: Per-user and per-IP rate limits on login, manual scan, and overrides. Return 429 with Retry-After.
  - *Evidence*: `app/security/rate_limit.py`, `tests/security/test_rate_limit.py`
- [ ] **17. Error Masking**: Stable codes and safe messages. No stack traces or internal paths exposed.
  - *Evidence*: `app/errors.py`, `app/main.py`
- [ ] **18. Security Headers**: CSP, HSTS, nosniff, frame-ancestors none, strict referrer.
  - *Evidence*: `app/security/security_headers.py`, `frontend/next.config.ts`
- [ ] **19. CORS**: Only `FRONTEND_ORIGIN` with credentials. Same-origin in production via rewrite.
  - *Evidence*: `app/main.py`, `frontend/next.config.ts`
- [ ] **20. No Secrets in Repo**: `.env` git-ignored, GitHub App private key via path/env, never logged.
  - *Evidence*: `.gitignore`, `app/integrations/github/app_auth.py`
- [ ] **21. Least Privilege**: GitHub App requests only pull_requests (rw), checks (rw), contents (r), metadata (r).
  - *Evidence*: docs and app config
- [ ] **22. Fail Closed**: Neutral Check Run on error, never report success on failure.
  - *Evidence*: `app/worker/pipeline.py`
- [ ] **23. Audit Logging**: Overrides and logins write to `audit_logs` with actor, action, target, timestamp, IP hash.
  - *Evidence*: `app/services/override_service.py`, `app/services/auth_service.py`
- [ ] **24. Dependency Security**: Pinned lockfiles, non-root Docker container, read-only filesystem except `/tmp`.
  - *Evidence*: `backend/Dockerfile`, `backend/uv.lock`, `frontend/pnpm-lock.yaml`
