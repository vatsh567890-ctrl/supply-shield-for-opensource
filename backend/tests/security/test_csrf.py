"""Security tests for CSRF token and origin validation."""

from starlette.requests import Request

from app.security.csrf import verify_csrf


def _build_request(headers: dict[str, str]) -> Request:
    raw_headers = [(k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in headers.items()]
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/chat",
        "headers": raw_headers,
    }
    return Request(scope)


def test_csrf_passes_with_valid_header_and_origin():
    req = _build_request({
        "X-SupplyShield-Request": "1",
        "Origin": "http://localhost:3000",
    })
    assert verify_csrf(req, "http://localhost:3000") is True


def test_csrf_rejects_missing_custom_header():
    req = _build_request({
        "Origin": "http://localhost:3000",
    })
    assert verify_csrf(req, "http://localhost:3000") is False


def test_csrf_rejects_missing_origin():
    req = _build_request({
        "X-SupplyShield-Request": "1",
    })
    assert verify_csrf(req, "http://localhost:3000") is False


def test_csrf_rejects_mismatched_origin():
    req = _build_request({
        "X-SupplyShield-Request": "1",
        "Origin": "https://attacker.example.com",
    })
    assert verify_csrf(req, "http://localhost:3000") is False
