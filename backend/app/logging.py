"""Structured JSON logging with secret masking filter."""

import json
import logging
import re
from typing import Any

# Mask known token formats and sensitive keys
SECRET_PATTERNS = [
    re.compile(r"ghp_[A-Za-z0-9_]{36,255}"),  # GitHub Personal Access Token
    re.compile(r"github_pat_[A-Za-z0-9_]{82}"),  # GitHub Fine-grained PAT
    re.compile(r"npm_[A-Za-z0-9]{36}"),  # npm Access Token
    re.compile(r"AKIA[0-9A-Z]{16}"),  # AWS Access Key ID
    re.compile(r"xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*"),  # Slack Token
    re.compile(r"-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+ PRIVATE KEY-----"),
    re.compile(r"(?i)(password|secret|token|api_key|authorization)\s*[:=]\s*['\"]?([^\s'\"]+)"),
]


class SecretRedactionFilter(logging.Filter):
    """Logging filter that scrubs sensitive credentials from log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.redact_text(record.msg)
        if record.args and isinstance(record.args, dict):
            record.args = {k: self.redact_value(v) for k, v in record.args.items()}
        return True

    @classmethod
    def redact_text(cls, text: str) -> str:
        scrubbed = text
        for pattern in SECRET_PATTERNS:
            scrubbed = pattern.sub("[REDACTED]", scrubbed)
        return scrubbed

    @classmethod
    def redact_value(cls, val: Any) -> Any:
        if isinstance(val, str):
            return cls.redact_text(val)
        return val


class JSONLogFormatter(logging.Formatter):
    """Format log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO") -> None:
    """Initialize structured JSON logging with redaction filter."""
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level.upper())

    handler = logging.StreamHandler()
    handler.setFormatter(JSONLogFormatter())
    handler.addFilter(SecretRedactionFilter())

    root_logger.handlers = [handler]
