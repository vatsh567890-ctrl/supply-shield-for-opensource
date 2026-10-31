"""Rule: Detects large base64 or hex encoded payloads.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class EncodedPayloadsRule:
    rule_id = "encoded_payloads"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("encoded_payloads rule is implemented in Phase 3")
