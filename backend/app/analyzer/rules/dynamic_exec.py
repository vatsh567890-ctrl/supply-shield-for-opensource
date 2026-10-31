"""Rule: Detects dynamic code evaluation (eval, Function, exec, subprocess shell).

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class DynamicExecRule:
    rule_id = "dynamic_exec"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("dynamic_exec rule is implemented in Phase 3")
