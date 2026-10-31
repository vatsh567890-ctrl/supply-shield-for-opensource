"""FAQ matcher and response sanitizer for chatbot."""

import re
from pathlib import Path

FAQ_PATH = Path(__file__).resolve().parent.parent / "llm" / "prompts" / "faq.md"

FAQ_TOPICS = [
    (
        {"risk", "level", "levels", "score", "scores", "low", "medium", "high", "tier"},
        (
            "SupplyShield calculates a 0–100 risk score: "
            "LOW (0–29) passes with success; "
            "MEDIUM (30–69) represents elevated risk with neutral conclusion; "
            "HIGH (70–100) indicates critical danger such as install hooks, network exfiltration, or malware with failure conclusion."
        ),
    ),
    (
        {"floor", "floors", "baseline"},
        (
            "A security floor is a non-negotiable minimum risk score triggered by high-severity findings "
            "(e.g., install hook + network host = Floor 80, install hook + secret env read = Floor 80, typosquat = Floor 70). "
            "AI reviews can never lower a score below an active floor."
        ),
    ),
    (
        {"ai status", "ai summary", "summary", "rule-based", "unavailable"},
        (
            "AI status labels: "
            "'AI summary' (ok) indicates the LLM reviewed the code; "
            "'Rule-based summary' (disabled) indicates LLM analysis is off and rule summaries are used; "
            "'AI unavailable' (unavailable) indicates the LLM call timed out or failed, falling back to rule findings."
        ),
    ),
    (
        {"scan", "scanning", "pr", "pull request", "analyze"},
        (
            "To scan a PR, open /scan and submit a GitHub pull request URL matching "
            "https://github.com/{owner}/{repo}/pull/{number}. "
            "SupplyShield inspects the diff, manifest changes, and dependencies without executing any code."
        ),
    ),
    (
        {"override", "overrides", "accept", "reject", "justification"},
        (
            "Authorized repository maintainers can submit an override on the verdict page. "
            "Select Accept or Reject and provide a required 1–500 character reason. "
            "All overrides are recorded in immutable audit logs."
        ),
    ),
    (
        {"execute", "run code", "install script", "sandbox", "npm install", "pip install"},
        (
            "SupplyShield NEVER executes package code or installation scripts. "
            "There is zero npm install, pip install, eval, or subprocess execution. "
            "All analysis is static AST inspection and metadata verification inside an isolated sandbox."
        ),
    ),
    (
        {"store", "data", "privacy", "credentials", "token"},
        (
            "SupplyShield stores repository metadata, scan verdicts, rule findings, risk scores, override reasons, and audit logs. "
            "It never stores package source code archives, session tokens in plaintext, or raw secret tokens from diffs."
        ),
    ),
]

DEFAULT_FAQ_REPLY = (
    "SupplyShield is a pre-merge security scanner for open-source pull requests. "
    "It inspects package manifests, AST changes, and dependency updates for install hooks, "
    "hidden network calls, and secret reads. It never executes code, enforces non-negotiable "
    "security floors, and provides plain-English risk explanations."
)


def match_faq(query: str) -> str:
    """Find the best matching FAQ snippet for a query based on keyword overlap."""
    q_lower = query.lower()
    q_words = set(re.findall(r"\b\w+\b", q_lower))

    best_match: str | None = None
    best_overlap = 0

    for keywords, answer in FAQ_TOPICS:
        overlap = len(keywords.intersection(q_words))
        # Also check multi-word phrase matching
        for kw in keywords:
            if " " in kw and kw in q_lower:
                overlap += 2
        if overlap > best_overlap:
            best_overlap = overlap
            best_match = answer

    return best_match if (best_match and best_overlap > 0) else DEFAULT_FAQ_REPLY


def sanitize_reply(reply: str) -> str:
    """Ensure plain-text only output with no HTML, no markdown links, capped at 1200 chars."""
    if not reply:
        return ""

    # Strip HTML tags
    cleaned = re.sub(r"<[^>]+>", "", reply)

    # Strip markdown images: ![alt](url) -> ""
    cleaned = re.sub(r"!\[([^\]]*)\]\([^\)]+\)", "", cleaned)

    # Strip markdown links: [text](url) -> text
    cleaned = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", cleaned)

    # Strip angle-bracket URLs: <https://...> -> https://...
    cleaned = re.sub(r"<([a-zA-Z0-9_+.-]+://[^>]+)>", r"\1", cleaned)

    # Normalize whitespace
    cleaned = " ".join(cleaned.split())

    # Cap at 1200 characters
    if len(cleaned) > 1200:
        cleaned = cleaned[:1200].rstrip()

    return cleaned

