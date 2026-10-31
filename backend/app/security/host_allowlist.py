"""Outbound host allowlist for SSRF prevention."""

ALLOWED_STATIC_HOSTS = {
    "api.github.com",
    "github.com",
    "registry.npmjs.org",
    "pypi.org",
    "files.pythonhosted.org",
    "api.osv.dev",
}


def is_host_allowed(host: str, extra_allowed_hosts: set[str] | None = None) -> bool:
    """Check if outbound request destination host is within allowed hosts.

    Implemented in Phase 4.
    """
    raise NotImplementedError("Host allowlist verification is implemented in Phase 4")
