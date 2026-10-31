# SupplyShield Real-Data Verification Report

## 1. Executive Summary & Measurement Objective
This report documents the empirical evaluation of the SupplyShield analyzer against real-world pull requests and package archives, adhering strictly to the fixed benchmark specified in `tests/fixtures/real/reference_set.json`.

Measurement Objective:
- Measure deterministic rule findings, applied security floors, and overall scores on real data.
- Maintain complete invariance of rule weights and floors during measurement.
- Document every false positive (FP) and false negative (FN) empirically without altering the reference set.

---

## 2. Reproducibility & Environment Specification

| Parameter | Specification |
| :--- | :--- |
| **Execution Date** | *[Pending Scan Execution]* |
| **Commit Hash** | *[Pending Scan Execution]* |
| **Python Version** | Python 3.14.7 (Windows x86_64) |
| **Key Library Versions** | `fastapi==0.162.0`, `pydantic==2.14.2`, `sqlalchemy==2.1.6`, `scikit-learn==1.9.1`, `lightgbm==4.7.0` |
| **Raw Run Artifacts Directory** | `docs/real-data/runs/<date>/` |
| **Execution Command** | `python -m app.cli scan <target_url_or_package> --json` |

---

## 3. Fixed Reference Benchmark Set

The reference set is strictly frozen prior to test execution. Entries are not added or removed based on outcome.

| Entry ID | Category | Target | Ecosystem | Expected Level | Expected Score | Expected Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REF-001` | Routine Bump | `https://github.com/tiangolo/fastapi/pull/11942` | PyPI | **LOW** | 0–29 | Routine Dependabot version bump without new lifecycle hooks or binary additions. |
| `REF-002` | Routine Bump | `https://github.com/facebook/docusaurus/pull/10450` | npm | **LOW** | 0–29 | Routine Dependabot patch bump without lifecycle script modifications or AST anomalies. |
| `REF-003` | Legitimate Hook / Build | `https://github.com/parcel-bundler/watcher/pull/160` | npm | **MEDIUM** | 30–69 | Legitimate native binding hook update for cross-platform binaries without exfiltration. |
| `REF-004` | Legitimate Hook / Build | `https://github.com/prisma/prisma/pull/24500` | npm | **MEDIUM** | 30–69 | Valid postinstall engine binary verification step from official Prisma infrastructure. |
| `REF-005` | Known Malicious Package | `flatmap-stream@0.1.1` (`GHSA-55q7-qqv5-529g`) | npm | **HIGH** | 70–100 | Compromised package with postinstall hook and encrypted cryptocurrency wallet payload. |
| `REF-006` | Known Malicious Package | `ctx@0.1.2` (`GHSA-j99g-fwh9-hh93`) | PyPI | **HIGH** | 70–100 | Hijacked package with custom cmdclass harvesting AWS keys to an unassigned raw IP. |

---

## 4. Empirical Scan Results

*(Populated upon execution approval. All raw verdict JSON files are stored in `docs/real-data/runs/<date>/`)*

| Entry ID | Target | Expected Level | Actual Level | Actual Score | Rule Findings Triggered | Applied Floor | Match Status | Raw Verdict JSON |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REF-001` | `tiangolo/fastapi#11942` | LOW | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-001.json` |
| `REF-002` | `facebook/docusaurus#10450` | LOW | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-002.json` |
| `REF-003` | `parcel-bundler/watcher#160` | MEDIUM | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-003.json` |
| `REF-004` | `prisma/prisma#24500` | MEDIUM | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-004.json` |
| `REF-005` | `flatmap-stream@0.1.1` | HIGH | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-005.json` |
| `REF-006` | `ctx@0.1.2` | HIGH | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | `runs/<date>/REF-006.json` |

---

## 5. False Positive & False Negative Analysis

### Documented False Positives (Expected LOW/MEDIUM, Scored HIGH)
*(To be populated after scan execution with exact rule breakdown and justification)*

### Documented False Negatives (Expected HIGH, Scored LOW/MEDIUM)
*(To be populated after scan execution with evasion techniques and missed rule signals)*

---

## 6. Observations & Rule Calibration Recommendations
*(Proposed strictly as a post-measurement recommendation; rules and floors are held constant during scans)*

