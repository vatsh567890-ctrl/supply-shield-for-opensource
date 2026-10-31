"""Rule: Detects code obfuscation (line length > 500, dense hex escapes, entropy).

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class ObfuscationRule:
    rule_id = "obfuscation"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("obfuscation rule is implemented in Phase 3")
