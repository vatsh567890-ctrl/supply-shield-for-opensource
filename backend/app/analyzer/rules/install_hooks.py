"""Rule: Detects added or modified installation hooks (scripts, setup.py cmdclass).

Implemented in Phase 3.
"""

from app.analyzer.models import DiffContext, Finding


class InstallHooksRule:
    rule_id = "install_hooks"

    def evaluate(self, context: DiffContext) -> list[Finding]:
        raise NotImplementedError("install_hooks rule is implemented in Phase 3")
