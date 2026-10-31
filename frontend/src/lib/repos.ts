import { RepoSummaryResponse } from "./schemas/repos";

export function filterRepos(
  repos: RepoSummaryResponse[],
  searchQuery: string = "",
  levelFilter: string = "ALL"
): RepoSummaryResponse[] {
  const query = searchQuery.trim().toLowerCase();
  const normalizedLevel = levelFilter.toUpperCase();

  return repos.filter((repo) => {
    const matchesSearch =
      query === "" ||
      repo.name.toLowerCase().includes(query) ||
      repo.owner.toLowerCase().includes(query);

    const matchesLevel =
      normalizedLevel === "ALL" ||
      (repo.latest_level &&
        repo.latest_level.toUpperCase() === normalizedLevel);

    return matchesSearch && matchesLevel;
  });
}
