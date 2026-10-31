import { apiClient } from "./client";
import { UserProfile, UserProfileSchema, Installation, InstallationSchema } from "../schemas/auth";
import { RepoSummaryResponse, RepoSummarySchema, RepoTrendsResponse, RepoTrendsSchema } from "../schemas/repos";
import { CreateAnalysisResponse, CreateAnalysisResponseSchema, AnalysisStatusResponse, AnalysisStatusSchema } from "../schemas/analyses";
import { VerdictDetailResponse, VerdictDetailSchema, OverrideResponse, OverrideSchema } from "../schemas/verdicts";
import { ChatRequest, ChatResponse, chatResponseSchema } from "../schemas/chat";
import { z } from "zod";

export async function fetchMe(): Promise<UserProfile> {
  const data = await apiClient<unknown>("/me");
  return UserProfileSchema.parse(data);
}

export async function fetchMyInstallations(): Promise<Installation[]> {
  const data = await apiClient<unknown>("/me/installations");
  return z.array(InstallationSchema).parse(data);
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiClient<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function fetchRepos(): Promise<RepoSummaryResponse[]> {
  const data = await apiClient<unknown>("/repos");
  return z.array(RepoSummarySchema).parse(data);
}

export async function fetchRepoTrends(owner: string, repo: string, days: number = 30): Promise<RepoTrendsResponse> {
  const data = await apiClient<unknown>(`/repos/${owner}/${repo}/trends`, {
    params: { days },
  });
  return RepoTrendsSchema.parse(data);
}

export async function fetchRepoVerdicts(owner: string, repo: string): Promise<VerdictDetailResponse[]> {
  const data = await apiClient<unknown>(`/repos/${owner}/${repo}/verdicts`);
  return z.array(VerdictDetailSchema).parse(data);
}

export async function createAnalysis(prUrl: string): Promise<CreateAnalysisResponse> {
  const data = await apiClient<unknown>("/analyses", {
    method: "POST",
    body: JSON.stringify({ pr_url: prUrl }),
  });
  return CreateAnalysisResponseSchema.parse(data);
}

export async function fetchAnalysis(id: string): Promise<AnalysisStatusResponse> {
  const data = await apiClient<unknown>(`/analyses/${id}`);
  return AnalysisStatusSchema.parse(data);
}

export async function fetchVerdict(id: string): Promise<VerdictDetailResponse> {
  const data = await apiClient<unknown>(`/verdicts/${id}`);
  return VerdictDetailSchema.parse(data);
}

export async function createOverride(
  verdictId: string,
  action: "accept" | "reject",
  reason: string
): Promise<OverrideResponse> {
  const data = await apiClient<unknown>(`/verdicts/${verdictId}/overrides`, {
    method: "POST",
    body: JSON.stringify({ action, reason }),
  });
  return OverrideSchema.parse(data);
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const data = await apiClient<unknown>("/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return chatResponseSchema.parse(data);
}
