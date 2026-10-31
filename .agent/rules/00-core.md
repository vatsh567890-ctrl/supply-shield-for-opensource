# Core Engineering Standards

1. **Python 3.12**: All backend code must use Python 3.12 with full type hints on all functions and variables.
2. **TypeScript Strict**: All frontend code must use TypeScript in strict mode with no unexplained `any`.
3. **Function Size**: Keep functions concise and focused, under 40 lines.
4. **Single Responsibility**: One clear responsibility per module. If a module grows beyond ~300 lines, split it.
5. **Test-Driven / Integrated**: Tests must be written with the code, not after. Never defer test writing.
6. **Dependencies**: No new dependency added without a one-line justification recorded in `docs/progress.md`.
7. **Comments**: Comments must explain the "why" and architectural rationale, not restate the obvious "what".
8. **Phase Isolation**: Build strictly according to phases. Stubs raise `NotImplementedError` with the phase name.
