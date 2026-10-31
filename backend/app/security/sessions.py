"""Session management: creation, SHA-256 token hashing, lookup, and revocation."""


def generate_session_token() -> str:
    """Generate 32 random bytes, base64url encoded.

    Implemented in Phase 2.
    """
    raise NotImplementedError("Session token generation is implemented in Phase 2")


def hash_token(token: str) -> str:
    """Hash session token with SHA-256 for persistent database storage.

    Implemented in Phase 2.
    """
    raise NotImplementedError("Session token hashing is implemented in Phase 2")
