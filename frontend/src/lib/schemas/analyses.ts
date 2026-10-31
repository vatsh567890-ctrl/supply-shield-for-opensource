import { z } from "zod";

export const CreateAnalysisResponseSchema = z.object({
  analysis_id: z.string().uuid(),
  status: z.string().optional(),
  pr_url: z.string().optional(),
});

export type CreateAnalysisResponse = z.infer<typeof CreateAnalysisResponseSchema>;

export const AnalysisStatusSchema = z.object({
  id: z.string().uuid(),
  repo_id: z.string().uuid().optional(),
  pr_number: z.number().optional(),
  head_sha: z.string().optional(),
  status: z.enum(["queued", "running", "succeeded", "failed", "superseded"]),
  current_step: z.string().nullable().optional(),
  error_code: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  verdict_id: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  started_at: z.string().nullable().optional(),
  finished_at: z.string().nullable().optional(),
});

export type AnalysisStatusResponse = z.infer<typeof AnalysisStatusSchema>;
