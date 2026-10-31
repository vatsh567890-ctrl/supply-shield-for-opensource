import { z } from "zod";

export const RepoSummarySchema = z.object({
  id: z.string().uuid(),
  installation_id: z.string().uuid(),
  github_repo_id: z.number(),
  owner: z.string(),
  name: z.string(),
  default_branch: z.string(),
  latest_score: z.number().nullable().optional(),
  latest_level: z.string().nullable().optional(),
  last_analyzed_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export type RepoSummaryResponse = z.infer<typeof RepoSummarySchema>;

export const TrendPointSchema = z.object({
  date: z.string(),
  max_score: z.number(),
  count: z.number(),
});

export type TrendPoint = z.infer<typeof TrendPointSchema>;

export const RepoTrendsSchema = z.object({
  trends: z.array(TrendPointSchema),
});

export type RepoTrendsResponse = z.infer<typeof RepoTrendsSchema>;
