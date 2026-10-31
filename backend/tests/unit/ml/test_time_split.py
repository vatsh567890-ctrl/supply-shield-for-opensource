"""Unit test for chronological time split and disjoint package boundaries."""

import json
from pathlib import Path


def test_time_split_disjoint_packages_and_ordering() -> None:
    """Verify that no package appears in both train and test, and splits are chronological."""
    root_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    dataset_dir = root_dir / "ml" / "dataset"
    if not dataset_dir.exists():
        # Fallback if run from backend/
        dataset_dir = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "dataset"

    train_path = dataset_dir / "train.jsonl"
    val_path = dataset_dir / "val.jsonl"
    test_path = dataset_dir / "test.jsonl"

    assert train_path.exists(), f"Missing train.jsonl at {train_path}"
    assert val_path.exists(), f"Missing val.jsonl at {val_path}"
    assert test_path.exists(), f"Missing test.jsonl at {test_path}"

    def read_pkgs_and_dates(p: Path) -> tuple[set[str], list[str]]:
        pkgs = set()
        dates = []
        with p.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    item = json.loads(line)
                    pkgs.add(item["package_name"])
                    dates.append(item["published_at"])
        return pkgs, dates

    train_pkgs, train_dates = read_pkgs_and_dates(train_path)
    val_pkgs, val_dates = read_pkgs_and_dates(val_path)
    test_pkgs, test_dates = read_pkgs_and_dates(test_path)

    # Invariant: No package may appear in both train and test
    overlap = train_pkgs.intersection(test_pkgs)
    assert len(overlap) == 0, f"Detected {len(overlap)} overlapping packages between train and test: {overlap}"

    # Invariant: Chronological ordering
    max_train_date = max(train_dates)
    min_val_date = min(val_dates)
    max_val_date = max(val_dates)
    min_test_date = min(test_dates)

    assert max_train_date <= min_val_date, f"Train date {max_train_date} is after val start {min_val_date}"
    assert max_val_date <= min_test_date, f"Val date {max_val_date} is after test start {min_test_date}"

