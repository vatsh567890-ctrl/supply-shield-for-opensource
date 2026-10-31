"""GitHub App JWT generation and installation access token caching.

Implemented in Phase 4.
"""


def create_app_jwt(app_id: str, private_key_pem: str) -> str:
    """Generate RS256 signed JWT for GitHub App authentication.

    Implemented in Phase 4.
    """
    raise NotImplementedError("GitHub App JWT creation is implemented in Phase 4")


async def get_installation_token(installation_id: int) -> str:
    """Fetch or retrieve cached installation access token.

    Implemented in Phase 4.
    """
    raise NotImplementedError("Installation token retrieval is implemented in Phase 4")
