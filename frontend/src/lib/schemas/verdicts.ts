import { z } from "zod";

export const FindingSchema = z.object({
  id: z.string(),
  rule_id: z.string(),
  severity: z.string(),
  weight: z.number(),
  package_ecosystem: z.string().nullable().optional(),
  package_name: z.string().nullable().optional(),
  package_version: z.string().nullable().optional(),
  file_path: z.string(),
  line_start: z.number().nullable().optional(),
  line_end: z.number().nullable().optional(),
  message: z.string(),
  evidence: z.string().nullable().optional(),
});

export type FindingResponse = z.infer<typeof FindingSchema>;

export const OverrideInputSchema = z.object({
  action: z.enum(["accept", "reject"], {
    required_error: "Action must be either accept or reject",
  }),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required (minimum 1 character)")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type OverrideInput = z.infer<typeof OverrideInputSchema>;

export const OverrideSchema = z.object({
  id: z.string(),
  verdict_id: z.string(),
  user_id: z.string(),
  user_login: z.string().optional(),
  action: z.enum(["accept", "reject"]),
  reason: z.string(),
  created_at: z.string(),
});

export type OverrideResponse = z.infer<typeof OverrideSchema>;

export const DiffLineSchema = z.object({
  type: z.enum(["add", "del", "ctx"]),
  content: z.string(),
  old_line: z.number().optional(),
  new_line: z.number().optional(),
});

export type DiffLine = z.infer<typeof DiffLineSchema>;

export const DiffFileSchema = z.object({
  filename: z.string(),
  lines: z.array(DiffLineSchema).default([]),
});

export type DiffFile = z.infer<typeof DiffFileSchema>;

export const VerdictDetailSchema = z.object({
  id: z.string().uuid(),
  analysis_id: z.string().uuid(),
  repo_id: z.string().uuid(),
  score: z.number(),
  level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  rule_score: z.number(),
  llm_adjustment: z.number(),
  floor_applied: z.number().nullable().optional(),
  ai_status: z.enum(["ok", "disabled", "unavailable"]),
  intent_summary: z.string().nullable().optional(),
  plain_english_explanation: z.string().nullable().optional(),
  pr_url: z.string().url().optional(),
  network_hosts: z.array(z.string()).default([]),
  diff_files: z.array(DiffFileSchema).default([]),
  created_at: z.string(),
  findings: z.array(FindingSchema).default([]),
  overrides: z.array(OverrideSchema).default([]),
});

export type VerdictDetailResponse = z.infer<typeof VerdictDetailSchema>;
