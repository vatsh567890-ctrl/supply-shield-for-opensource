"""Rule: Detects reading sensitive environment variables (TOKEN, SECRET, KEY, etc.).

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class SecretAccessRule:
    rule_id = "secret_access"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("secret_access rule is implemented in Phase 3")
