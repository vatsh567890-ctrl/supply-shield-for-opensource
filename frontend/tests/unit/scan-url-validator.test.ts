import { describe, it, expect } from "vitest";
import { ScanUrlSchema } from "@/lib/schemas/scan";

describe("ScanUrlSchema (GitHub PR URL Validator)", () => {
  it("accepts valid canonical GitHub pull request URLs", () => {
    const validUrls = [
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/142",
      "https://github.com/facebook/react/pull/1",
      "https://github.com/a.b-c/d_e.f/pull/999",
      "https://github.com/owner-name/repo.js/pull/42",
    ];

    validUrls.forEach((url) => {
      const result = ScanUrlSchema.safeParse(url);
      expect(result.success, `Expected ${url} to be valid`).toBe(true);
    });
  });

  it("rejects pull request URLs with query strings", () => {
    const urlWithQuery =
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/142?diff=unified";
    const result = ScanUrlSchema.safeParse(urlWithQuery);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("query parameters");
    }
  });

  it("rejects pull request URLs with fragments or hashes", () => {
    const urlWithHash =
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/142#issuecomment-123";
    const result = ScanUrlSchema.safeParse(urlWithHash);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("fragments");
    }
  });

  it("rejects pull request URLs with explicit port numbers", () => {
    const urlWithPort =
      "https://github.com:8443/acme-corp/cloud-infra-orchestrator/pull/142";
    const result = ScanUrlSchema.safeParse(urlWithPort);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("port numbers");
    }
  });

  it("rejects non-GitHub domains and non-PR paths", () => {
    const invalidUrls = [
      "https://gitlab.com/owner/repo/pull/123",
      "https://bitbucket.org/owner/repo/pull/123",
      "https://github.com/owner/repo/issues/123",
      "https://github.com/owner/repo/commit/abcdef",
      "https://github.com/owner/repo/pull/",
      "https://github.com/owner/repo/pull/0",
      "just-a-plain-string",
    ];

    invalidUrls.forEach((url) => {
      const result = ScanUrlSchema.safeParse(url);
      expect(result.success, `Expected ${url} to be invalid`).toBe(false);
    });
  });
});
