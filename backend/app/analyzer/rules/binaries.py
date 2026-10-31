"""Rule: Detects newly introduced compiled binary files or shared objects.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class BinariesRule:
    rule_id = "binaries"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("binaries rule is implemented in Phase 3")
