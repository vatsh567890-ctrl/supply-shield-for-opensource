"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GitPullRequest, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScanUrlSchema } from "@/lib/schemas/scan";
import { createAnalysis } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";

export interface DemoUrlChip {
  id: string;
  label: string;
  badge: "HIGH" | "MEDIUM" | "LOW";
  url: string;
}

export const DEMO_URL_CHIPS: DemoUrlChip[] = [
  {
    id: "demo-482",
    label: "cloud-infra-orchestrator #482",
    badge: "HIGH",
    url: "https://github.com/acme-corp/cloud-infra-orchestrator/pull/482",
  },
  {
    id: "demo-77",
    label: "web-tools #77",
    badge: "MEDIUM",
    url: "https://github.com/acme-corp/web-tools/pull/77",
  },
  {
    id: "demo-12",
    label: "docs-site #12",
    badge: "LOW",
    url: "https://github.com/acme-corp/docs-site/pull/12",
  },
];

export interface PrUrlFormProps {
  onSubmit?: (url: string) => void | Promise<void>;
  isLoading?: boolean;
}

export const PrUrlForm: React.FC<PrUrlFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const isSubmitting = isLoading || internalLoading;

  const handleChipClick = (chipUrl: string) => {
    setUrl(chipUrl);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = ScanUrlSchema.safeParse(url);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || "Invalid pull request URL.");
      return;
    }

    if (onSubmit) {
      try {
        await onSubmit(validation.data);
      } catch (err: unknown) {
        handleError(err);
      }
      return;
    }

    setInternalLoading(true);
    try {
      const res = await createAnalysis(validation.data);
      router.push(`/analyses/${res.analysis_id}`);
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.code === "APP_NOT_INSTALLED") {
        setErrorMsg(
          "The SupplyShield GitHub App is not installed on this repository. Please install the app on your GitHub organization."
        );
      } else if (err.code === "INVALID_PR_URL") {
        setErrorMsg(
          "The provided URL was rejected by the server. Format: https://github.com/{owner}/{repo}/pull/{number}"
        );
      } else {
        setErrorMsg(err.message || "Failed to trigger analysis.");
      }
    } else if (err instanceof Error) {
      setErrorMsg(err.message);
    } else {
      setErrorMsg("Network error communicating with analysis coordinator.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="pr-url-input"
          className="block text-sm font-medium text-[#1E1A1C] mb-2"
        >
          GitHub Pull Request URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E6268]">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <Input
            id="pr-url-input"
            type="url"
            required
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="https://github.com/owner/repo/pull/123"
            className="pl-10 font-mono text-sm"
            error={!!errorMsg}
            disabled={isSubmitting}
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-2.5 flex items-start gap-2 text-xs text-[#A3213F] p-3 rounded-[12px] bg-[#A3213F]/5 border border-[#A3213F]/20"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A3213F]" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Demo URL Chips */}
      <div>
        <span className="block text-xs font-medium text-[#6E6268] mb-2">
          Or try an example pull request:
        </span>
        <div className="flex flex-wrap gap-2">
          {DEMO_URL_CHIPS.map((chip) => {
            const badgeColors = {
              HIGH: "text-[#A3213F] bg-[#A3213F]/10 border-[#A3213F]/20",
              MEDIUM: "text-[#9A6410] bg-[#9A6410]/10 border-[#9A6410]/20",
              LOW: "text-[#2F7D5B] bg-[#2F7D5B]/10 border-[#2F7D5B]/20",
            };

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip.url)}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-[12px] bg-white hover:bg-[#FAF4F6] border border-[#F0DCE2] text-xs text-[#1E1A1C] transition-colors flex items-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(30,26,28,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B]"
              >
                <span className="font-mono">{chip.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColors[chip.badge]}`}
                >
                  {chip.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting || !url.trim()}
          className="w-full sm:w-auto min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              <span>Starting Scan...</span>
            </>
          ) : (
            <>
              <span>Scan Pull Request</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
