# SupplyShield Scoring Model & Rationale

SupplyShield calculates a 0–100 risk score reflecting the security risk of a pull request or dependency bump.

## 1. Rule Weights

Each detected finding is assigned a weight based on its risk tier:

| Rule Name | Weight | Rationale |
|-----------|--------|-----------|
| `install_hook_added` | 25 | Newly introduced installation scripts (e.g. `postinstall`, custom build backends) are the primary vector for package takeovers. |
| `install_hook_modified` | 15 | Alterations to existing install hooks warrant high scrutiny. |
| `dynamic_exec` | 12 | Dynamic evaluation (`eval`, `new Function`, `subprocess` shell commands) frequently masks payload execution. |
| `encoded_payload` | 15 | Large hex or base64 blobs hiding executable routines or URLs. |
| `high_entropy_string` | 8 | Dense strings indicating encrypted payloads or packed code. |
| `obfuscation` | 12 | Extremely high average line length, identifier entropy, or variable renaming disguising malicious logic. |
| `network_new_host` | 20 | Outbound HTTP/socket calls to hosts not previously contacted by older package versions. |
| `network_known_host` | 2 | Minor weight for previously seen hosts. |
| `secret_env_read` | 20 | Accessing sensitive environment variables (`TOKEN`, `SECRET`, `AWS_`, `GITHUB_`, `NPM_`). |
| `typosquat` | 25 | High similarity to a widely-used ecosystem package. |
| `provenance_dropped` | 20 | Package previously had verified build provenance/attestations, now dropped in new release. |
| `maintainer_changed` | 10 | Sudden change in publishing account or author metadata. |
| `new_owner` | 10 | Ownership transfer of package. |
| `ci_pipeline_modified` | 15 | Modifications to CI/CD workflows fetching untrusted remote resources. |
| `binary_added` | 15 | Native executable or shared library introduced in dependency archive. |
| `osv_critical` | 10 | Critical known CVE / advisory from OSV.dev. |
| `osv_high` | 6 | High known CVE / advisory from OSV.dev. |
| `osv_medium` | 3 | Medium known CVE / advisory from OSV.dev. |
| `osv_low` | 1 | Low known CVE / advisory from OSV.dev. |

*Note: OSV contributions are capped in total at 15 points.*

## 2. Per-Rule Caps

To prevent repetitive instances of the same finding from skewing the score, a rule contributes at most `2 × weight` to the total score.

## 3. High-Risk Security Floors

Regardless of mathematical summation, dangerous combinations trigger non-negotiable minimum score floors:
- Install hook added/modified + new network host: Floor **80**
- Install hook + secret-like env read: Floor **80**
- Install hook + encoded payload: Floor **75**
- Install hook + new executable binary: Floor **75**
- Typosquat match detected: Floor **70**
- Provenance dropped + install hook: Floor **70**

## 4. LLM Adjustment & Clamping

When enabled, LLM analysis provides qualitative assessment and can adjust the score by integer `[-10, +10]`.
**Critical Invariant**: An LLM adjustment can never lower a score below an applied security floor:
$$\text{final\_score} = \max(\text{floor}, \min(100, \text{rule\_score} + \text{llm\_adjustment}))$$

## 5. Risk Levels & GitHub Conclusions

- **LOW (0–29)**: Check Run conclusion `success`.
- **MEDIUM (30–69)**: Check Run conclusion `neutral`.
- **HIGH (70–100)**: Check Run conclusion `failure`.
- **Analysis Error / Incomplete**: Check Run conclusion `neutral` with descriptive reason. Never reports success on incomplete analysis.
