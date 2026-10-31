"""Rule: Detects dropped package build provenance or supply-chain attestations.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class ProvenanceRule:
    rule_id = "provenance"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("provenance rule is implemented in Phase 3")
