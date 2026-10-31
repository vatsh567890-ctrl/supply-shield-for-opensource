import { describe, it, expect } from "vitest";
import {
  VerdictDetailSchema,
  FindingSchema,
  OverrideSchema,
} from "@/lib/schemas/verdicts";
import { AnalysisStatusSchema, CreateAnalysisResponseSchema } from "@/lib/schemas/analyses";
import { RepoSummarySchema, RepoTrendsSchema } from "@/lib/schemas/repos";
import { UserProfileSchema, InstallationSchema } from "@/lib/schemas/auth";
import {
  MOCK_VERDICT_HIGH,
  MOCK_VERDICT_MEDIUM,
  MOCK_VERDICT_LOW,
  MOCK_ANALYSIS_SUCCEEDED,
  MOCK_ANALYSIS_FAILED,
  MOCK_TRENDS_90_DAYS,
  MOCK_USER,
  MOCK_INSTALLATIONS,
  MOCK_REPOS,
} from "@/mocks/fixtures";

describe("Zod API Schemas Validation", () => {
  describe("VerdictDetailSchema", () => {
    it("successfully parses valid HIGH, MEDIUM, and LOW mock fixtures", () => {
      expect(VerdictDetailSchema.safeParse(MOCK_VERDICT_HIGH).success).toBe(true);
      expect(VerdictDetailSchema.safeParse(MOCK_VERDICT_MEDIUM).success).toBe(true);
      expect(VerdictDetailSchema.safeParse(MOCK_VERDICT_LOW).success).toBe(true);
    });

    it("rejects invalid verdicts with missing score or illegal risk level", () => {
      const invalidLevel = {
        ...MOCK_VERDICT_HIGH,
        level: "CRITICAL_THREAT", // Not in ["LOW", "MEDIUM", "HIGH"]
      };
      expect(VerdictDetailSchema.safeParse(invalidLevel).success).toBe(false);

      const missingScore = {
        ...MOCK_VERDICT_HIGH,
        score: "ninety-two", // Must be a number
      };
      expect(VerdictDetailSchema.safeParse(missingScore).success).toBe(false);

      const invalidUUID = {
        ...MOCK_VERDICT_HIGH,
        id: "not-a-valid-uuid",
      };
      expect(VerdictDetailSchema.safeParse(invalidUUID).success).toBe(false);
    });
  });

  describe("FindingSchema", () => {
    it("parses valid findings with evidence and file path", () => {
      const validFinding = MOCK_VERDICT_HIGH.findings[0];
      const result = FindingSchema.safeParse(validFinding);
      expect(result.success).toBe(true);
    });

    it("rejects findings with non-UUID id or missing rule_id", () => {
      const invalidFinding = {
        id: "12345",
        rule_id: "",
        severity: "HIGH",
        weight: 20,
        file_path: "package.json",
        // message missing
      };
      expect(FindingSchema.safeParse(invalidFinding).success).toBe(false);
    });
  });

  describe("AnalysisStatusSchema", () => {
    it("parses succeeded and failed analysis fixtures", () => {
      expect(AnalysisStatusSchema.safeParse(MOCK_ANALYSIS_SUCCEEDED).success).toBe(true);
      expect(AnalysisStatusSchema.safeParse(MOCK_ANALYSIS_FAILED).success).toBe(true);
    });

    it("rejects invalid analysis status enums", () => {
      const invalidStatus = {
        ...MOCK_ANALYSIS_SUCCEEDED,
        status: "in_progress", // Valid enum is ["queued", "running", "succeeded", "failed", "superseded"]
      };
      expect(AnalysisStatusSchema.safeParse(invalidStatus).success).toBe(false);
    });
  });

  describe("RepoTrendsSchema", () => {
    it("parses full 90-day trend data fixture", () => {
      const result = RepoTrendsSchema.safeParse(MOCK_TRENDS_90_DAYS);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.trends.length).toBe(90);
      }
    });

    it("rejects trends with non-numeric score", () => {
      const invalidTrends = {
        trends: [{ date: "2026-10-30", max_score: "high", count: 1 }],
      };
      expect(RepoTrendsSchema.safeParse(invalidTrends).success).toBe(false);
    });
  });

  describe("UserProfileSchema & InstallationSchema", () => {
    it("parses valid user profile and installation fixtures", () => {
      expect(UserProfileSchema.safeParse(MOCK_USER).success).toBe(true);
      expect(InstallationSchema.safeParse(MOCK_INSTALLATIONS[0]).success).toBe(true);
    });

    it("rejects user profile with missing github_id or malformed UUID", () => {
      const invalidUser = {
        id: "invalid-uuid",
        login: "attacker",
        created_at: "2026-01-01T00:00:00Z",
      };
      expect(UserProfileSchema.safeParse(invalidUser).success).toBe(false);
    });
  });

  describe("OverrideSchema", () => {
    it("parses valid override with accept/reject action", () => {
      const validOverride = {
        id: "00000000-0000-4000-8000-000000000099",
        verdict_id: "11111111-1111-4111-8111-111111111111",
        user_id: "00000000-0000-4000-8000-000000000001",
        action: "accept",
        reason: "False positive verified by secops lead.",
        created_at: "2026-10-30T22:30:00Z",
      };
      expect(OverrideSchema.safeParse(validOverride).success).toBe(true);
    });

    it("rejects illegal override action enum", () => {
      const invalidAction = {
        id: "00000000-0000-4000-8000-000000000099",
        verdict_id: "11111111-1111-4111-8111-111111111111",
        user_id: "00000000-0000-4000-8000-000000000001",
        action: "ignore", // Not in ["accept", "reject"]
        reason: "Test",
        created_at: "2026-10-30T22:30:00Z",
      };
      expect(OverrideSchema.safeParse(invalidAction).success).toBe(false);
    });
  });
});
