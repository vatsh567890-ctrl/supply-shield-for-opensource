"""Scoring model: rule weights, per-rule caps, floors, and risk level mapping.

Strictly follows docs/scoring.md.
"""

from app.analyzer.models import Finding

RULE_WEIGHTS: dict[str, int] = {
    "install_hook_added": 25,
    "install_hook_modified": 15,
    "dynamic_exec": 12,
    "encoded_payload": 15,
    "high_entropy_string": 8,
    "obfuscation": 12,
    "network_new_host": 20,
    "network_known_host": 2,
    "secret_env_read": 20,
    "typosquat": 25,
    "provenance_dropped": 20,
    "maintainer_changed": 10,
    "new_owner": 10,
    "ci_pipeline_modified": 15,
    "binary_added": 15,
    "osv_critical": 10,
    "osv_high": 6,
    "osv_medium": 3,
    "osv_low": 1,
}


def calculate_score(
    findings: list[Finding],
    llm_adjustment: int = 0,
) -> tuple[int, str, int, int | None]:
    """Calculate final score (0-100), risk level, base rule score, and applied floor.

    Returns:
        (final_score, risk_level, rule_score, floor_applied)
    """
    rule_counts: dict[str, int] = {}
    for f in findings:
        rule_counts[f.rule_id] = rule_counts.get(f.rule_id, 0) + 1

    total_rule_score = 0
    osv_score = 0

    for rule_id, count in rule_counts.items():
        weight = RULE_WEIGHTS.get(rule_id, 0)
        # Cap at 2x weight per rule
        contribution = min(count * weight, 2 * weight)
        if rule_id.startswith("osv_"):
            osv_score += contribution
        else:
            total_rule_score += contribution

    # OSV total cap is 15 points
    total_rule_score += min(osv_score, 15)
    base_score = min(100, max(0, total_rule_score))

    # Evaluate High-Risk Security Floors
    floors: list[int] = []
    has_install_hook = (
        rule_counts.get("install_hook_added", 0) > 0
        or rule_counts.get("install_hook_modified", 0) > 0
    )

    if has_install_hook and rule_counts.get("network_new_host", 0) > 0:
        floors.append(80)
    if has_install_hook and rule_counts.get("secret_env_read", 0) > 0:
        floors.append(80)
    if has_install_hook and rule_counts.get("encoded_payload", 0) > 0:
        floors.append(75)
    if has_install_hook and rule_counts.get("binary_added", 0) > 0:
        floors.append(75)
    if rule_counts.get("typosquat", 0) > 0:
        floors.append(70)
    if has_install_hook and rule_counts.get("provenance_dropped", 0) > 0:
        floors.append(70)

    applied_floor: int | None = max(floors) if floors else None

    # LLM adjustment clamped [-10, +10]
    clamped_adjustment = max(-10, min(10, llm_adjustment))
    adjusted_score = base_score + clamped_adjustment

    if applied_floor is not None:
        final_score = max(applied_floor, min(100, adjusted_score))
    else:
        final_score = max(0, min(100, adjusted_score))

    # Map to risk tier
    if final_score >= 70:
        risk_level = "HIGH"
    elif final_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return final_score, risk_level, base_score, applied_floor
