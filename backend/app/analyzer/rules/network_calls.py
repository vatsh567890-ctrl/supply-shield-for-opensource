"""Rule: Detects outbound network calls to newly introduced remote hosts.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class NetworkCallsRule:
    rule_id = "network_calls"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("network_calls rule is implemented in Phase 3")
