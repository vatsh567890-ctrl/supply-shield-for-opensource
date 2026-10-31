import { http, HttpResponse } from "msw";
import {
  MOCK_USER,
  MOCK_INSTALLATIONS,
  MOCK_REPOS,
  MOCK_REPO_ID,
  MOCK_TRENDS_90_DAYS,
  MOCK_VERDICT_HIGH,
  MOCK_VERDICT_MEDIUM,
  MOCK_VERDICT_LOW,
  MOCK_VERDICT_UNAVAILABLE,
  MOCK_ANALYSIS_SUCCEEDED,
  MOCK_ANALYSIS_RUNNING,
  MOCK_ANALYSIS_FAILED,
} from "./fixtures";

export const MOCK_RATE_LIMITED_ANALYSIS_ID = "00000000-0000-4000-8000-000000000099";

export interface ActiveAnalysisRecord {
  id: string;
  repo_id: string;
  pr_url: string;
  pr_number: number;
  head_sha: string;
  verdict_id: string;
  created_at: number;
}

export const activeAnalyses = new Map<string, ActiveAnalysisRecord>();

export const PROGRESS_STEPS = [
  "queued",
  "fetching_pr",
  "resolving_versions",
  "downloading_packages",
  "analyzing",
  "checking_advisories",
  "ai_review",
  "publishing",
] as const;

export const handlers = [
  // External mock assets
  http.get("https://avatars.githubusercontent.com/*", () => {
    return new HttpResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#B8556B"/></svg>',
      {
        headers: {
          "Content-Type": "image/svg+xml",
        },
      }
    );
  }),

  // Health & Readiness
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }),

  http.get("/api/ready", () => {
    return HttpResponse.json({
      status: "ready",
      database: "connected",
      redis: "connected",
    });
  }),

  // Auth
  http.get("/api/auth/github/login", () => {
    return HttpResponse.json({
      url: "/login?mock_auth=success",
    });
  }),

  http.get("/api/auth/github/callback", () => {
    return HttpResponse.json({
      ok: true,
      user: MOCK_USER,
    });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/me", () => {
    return HttpResponse.json(MOCK_USER);
  }),

  http.get("/api/me/installations", () => {
    return HttpResponse.json(MOCK_INSTALLATIONS);
  }),

  // Repositories & Trends
  http.get("/api/repos", () => {
    return HttpResponse.json(MOCK_REPOS);
  }),

  http.get("/api/repos/:owner/:repo/verdicts", () => {
    return HttpResponse.json([
      MOCK_VERDICT_HIGH,
      MOCK_VERDICT_MEDIUM,
      MOCK_VERDICT_LOW,
    ]);
  }),

  http.get("/api/repos/:owner/:repo/trends", () => {
    return HttpResponse.json(MOCK_TRENDS_90_DAYS);
  }),

  // Analyses
  http.post("/api/analyses", async ({ request }) => {
    let body: { pr_url?: string } = {};
    try {
      body = (await request.json()) as { pr_url?: string };
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_PR_URL",
            message: "Invalid request payload.",
          },
        },
        { status: 400 }
      );
    }

    const prUrl = body.pr_url?.trim() || "";
    const prRegex =
      /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/([1-9][0-9]*)$/;
    const match = prRegex.exec(prUrl);

    if (!match || prUrl.includes("?") || prUrl.includes("#")) {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_PR_URL",
            message:
              "Invalid GitHub pull request URL. Format: https://github.com/{owner}/{repo}/pull/{number}",
          },
        },
        { status: 400 }
      );
    }

    try {
      const parsed = new URL(prUrl);
      if (
        parsed.port ||
        parsed.username ||
        parsed.password ||
        parsed.hostname.toLowerCase() !== "github.com"
      ) {
        return HttpResponse.json(
          {
            error: {
              code: "INVALID_PR_URL",
              message: "Pull request URL contains invalid host, port, or userinfo.",
            },
          },
          { status: 400 }
        );
      }
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_PR_URL",
            message: "Failed to parse pull request URL.",
          },
        },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2];
    const prNumber = parseInt(match[3], 10);

    // Error scenario: GitHub App not installed
    if (
      repo.includes("not-installed") ||
      owner.includes("not-installed") ||
      prUrl.includes("not-installed")
    ) {
      return HttpResponse.json(
        {
          error: {
            code: "APP_NOT_INSTALLED",
            message:
              "The SupplyShield GitHub App is not installed on this repository. Please install the app on your GitHub organization.",
          },
        },
        { status: 403 }
      );
    }

    // Map PR URL to one of the 3 fixture verdicts
    let verdictId = MOCK_VERDICT_HIGH.id;
    if (prNumber === 482 || prUrl.includes("/pull/482")) {
      verdictId = MOCK_VERDICT_HIGH.id;
    } else if (prNumber === 77 || prUrl.includes("/pull/77")) {
      verdictId = MOCK_VERDICT_MEDIUM.id;
    } else if (prNumber === 12 || prUrl.includes("/pull/12")) {
      verdictId = MOCK_VERDICT_LOW.id;
    } else {
      const options = [
        MOCK_VERDICT_HIGH.id,
        MOCK_VERDICT_MEDIUM.id,
        MOCK_VERDICT_LOW.id,
      ];
      verdictId = options[prNumber % 3];
    }

    const analysisId = crypto.randomUUID();

    activeAnalyses.set(analysisId, {
      id: analysisId,
      repo_id: MOCK_REPO_ID,
      pr_url: prUrl,
      pr_number: prNumber,
      head_sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      verdict_id: verdictId,
      created_at: Date.now(),
    });

    return HttpResponse.json(
      {
        analysis_id: analysisId,
        status: "queued",
        pr_url: prUrl,
      },
      { status: 201 }
    );
  }),

  http.get("/api/analyses/:id", ({ params }) => {
    const { id } = params;
    const strId = String(id);

    // Simulated failure cases
    if (
      strId === MOCK_RATE_LIMITED_ANALYSIS_ID ||
      strId === "failed-rate-limited" ||
      strId === MOCK_ANALYSIS_FAILED.id
    ) {
      return HttpResponse.json({
        id: strId,
        repo_id: MOCK_REPO_ID,
        pr_number: 140,
        head_sha: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
        status: "failed",
        current_step: null,
        error_code: "RATE_LIMITED",
        error_message: "GitHub API rate limit exceeded",
        verdict_id: null,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
      });
    }

    if (strId === MOCK_ANALYSIS_RUNNING.id) {
      return HttpResponse.json(MOCK_ANALYSIS_RUNNING);
    }

    const record = activeAnalyses.get(strId);
    if (!record) {
      // Default to succeeded fixture for static or pre-seeded test IDs
      return HttpResponse.json(MOCK_ANALYSIS_SUCCEEDED);
    }

    // Dynamic progression across ~12 seconds:
    // 0 - 1.2s: queued
    // 1.2s - 12s: running with 7 sub-steps (fetching_pr -> publishing)
    // >= 12s: succeeded with verdict_id
    const elapsed = Date.now() - record.created_at;

    if (elapsed >= 12000) {
      return HttpResponse.json({
        id: record.id,
        repo_id: record.repo_id,
        pr_number: record.pr_number,
        head_sha: record.head_sha,
        status: "succeeded",
        current_step: "publishing",
        verdict_id: record.verdict_id,
        created_at: new Date(record.created_at).toISOString(),
        started_at: new Date(record.created_at + 500).toISOString(),
        finished_at: new Date(record.created_at + 12000).toISOString(),
      });
    }

    if (elapsed < 1200) {
      return HttpResponse.json({
        id: record.id,
        repo_id: record.repo_id,
        pr_number: record.pr_number,
        head_sha: record.head_sha,
        status: "queued",
        current_step: "queued",
        verdict_id: null,
        created_at: new Date(record.created_at).toISOString(),
      });
    }

    // 1.2s to 12s: 7 sub-steps (indices 1 to 7)
    // Sub-step duration = (12000 - 1200) / 7 ≈ 1542ms
    const runningSubStep = Math.min(
      PROGRESS_STEPS.length - 1,
      1 + Math.floor((elapsed - 1200) / 1542)
    );
    const current_step = PROGRESS_STEPS[runningSubStep];

    return HttpResponse.json({
      id: record.id,
      repo_id: record.repo_id,
      pr_number: record.pr_number,
      head_sha: record.head_sha,
      status: "running",
      current_step,
      verdict_id: null,
      created_at: new Date(record.created_at).toISOString(),
      started_at: new Date(record.created_at + 500).toISOString(),
    });
  }),

  // Verdicts & Overrides
  http.get("/api/verdicts/:id", ({ params }) => {
    const { id } = params;
    const strId = String(id);
    if (strId === MOCK_VERDICT_MEDIUM.id) {
      return HttpResponse.json(MOCK_VERDICT_MEDIUM);
    }
    if (strId === MOCK_VERDICT_LOW.id) {
      return HttpResponse.json(MOCK_VERDICT_LOW);
    }
    if (strId === MOCK_VERDICT_UNAVAILABLE.id) {
      return HttpResponse.json(MOCK_VERDICT_UNAVAILABLE);
    }
    return HttpResponse.json(MOCK_VERDICT_HIGH);
  }),

  http.post("/api/verdicts/:id/overrides", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      action: "accept" | "reject";
      reason: string;
    };

    if (body.reason && body.reason.includes("trigger-error")) {
      return HttpResponse.json(
        {
          error: {
            code: "OVERRIDE_FAILED",
            message: "Failed to persist security override decision.",
          },
        },
        { status: 500 }
      );
    }

    const newOverride = {
      id: `ov-${Date.now()}`,
      verdict_id: String(id),
      user_id: MOCK_USER.id,
      user_login: MOCK_USER.login,
      action: body.action || "accept",
      reason: body.reason || "Manual security clearance granted.",
      created_at: new Date().toISOString(),
    };

    if (id === MOCK_VERDICT_HIGH.id) {
      MOCK_VERDICT_HIGH.overrides = [
        newOverride,
        ...(MOCK_VERDICT_HIGH.overrides || []),
      ];
    }

    return HttpResponse.json(newOverride);
  }),

  // AI Help Assistant Chat
  http.post("/api/chat", async ({ request }) => {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    // Keep only timestamps within last 10 minutes
    const recent = mockChatTimestamps.filter((t) => now - t < windowMs);
    mockChatTimestamps.length = 0;
    mockChatTimestamps.push(...recent);

    // 21st message in 10 minutes triggers 429
    if (mockChatTimestamps.length >= 20) {
      return HttpResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "You have sent a lot of questions. Try again in a few minutes.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "600",
          },
        }
      );
    }
    mockChatTimestamps.push(now);

    const body = (await request.json().catch(() => ({}))) as {
      message?: string;
      verdict_id?: string | null;
    };
    const message = (body.message || "").trim();
    const lower = message.toLowerCase();

    // 1. FAQ match for "what does HIGH mean"
    if (lower.includes("what does high mean") || (lower.includes("high") && lower.includes("mean"))) {
      return HttpResponse.json({
        reply: "A HIGH risk verdict indicates critical security issues such as unauthorized network calls, suspicious install scripts, or credential access that should be reviewed before merging.",
        source: "faq",
        ai_status: "ok",
      });
    }

    // 2. Off-topic check (refused)
    const inScopeKeywords = [
      "high",
      "verdict",
      "risk",
      "scan",
      "override",
      "typosquat",
      "supplyshield",
      "package",
      "depend",
      "analy",
      "secur",
      "floor",
      "finding",
      "rule",
      "repo",
      "github",
      "pr",
      "pull request",
    ];
    const isInScope = inScopeKeywords.some((kw) => lower.includes(kw));

    if (!isInScope) {
      return HttpResponse.json({
        reply: "I can only answer questions about SupplyShield, supply chain security, and pull request analysis. How can I help you with your scan or verdict?",
        source: "refused",
        ai_status: "ok",
      });
    }

    // 3. In-scope general SupplyShield assistance
    return HttpResponse.json({
      reply: "SupplyShield continuously scans pull requests for supply chain security vulnerabilities, unauthorized install hooks, and suspicious network telemetry.",
      source: "llm",
      ai_status: "ok",
    });
  }),
];

export const mockChatTimestamps: number[] = [];

export function resetMockChatRateLimit(): void {
  mockChatTimestamps.length = 0;
}
