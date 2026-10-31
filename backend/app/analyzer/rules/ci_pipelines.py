"""Rule: Detects CI/CD pipeline modifications fetching remote resources.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class CiPipelinesRule:
    rule_id = "ci_pipelines"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("ci_pipelines rule is implemented in Phase 3")
