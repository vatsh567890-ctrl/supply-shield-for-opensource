# Security Requirements (Non-Negotiable)

1. Webhooks: verify X-Hub-Signature-256 over the raw request body using HMAC-SHA256 and a constant-time comparison. Reject missing or invalid signatures with 401 before parsing JSON. Limit body size to 1 MB.
2. Replay and duplicates: deduplicate by X-GitHub-Delivery with a unique index.
3. Never execute code from analyzed packages. No npm install, pip install, eval, or subprocess on package contents.
4. Archive safety: enforce all limits in Section 5, reject symlinks, hardlinks, absolute paths, path traversal, device files, and overlapping entries.
5. SSRF: outbound requests go only through integrations/http.py, which checks the host against host_allowlist.py. Allowed hosts: api.github.com, github.com, registry.npmjs.org, pypi.org, files.pythonhosted.org, api.osv.dev, and the configured LLM host. Redirects are followed only if the target host is also allowed. Set connect and read timeouts. Cap response sizes.
6. URL parsing: accept only https://github.com/{owner}/{repo}/pull/{number}. Reject userinfo, ports, query strings, and other hosts. Validate owner and repo names with a strict regex.
7. Authentication: sessions are server-side, tokens are stored only as SHA-256 hashes, cookies are HttpOnly, Secure in production, and SameSite=Lax. Sessions expire after 7 days and are revoked on logout.
8. OAuth: state is random, bound to a cookie, and checked on callback. The OAuth access token is never stored.
9. Authorization: every endpoint that reads or writes repo data calls access_service.require_repo_access. Test that user A cannot read or override user B's verdicts (IDOR tests).
10. CSRF: mutating endpoints require X-SupplyShield-Request: 1 and a matching Origin header.
11. Input validation: Pydantic v2 with extra="forbid" on request bodies. Limit string lengths. Validate IDs as UUIDs.
12. SQL: ORM or bound parameters only. No string-built queries.
13. Output encoding: escape all text posted to GitHub (markdown special characters, and @mentions neutralized by inserting a zero-width space after the @). Never render LLM or package-derived text as HTML in the frontend.
14. Prompt injection: LLM input is wrapped and labeled as untrusted. The LLM has no tools. Output is schema-validated. The LLM cannot lower a rule floor. Tests include an injected instruction in a fixture diff.
15. Secrets handling: redact known token formats before any diff leaves the server (GitHub PATs, fine-grained PATs, npm tokens, AWS access keys, Slack tokens, JWTs, private key blocks, and generic high-entropy assignments). Never log tokens, keys, or full diffs. The log filter masks secrets as a second layer.
16. Rate limiting: per user and per IP on login, manual scan, and override endpoints. Return 429 with Retry-After.
17. Errors: return stable error codes and safe messages. Never return stack traces, SQL, or internal paths.
18. Headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, frame-ancestors none, on both frontend and backend.
19. CORS: only FRONTEND_ORIGIN, with credentials allowed, for local development. In production the browser calls the backend only through the Next.js rewrite.
20. Secrets in the repository: none. .env files are git-ignored. The GitHub App private key is read from a file path or environment variable and never logged.
21. Least privilege: the GitHub App requests only the permissions listed in Section 12.
22. Fail closed: if analysis, LLM validation, or publishing fails, the check is neutral with a reason, never success.
23. Audit: every override and every login writes an audit_logs row with actor, action, target, timestamp, and IP hash.
24. Dependencies: pin versions in lockfiles. CI runs pip-audit and pnpm audit. Container runs as a non-root user with a read-only filesystem except /tmp.
