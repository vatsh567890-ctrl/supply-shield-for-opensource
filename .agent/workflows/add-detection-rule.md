# Workflow: Add Detection Rule

Checklist for implementing and registering a new detection rule:

1. **Rule Implementation**:
   - Create rule module under `backend/app/analyzer/rules/<rule_name>.py`.
   - Adhere to the `Rule` protocol defined in `backend/app/analyzer/rules/base.py`.
   - Keep logic under 300 lines; functions under 40 lines.

2. **Weights & Configuration**:
   - Assign appropriate weight and documentation in `backend/app/analyzer/config/weights.yaml`.
   - Ensure per-rule cap and floor conditions are properly configured.

3. **Fixtures**:
   - Add synthetic benign and malicious test fixtures under `backend/tests/fixtures/packages/`.
   - Ensure malicious fixtures use only `*.invalid` domains and synthetic payloads (no real malware).

4. **Testing**:
   - Add unit tests for the rule under `backend/tests/unit/analyzer/`.
   - Verify detection triggers expected findings on malicious fixtures.
   - Verify benign fixtures produce no false positive findings.
   - Add or update scoring tests to verify impact on total score, floors, and caps.

5. **Documentation & Progress**:
   - Update `docs/scoring.md` with rationale, weight, and detection logic explanation.
   - Record additions in `docs/progress.md`.
