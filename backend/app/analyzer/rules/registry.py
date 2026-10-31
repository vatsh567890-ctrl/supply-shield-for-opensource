"""Registry of enabled security detection rules.

Implemented in Phase 3.
"""

from app.analyzer.rules.base import Rule


def get_enabled_rules() -> list[Rule]:
    """Return ordered list of active detection rules.

    Implemented in Phase 3.
    """
    raise NotImplementedError("Rule registry is implemented in Phase 3")
