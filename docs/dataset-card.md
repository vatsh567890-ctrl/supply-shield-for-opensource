# Dataset Card: SupplyShield Package Risk Benchmark (PRB-v1)

## 1. Overview & Purpose
The SupplyShield Package Risk Benchmark (`PRB-v1`) is a supervised classification dataset designed to train and evaluate ML classifiers on package-version differences between consecutive releases. The target task is detecting malicious-like behavior (e.g. backdoors, exfiltration hooks, credential harvesters) in open-source dependencies (npm and PyPI) prior to merge or execution.

## 2. Dataset Sources & Provenance
- **Positive Examples (Malicious)**:
  - Curated from the OpenSSF Malicious Packages Repository and OSV.dev malicious package advisories.
  - Ecosystems: npm and PyPI.
  - Examples include well-documented historical incidents (`flatmap-stream`, `event-stream`, `ua-parser-js`, `coa`, `rc`, `node-ipc`, `ctx`, `colorama-typo`, `discord-selfbot`, `solana-wallet-fake`, etc.) as well as newer targeted credential stealer campaigns.
  - Only the metadata, file trees, and AST signals are analyzed. Raw malicious packages are never checked into version control; they are extracted dynamically in memory or ephemeral directories with the safe extractor and immediately deleted.
- **Negative Examples (Benign)**:
  - Sampled from the top 1,000 npm and top 1,000 PyPI packages (by monthly download volume), including routine minor/patch releases and complex packages that legitimately utilize installation hooks (`postinstall`, `esbuild`, `node-sass`, `sqlite3`, `bcrypt`) or native compiled extensions (`cryptography`, `numpy`, `scipy`, `pillow`, `grpcio`).

## 3. Dataset Counts & Class Distribution

| Partition | Total Samples | Malicious (Positives) | Benign (Negatives) | Malicious:Benign Ratio | Start Date | End Date |
|-----------|---------------|-----------------------|--------------------|------------------------|------------|----------|
| **Train** | 531 | 53 | 478 | 1:9.02 | 2018-01-01 | 2022-12-30 |
| **Validation** | 150 | 29 | 121 | 1:4.17 | 2023-01-04 | 2024-03-26 |
| **Test** | 279 | 38 | 241 | 1:6.34 | 2024-04-02 | 2026-10-31 |
| **Overall** | **960** | **120** | **840** | **1:7.00** | **2018-01-01** | **2026-10-31** |

## 4. Chronological Split & Leakage Prevention Rules
1. **Time Split Boundary**:
   - Training partition: historical baseline up through December 31, 2022.
   - Validation partition: intermediate calibration window from January 1, 2023 through March 31, 2024.
   - Test partition: recent and holdout evaluations from April 1, 2024 through October 31, 2026.
2. **Disjoint Package Partitions**:
   - **Zero Package Overlap**: No package name in the training set appears in the test set ($\text{Train} \cap \text{Test} = \emptyset$). This ensures the test evaluation measures generalization to completely unseen packages rather than memorization of specific repository styles.
3. **Label Leakage Sanitization**:
   - All advisory IDs (`GHSA-*`, `CVE-*`, `MAL-*`), security reports, issue threads, and post-takedown metadata are strictly excluded.
   - Features rely exclusively on package contents and registry fields that existed prior to or at publication time.

## 5. Feature Schema
The dataset contains 18 deterministic numerical features:
1. `install_hook_added`: (0 or 1) New lifecycle install hook introduced (`preinstall`, `install`, `postinstall`, `cmdclass`).
2. `install_hook_modified`: (0 or 1) Existing lifecycle install hook changed.
3. `install_hook_length`: (int >= 0) Total character length of lifecycle install script commands.
4. `dynamic_exec_count`: (int >= 0) Count of `eval`, `Function`, `exec`, `compile`, `__import__`, `importlib`.
5. `encoded_payload_blob_count`: (int >= 0) Count of base64/hex blobs >= 64 characters.
6. `max_entropy`: (float [0.0 - 8.0]) Maximum Shannon entropy across lines and strings.
7. `new_network_hosts_count`: (int >= 0) Count of newly introduced domains/endpoints.
8. `raw_ip_flag`: (0 or 1) Presence of hardcoded IPv4 or IPv6 network endpoints.
9. `secret_env_reads_count`: (int >= 0) Reads from sensitive environment keys (`AWS_`, `GITHUB_TOKEN`, `SECRET`, `KEY`).
10. `typosquat_min_distance`: (int [0 - 10]) Minimum Levenshtein distance to top-1000 packages.
11. `dropped_provenance_flag`: (0 or 1) Old version had build attestations/provenance; new version dropped them.
12. `binary_files_added`: (int >= 0) Added native compiled binaries (`.so`, `.node`, `.dll`, `.exe`).
13. `minified_long_line_files_added`: (int >= 0) Added files with line length > 1,000 characters.
14. `file_count_delta`: (int) Net change in file count between package versions.
15. `size_delta_bytes`: (int) Net change in total uncompressed archive size.
16. `dependency_count_delta`: (int) Net change in manifest dependencies count.
17. `publish_to_analysis_hours`: (float >= 0.0) Elapsed time between publication timestamp and analysis.
18. `maintainer_count_change`: (int) Change in published maintainers count.

## 6. Known Gaps & Limitations
- **Obfuscation Variants**: Complex multi-stage polymorphic payloads that download encrypted components through second-order steganography may evade initial AST checks.
- **Benign Install Hooks**: High-performance tools like `esbuild`, `swc`, and `sharp` legitimately use install scripts to select precompiled architecture-specific binaries, generating high feature values that require calibrated thresholds to avoid false positives.

## 7. Licensing & Ethics
- Extracted features contain purely statistical indicators and structural AST summaries.
- No malicious source code or harmful payloads are persisted or redistributed.
- OpenSSF Malicious Packages dataset is shared under CC-BY 4.0; top-1000 package metadata is queried from public npm and PyPI registries.

