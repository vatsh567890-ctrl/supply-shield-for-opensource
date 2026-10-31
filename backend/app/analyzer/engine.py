"""Analysis engine executing enabled rules over DiffContext.

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


def run_analysis_rules(context: DiffContext) -> list[Finding]:
    """Execute all active detection rules against a DiffContext.

    Implemented in Phase 3.
    """
    raise NotImplementedError("run_analysis_rules is implemented in Phase 3")
