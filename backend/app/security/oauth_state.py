"""OAuth state cookie signing and verification."""


def create_oauth_state(session_secret: str) -> tuple[str, str]:
    """Generate cryptographically random state and signed cookie value.

    Implemented in Phase 2.
    """
    raise NotImplementedError("OAuth state generation is implemented in Phase 2")


def verify_oauth_state(state: str, signed_cookie_val: str, session_secret: str) -> bool:
    """Verify signed state cookie against callback parameter.

    Implemented in Phase 2.
    """
    raise NotImplementedError("OAuth state verification is implemented in Phase 2")
