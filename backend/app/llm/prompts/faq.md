# SupplyShield Knowledge Base & FAQ

## What does each risk level mean?
SupplyShield calculates a deterministic 0 to 100 risk score for every pull request:
- **LOW (0–29)**: Minimal supply chain risk. Standard dependency updates or code changes without suspicious execution hooks, new external hosts, or obfuscation. Passes with GitHub check conclusion `success`.
- **MEDIUM (30–69)**: Elevated risk warranting review. May contain minor advisories, CI workflow alterations, or newly introduced outbound domains. Marked with GitHub check conclusion `neutral`.
- **HIGH (70–100)**: Critical security risk. Indicates potential malware, unexpected install hooks combined with network requests or secret environment variable access, or severe typosquatting. Marked with GitHub check conclusion `failure`.

## What is a security floor?
A security floor is a non-negotiable minimum risk score triggered by dangerous combinations of findings, regardless of rule summation or AI adjustments:
- Install hook added or modified with a new outbound network host: Floor 80
- Install hook with secret-like environment variable reads: Floor 80
- Install hook with encoded payload: Floor 75
- Install hook with new executable binary: Floor 75
- Typosquatting package name match: Floor 70
- Provenance attestations dropped with install hook: Floor 70
An AI review can adjust scores by -10 to +10, but it can NEVER lower a score below an active security floor.

## What do the AI summary status labels mean?
- **AI summary (ok)**: The LLM successfully analyzed the findings and generated a plain-English explanation.
- **Rule-based summary (disabled)**: The LLM integration is disabled by configuration (LLM_PROVIDER=none). The summary is generated deterministically from rule findings.
- **AI unavailable (unavailable)**: The LLM provider call failed, timed out (after 8 seconds), or encountered an error. A deterministic rule-based summary is used as a fallback.

## How do I scan a pull request?
1. Open the **Scan PR** page (`/scan`).
2. Paste any public GitHub pull request URL matching the format `https://github.com/{owner}/{repo}/pull/{number}`.
3. Click **Analyze Pull Request**.
4. SupplyShield tracks the analysis across 8 phases (Queued, Fetching PR, Resolving versions, Downloading packages, Analyzing AST, Checking advisories, AI review, and Publishing verdict). Once complete, you are redirected to the verdict detail page.

## How do I override a verdict?
Authorized repository maintainers can submit an override on the verdict detail page:
1. Navigate to `/verdicts/{verdict_id}`.
2. Click **Override Verdict**.
3. Select an action (**Accept** to approve the risk or **Reject** to block).
4. Provide a mandatory reason (1 to 500 characters) documenting the security justification.
5. Submit the override. An immutable audit log entry is recorded with your user ID and justification.

## What does SupplyShield never do?
SupplyShield NEVER executes the code or package scripts it inspects. There is zero `npm install`, zero `pip install`, zero `eval`, and zero subprocess execution of package files. All inspection is performed safely via static AST parsing, manifest inspection, and metadata diffing inside an isolated sandbox.

## What data does SupplyShield store?
SupplyShield stores repository metadata, scan verdicts, rule findings, risk scores, override justifications, and audit logs. SupplyShield NEVER stores package source code archives, session tokens in plaintext, or repository source code diffs. All tokens and credentials detected in pull request diffs are automatically redacted prior to logging or review.

