"""CSRF defense via custom header and origin matching."""

from urllib.parse import urlparse

from fastapi import Request


def verify_csrf(request: Request, expected_origin: str) -> bool:
    """Verify X-SupplyShield-Request header and Origin matching on mutating requests.

    Both the custom header and a matching Origin header are strictly required.
    """
    custom_header = request.headers.get("X-SupplyShield-Request")
    if custom_header != "1":
        return False

    origin = request.headers.get("Origin")
    if not origin:
        return False

    origin_norm = origin.strip().rstrip("/")
    expected_norm = expected_origin.strip().rstrip("/")

    if origin_norm == expected_norm:
        return True

    # Allow localhost and 127.0.0.1 interchangeability in development
    parsed_origin = urlparse(origin_norm)
    parsed_expected = urlparse(expected_norm)

    local_hosts = {"localhost", "127.0.0.1"}
    return bool(
        parsed_origin.scheme == parsed_expected.scheme
        and parsed_origin.port == parsed_expected.port
        and parsed_origin.hostname in local_hosts
        and parsed_expected.hostname in local_hosts
    )
