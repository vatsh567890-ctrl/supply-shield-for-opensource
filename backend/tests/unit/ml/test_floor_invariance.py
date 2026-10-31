"""Unit test verifying high-risk security floors are invariant to ML outputs."""

from app.analyzer.models import Finding, Severity
from app.analyzer.scoring import calculate_score


def test_floors_invariant_to_ml_probabilities() -> None:
    """Verify that ML model probability (0.0 or 1.0) cannot lower or raise security floors."""
    # Findings that trigger Floor 80 (Install hook + new network host)
    findings = [
        Finding(
            rule_id="install_hook_added",
            severity=Severity.HIGH,
            weight=25,
            message="Install hook added",
            file_path="package.json",
        ),
        Finding(
            rule_id="network_new_host",
            severity=Severity.HIGH,
            weight=20,
            message="New network host contacted",
            file_path="setup.js",
        ),
    ]

    # Calculate deterministic score
    final_score, risk_level, rule_score, floor_applied = calculate_score(findings)

    # Invariants
    assert floor_applied == 80
    assert final_score == 80
    assert risk_level == "HIGH"

    # Even with an extreme negative adjustment attempt or simulated ML probability = 0.0,
    # the score cannot fall below 80
    score_adjusted, level_adj, _, floor_adj = calculate_score(findings, llm_adjustment=-10)
    assert floor_adj == 80
    assert score_adjusted >= 80
    assert level_adj == "HIGH"


def test_all_floors_enforced() -> None:
    """Verify each specified security floor from docs/scoring.md."""
    # 1. Install hook + new network host -> Floor 80
    f1 = [
        Finding(rule_id="install_hook_added", severity=Severity.HIGH, weight=25, message="", file_path=""),
        Finding(rule_id="network_new_host", severity=Severity.HIGH, weight=20, message="", file_path=""),
    ]
    assert calculate_score(f1)[3] == 80

    # 2. Install hook + secret env read -> Floor 80
    f2 = [
        Finding(rule_id="install_hook_added", severity=Severity.HIGH, weight=25, message="", file_path=""),
        Finding(rule_id="secret_env_read", severity=Severity.HIGH, weight=20, message="", file_path=""),
    ]
    assert calculate_score(f2)[3] == 80

    # 3. Install hook + encoded payload -> Floor 75
    f3 = [
        Finding(rule_id="install_hook_added", severity=Severity.HIGH, weight=25, message="", file_path=""),
        Finding(rule_id="encoded_payload", severity=Severity.HIGH, weight=15, message="", file_path=""),
    ]
    assert calculate_score(f3)[3] == 75

    # 4. Install hook + binary added -> Floor 75
    f4 = [
        Finding(rule_id="install_hook_added", severity=Severity.HIGH, weight=25, message="", file_path=""),
        Finding(rule_id="binary_added", severity=Severity.HIGH, weight=15, message="", file_path=""),
    ]
    assert calculate_score(f4)[3] == 75

    # 5. Typosquat -> Floor 70
    f5 = [
        Finding(rule_id="typosquat", severity=Severity.HIGH, weight=25, message="", file_path=""),
    ]
    assert calculate_score(f5)[3] == 70

    # 6. Provenance dropped + install hook -> Floor 70
    f6 = [
        Finding(rule_id="install_hook_added", severity=Severity.HIGH, weight=25, message="", file_path=""),
        Finding(rule_id="provenance_dropped", severity=Severity.HIGH, weight=20, message="", file_path=""),
    ]
    assert calculate_score(f6)[3] == 70

