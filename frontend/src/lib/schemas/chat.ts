import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message must be at most 500 characters"),
  verdict_id: z.string().uuid("Invalid verdict UUID").nullable().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  reply: z.string(),
  source: z.enum(["llm", "faq", "refused"]),
  ai_status: z.enum(["ok", "disabled", "unavailable"]),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

