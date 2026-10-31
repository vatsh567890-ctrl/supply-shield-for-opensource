"""Parsers for ecosystem lockfiles (package-lock, pnpm-lock, uv.lock, poetry.lock).

Implemented in Phase 3.
"""


def parse_lockfile(filename: str, content: bytes) -> dict[str, str]:
    """Parse resolved package versions from lockfile content.

    Implemented in Phase 3.
    """
    raise NotImplementedError("parse_lockfile is implemented in Phase 3")
