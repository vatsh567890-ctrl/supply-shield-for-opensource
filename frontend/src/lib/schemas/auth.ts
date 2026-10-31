import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  github_id: z.number(),
  login: z.string(),
  avatar_url: z.string().nullable().optional(),
  created_at: z.string(),
  last_login_at: z.string().nullable().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const InstallationSchema = z.object({
  id: z.string().uuid(),
  github_installation_id: z.number(),
  account_login: z.string(),
  account_type: z.string(),
  suspended_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export type Installation = z.infer<typeof InstallationSchema>;
