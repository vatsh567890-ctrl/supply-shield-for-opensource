"""Rule: Detects typosquatting against top popular ecosystem packages.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class TyposquatRule:
    rule_id = "typosquat"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("typosquat rule is implemented in Phase 3")
