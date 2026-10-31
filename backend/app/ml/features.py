"""Deterministic feature extraction for SupplyShield package diffs.

All features are computed directly from in-memory package trees and registry metadata.
Strictly zero network access is performed during extraction.
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

FEATURE_NAMES: list[str] = [
    "install_hook_added",
    "install_hook_modified",
    "install_hook_length",
    "dynamic_exec_count",
    "encoded_payload_blob_count",
    "max_entropy",
    "new_network_hosts_count",
    "raw_ip_flag",
    "secret_env_reads_count",
    "typosquat_min_distance",
    "dropped_provenance_flag",
    "binary_files_added",
    "minified_long_line_files_added",
    "file_count_delta",
    "size_delta_bytes",
    "dependency_count_delta",
    "publish_to_analysis_hours",
    "maintainer_count_change",
]

# Binary file extensions
BINARY_EXTENSIONS = {
    ".node",
    ".so",
    ".dylib",
    ".dll",
    ".exe",
    ".bin",
    ".elf",
    ".o",
    ".a",
    ".pyd",
    ".wasm",
}

# Suspicious dynamic execution patterns
DYNAMIC_EXEC_PATTERNS = [
    re.compile(r"\beval\s*\("),
    re.compile(r"\bFunction\s*\("),
    re.compile(r"\bexec\s*\("),
    re.compile(r"\bcompile\s*\("),
    re.compile(r"\b__import__\s*\("),
    re.compile(r"\bimportlib\b"),
    re.compile(r"\bimport\s*\("),
]

# Secret-like environment variable access
SECRET_ENV_PATTERNS = [
    re.compile(
        r"process\.env(?:\.|\s*\[\s*['\"])(?:AWS_|GITHUB_|NPM_|SLACK_|TOKEN|SECRET|KEY|PASSWORD|AUTH|PRIVATE|CREDENTIAL)",
        re.IGNORECASE,
    ),
    re.compile(
        r"os\.environ(?:\.get\s*\(\s*['\"]|\s*\[\s*['\"])(?:AWS_|GITHUB_|NPM_|SLACK_|TOKEN|SECRET|KEY|PASSWORD|AUTH|PRIVATE|CREDENTIAL)",
        re.IGNORECASE,
    ),
    re.compile(
        r"getenv\s*\(\s*['\"](?:AWS_|GITHUB_|NPM_|SLACK_|TOKEN|SECRET|KEY|PASSWORD|AUTH|PRIVATE|CREDENTIAL)",
        re.IGNORECASE,
    ),
]

# Encoded blobs
BASE64_HEX_BLOB_PATTERN = re.compile(r"(?:[A-Za-z0-9+/]{4}){16,}={0,2}|(?:[0-9a-fA-F]{2}){32,}")

# URL and Host extraction
URL_PATTERN = re.compile(r"https?://([a-zA-Z0-9.-]+(?::\d+)?)")
RAW_IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def shannon_entropy(data: str) -> float:
    """Calculate Shannon entropy for a string (bits per symbol)."""
    if not data:
        return 0.0
    freq: dict[str, int] = {}
    for char in data:
        freq[char] = freq.get(char, 0) + 1
    total = len(data)
    entropy = 0.0
    for count in freq.values():
        p = count / total
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein edit distance between two strings."""
    if s1 == s2:
        return 0
    if not s1:
        return len(s2)
    if not s2:
        return len(s1)

    prev_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row

    return prev_row[-1]


@dataclass
class PackageDiffData:
    """Unified container representing the differences between two package versions."""

    ecosystem: str  # "npm" or "pypi"
    package_name: str
    old_version: str | None = None
    new_version: str = "0.0.0"
    old_files: dict[str, bytes] = field(default_factory=dict)
    new_files: dict[str, bytes] = field(default_factory=dict)
    old_manifest: dict[str, Any] = field(default_factory=dict)
    new_manifest: dict[str, Any] = field(default_factory=dict)
    published_at: str | None = None
    analysis_time: str | None = None
    old_maintainers: list[str] = field(default_factory=list)
    new_maintainers: list[str] = field(default_factory=list)
    top_packages: list[str] | None = None


def load_top_packages(ecosystem: str) -> list[str]:
    """Load top packages list from analyzer data directory with fallback."""
    here = Path(__file__).resolve().parent
    candidates = [
        here.parent / "backend" / "app" / "analyzer" / "data" / f"top_{ecosystem}_packages.json",
        here.parent / "app" / "analyzer" / "data" / f"top_{ecosystem}_packages.json",
    ]
    for p in candidates:
        if p.exists():
            try:
                with p.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return [str(x) for x in data]
            except Exception:
                pass

    if ecosystem == "npm":
        return [
            "react",
            "react-dom",
            "lodash",
            "express",
            "axios",
            "chalk",
            "tslib",
            "uuid",
            "webpack",
            "next",
        ]
    return [
        "boto3",
        "botocore",
        "requests",
        "urllib3",
        "setuptools",
        "cryptography",
        "numpy",
        "pandas",
        "fastapi",
    ]


def extract_features(diff: PackageDiffData) -> dict[str, float]:
    """Extract deterministic security risk features from package diff data."""
    features: dict[str, float] = dict.fromkeys(FEATURE_NAMES, 0.0)

    # 1. Install Hook Analysis (npm & PyPI)
    old_scripts = (
        diff.old_manifest.get("scripts", {}) if isinstance(diff.old_manifest, dict) else {}
    )
    new_scripts = (
        diff.new_manifest.get("scripts", {}) if isinstance(diff.new_manifest, dict) else {}
    )
    hook_keys = {"preinstall", "install", "postinstall", "prepublish", "prepare"}

    added_hooks: list[str] = []
    modified_hooks: list[str] = []
    new_hook_texts: list[str] = []

    for k in hook_keys:
        old_val = str(old_scripts.get(k, "")).strip() if isinstance(old_scripts, dict) else ""
        new_val = str(new_scripts.get(k, "")).strip() if isinstance(new_scripts, dict) else ""
        if new_val:
            new_hook_texts.append(new_val)
            if not old_val:
                added_hooks.append(k)
            elif old_val != new_val:
                modified_hooks.append(k)

    # PyPI setup commands or cmdclass
    for fname, content in diff.new_files.items():
        if fname.lower() in ("setup.py", "setup.cfg", "pyproject.toml"):
            text = content.decode("utf-8", errors="ignore")
            if "cmdclass" in text or "build_ext" in text:
                old_content = diff.old_files.get(fname, b"").decode("utf-8", errors="ignore")
                if "cmdclass" not in old_content and "build_ext" not in old_content:
                    added_hooks.append("cmdclass")
                elif text != old_content:
                    modified_hooks.append("cmdclass")
                new_hook_texts.append(text)

    features["install_hook_added"] = 1.0 if added_hooks else 0.0
    features["install_hook_modified"] = 1.0 if modified_hooks else 0.0
    features["install_hook_length"] = float(sum(len(t) for t in new_hook_texts))

    # 2. File additions, content entropy, and AST signals
    added_or_modified_texts: list[str] = []
    max_ent = 0.0
    blob_count = 0
    dynamic_exec = 0
    secret_reads = 0
    new_hosts: set[str] = set()
    old_hosts: set[str] = set()
    raw_ip = 0.0
    binary_added = 0
    long_line_files = 0

    # Old tree hosts
    for content in diff.old_files.values():
        text = content.decode("utf-8", errors="ignore")
        for match in URL_PATTERN.finditer(text):
            old_hosts.add(match.group(1).lower())

    # New tree inspection
    old_file_set = set(diff.old_files.keys())
    for fname, content in diff.new_files.items():
        is_added = fname not in old_file_set
        is_modified = not is_added and (diff.old_files[fname] != content)

        ext = Path(fname).suffix.lower()
        if is_added and ext in BINARY_EXTENSIONS:
            binary_added += 1

        if is_added or is_modified:
            text = content.decode("utf-8", errors="ignore")
            added_or_modified_texts.append(text)

            # Check long lines or minification
            lines = text.splitlines()
            if any(len(line) > 1000 for line in lines):
                long_line_files += 1

            # Dynamic exec
            for pat in DYNAMIC_EXEC_PATTERNS:
                dynamic_exec += len(pat.findall(text))

            # Secret environment reads
            for pat in SECRET_ENV_PATTERNS:
                secret_reads += len(pat.findall(text))

            # Encoded blobs
            blobs = BASE64_HEX_BLOB_PATTERN.findall(text)
            blob_count += len(blobs)
            for b in blobs:
                ent = shannon_entropy(b)
                max_ent = max(max_ent, ent)

            # Network hosts and raw IPs
            for match in URL_PATTERN.finditer(text):
                host = match.group(1).lower()
                if host not in old_hosts:
                    new_hosts.add(host)
                    if RAW_IP_PATTERN.search(host):
                        raw_ip = 1.0

            # General string entropy sampling
            for line in lines[:200]:
                if len(line) >= 32:
                    ent = shannon_entropy(line)
                    max_ent = max(max_ent, ent)

    features["dynamic_exec_count"] = float(dynamic_exec)
    features["encoded_payload_blob_count"] = float(blob_count)
    features["max_entropy"] = round(max_ent, 4)
    features["new_network_hosts_count"] = float(len(new_hosts))
    features["raw_ip_flag"] = raw_ip
    features["secret_env_reads_count"] = float(secret_reads)
    features["binary_files_added"] = float(binary_added)
    features["minified_long_line_files_added"] = float(long_line_files)

    # 3. Typosquat edit distance to top packages
    top_pkgs = diff.top_packages or load_top_packages(diff.ecosystem)
    pkg_clean = diff.package_name.lower().replace("-", "").replace("_", "")
    min_dist = 999
    for top in top_pkgs:
        top_clean = top.lower().replace("-", "").replace("_", "")
        dist = levenshtein_distance(pkg_clean, top_clean)
        if dist < min_dist:
            min_dist = dist
            if min_dist == 0:
                break
    features["typosquat_min_distance"] = float(min(min_dist, 10))

    # 4. Dropped provenance flag
    prov_markers = [".provenance", ".sigstore", ".attestation", "slsa-provenance.json"]
    had_prov = any(any(m in k for m in prov_markers) for k in diff.old_files)
    if (
        isinstance(diff.old_manifest, dict)
        and isinstance(diff.old_manifest.get("publishConfig"), dict)
        and diff.old_manifest["publishConfig"].get("provenance")
    ):
        had_prov = True

    has_prov = any(any(m in k for m in prov_markers) for k in diff.new_files)
    if (
        isinstance(diff.new_manifest, dict)
        and isinstance(diff.new_manifest.get("publishConfig"), dict)
        and diff.new_manifest["publishConfig"].get("provenance")
    ):
        has_prov = True

    features["dropped_provenance_flag"] = 1.0 if (had_prov and not has_prov) else 0.0

    # 5. Tree-level deltas
    features["file_count_delta"] = float(len(diff.new_files) - len(diff.old_files))
    old_size = sum(len(c) for c in diff.old_files.values())
    new_size = sum(len(c) for c in diff.new_files.values())
    features["size_delta_bytes"] = float(new_size - old_size)

    # Dependency count delta
    old_deps = (
        diff.old_manifest.get("dependencies", {}) if isinstance(diff.old_manifest, dict) else {}
    )
    new_deps = (
        diff.new_manifest.get("dependencies", {}) if isinstance(diff.new_manifest, dict) else {}
    )
    old_dep_count = len(old_deps) if isinstance(old_deps, dict) else 0
    new_dep_count = len(new_deps) if isinstance(new_deps, dict) else 0
    features["dependency_count_delta"] = float(new_dep_count - old_dep_count)

    # 6. Metadata timing & maintainers
    if diff.published_at and diff.analysis_time:
        try:
            t1 = datetime.fromisoformat(diff.published_at.replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(diff.analysis_time.replace("Z", "+00:00"))
            hours = abs((t2 - t1).total_seconds()) / 3600.0
            features["publish_to_analysis_hours"] = round(hours, 2)
        except Exception:
            features["publish_to_analysis_hours"] = 1.0
    else:
        features["publish_to_analysis_hours"] = 1.0

    old_m = len(diff.old_maintainers)
    new_m = len(diff.new_maintainers)
    features["maintainer_count_change"] = float(new_m - old_m)

    return features


def extract_feature_vector(diff: PackageDiffData) -> list[float]:
    """Return ordered feature values as a numeric list matching FEATURE_NAMES."""
    feats = extract_features(diff)
    return [feats[name] for name in FEATURE_NAMES]
