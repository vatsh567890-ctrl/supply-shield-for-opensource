# Frontend Engineering Standards

1. **Server State via TanStack Query**: All server data fetching, caching, and invalidation must use TanStack Query hooks. No ad-hoc `useEffect` fetches.
2. **Zero Secrets in Client**: Never expose tokens, secrets, or privileged credentials to client-side code. Session cookies are HttpOnly and managed by the browser.
3. **Zod Validation at Boundary**: Every API response payload must be validated with zod schemas at the client boundary in `lib/api/` before being consumed by components.
4. **State Completeness**: Every view and data-driven component must explicitly handle loading, empty, and error states.
5. **Accessibility**: All interactive elements and views must provide accessible markup (proper labels, visible focus indicators, keyboard navigation, and WCAG AA color contrast).
6. **Safe Rendering**: AI-generated text, diff snippets, and package-derived contents must always be rendered as plain text, never via `dangerouslySetInnerHTML` or unescaped HTML.
