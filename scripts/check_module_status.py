"""CI verification script: Fails if any module listed as Complete in docs/status.md contains NotImplementedError."""

import re
import sys
from pathlib import Path


def verify_module_status() -> bool:
    root_dir = Path(__file__).resolve().parent.parent
    status_file = root_dir / "docs" / "status.md"

    if not status_file.exists():
        print("ERROR: docs/status.md not found. Run python scripts/generate_status.py first.", file=sys.stderr)
        return False

    content = status_file.read_text(encoding="utf-8")
    table_rows = re.findall(r"\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|", content)

    violations: list[str] = []

    for path_str, status_raw, _ in table_rows:
        clean_status = status_raw.strip().replace("*", "")
        if clean_status == "Complete":
            target_file = root_dir / path_str
            if not target_file.exists():
                violations.append(f"{path_str}: File listed as Complete does not exist on disk")
                continue

            file_content = target_file.read_text(encoding="utf-8")
            if "NotImplementedError" in file_content:
                count = file_content.count("NotImplementedError")
                violations.append(
                    f"{path_str}: Listed as Complete in docs/status.md but contains {count} NotImplementedError occurrence(s)"
                )

    if violations:
        print("FAIL: Honest status verification failed with violations:", file=sys.stderr)
        for v in violations:
            print(f"  - {v}", file=sys.stderr)
        return False

    print("PASS: All modules listed as Complete verified to contain zero NotImplementedError occurrences.")
    return True


if __name__ == "__main__":
    if not verify_module_status():
        sys.exit(1)

