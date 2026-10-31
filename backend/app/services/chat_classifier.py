"""Rules-based scope classifier for SupplyShield chatbot questions."""

import re

# Explicit prompt injection triggers that must be refused immediately
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous\s+|your\s+)?instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(previous\s+|your\s+)?instructions", re.IGNORECASE),
    re.compile(
        r"(show|reveal|display|dump|print)\s+.*(password|secret|key|token|prompt)", re.IGNORECASE
    ),
    re.compile(r"system\s+prompt", re.IGNORECASE),
    re.compile(r"database\s+password", re.IGNORECASE),
    re.compile(r"api[_\s]?key", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
]

# In-scope SupplyShield topic keywords
ALLOWED_TOPIC_KEYWORDS = {
    # Verdicts & scoring
    "verdict",
    "verdicts",
    "score",
    "scores",
    "scoring",
    "risk",
    "risks",
    "level",
    "levels",
    "floor",
    "floors",
    "tier",
    "tiers",
    "point",
    "points",
    "gauge",
    "baseline",
    "threshold",
    "low",
    "medium",
    "high",
    # Findings & security rules
    "finding",
    "findings",
    "rule",
    "rules",
    "vulnerability",
    "vulnerabilities",
    "advisory",
    "advisories",
    "cve",
    "osv",
    "network",
    "host",
    "hosts",
    "domain",
    "domains",
    "package",
    "packages",
    "dependency",
    "dependencies",
    "install hook",
    "install script",
    "postinstall",
    "preinstall",
    "ast",
    "diff",
    "malware",
    "typosquat",
    "typosquatting",
    "provenance",
    "obfuscation",
    "binary",
    "encoded payload",
    # Repositories & scanning
    "repo",
    "repos",
    "repository",
    "repositories",
    "branch",
    "github app",
    "installation",
    "scan",
    "scans",
    "scanning",
    "pull request",
    "pr",
    "prs",
    "analysis",
    "analyses",
    "pipeline",
    "progress",
    # Overrides & audit
    "override",
    "overrides",
    "overriding",
    "accept",
    "reject",
    "reason",
    "justification",
    "audit",
    # Login & accounts
    "login",
    "sign in",
    "sign-in",
    "auth",
    "authentication",
    "session",
    "sessions",
    "cookie",
    "cookies",
    "oauth",
    "permission",
    "permissions",
    "account",
    "settings",
    # Core system & concepts
    "supplyshield",
    "supply shield",
    "supply chain",
    "sandbox",
    "static analysis",
    "execute",
    "store",
    "data",
    "faq",
    "help",
    "feature",
    "features",
    "how do you work",
    "what do you do",
}

REFUSAL_MESSAGE = (
    "I can only help with SupplyShield questions such as risk scoring, security findings, "
    "PR scanning, repositories, and overrides."
)


def classify_question(message: str) -> bool:
    """Evaluate whether a user question is strictly within SupplyShield's scope.

    Returns:
        bool: True if in-scope, False if out-of-scope or prompt injection.
    """
    clean_message = message.strip()
    if not clean_message:
        return False

    # Check for adversarial injection or credential extraction
    for pattern in INJECTION_PATTERNS:
        if pattern.search(clean_message):
            return False

    msg_lower = clean_message.lower()

    # Check for presence of allowed domain topic keywords
    for keyword in ALLOWED_TOPIC_KEYWORDS:
        # Check whole word or phrase boundary
        if re.search(rf"\b{re.escape(keyword)}\b", msg_lower):
            return True

    return False
