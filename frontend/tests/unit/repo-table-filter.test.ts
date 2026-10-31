import { describe, it, expect } from "vitest";
import { filterRepos } from "@/lib/repos";
import { MOCK_REPOS } from "@/mocks/fixtures";

describe("filterRepos (Repository Search and Risk Filter)", () => {
  it("returns all repositories when search is empty and level is ALL", () => {
    const result = filterRepos(MOCK_REPOS, "", "ALL");
    expect(result.length).toBe(MOCK_REPOS.length);
  });

  it("filters repositories case-insensitively by name", () => {
    const result = filterRepos(MOCK_REPOS, "orchestrator", "ALL");
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("cloud-infra-orchestrator");
  });

  it("filters repositories case-insensitively by owner", () => {
    const result = filterRepos(MOCK_REPOS, "acme", "ALL");
    expect(result.length).toBe(3);
  });

  it("filters repositories strictly by risk level", () => {
    const highOnly = filterRepos(MOCK_REPOS, "", "HIGH");
    expect(highOnly.length).toBe(1);
    expect(highOnly[0].latest_level).toBe("HIGH");

    const medOnly = filterRepos(MOCK_REPOS, "", "MEDIUM");
    expect(medOnly.length).toBe(1);
    expect(medOnly[0].latest_level).toBe("MEDIUM");

    const lowOnly = filterRepos(MOCK_REPOS, "", "LOW");
    expect(lowOnly.length).toBe(1);
    expect(lowOnly[0].latest_level).toBe("LOW");
  });

  it("combines search query and risk level filter", () => {
    const match = filterRepos(MOCK_REPOS, "portal", "LOW");
    expect(match.length).toBe(1);
    expect(match[0].name).toBe("frontend-portal");

    const noMatch = filterRepos(MOCK_REPOS, "portal", "HIGH");
    expect(noMatch.length).toBe(0);
  });

  it("returns empty array when search query matches nothing", () => {
    const result = filterRepos(MOCK_REPOS, "non-existent-repo", "ALL");
    expect(result.length).toBe(0);
  });
});
