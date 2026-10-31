"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ErrorState =
  | { type: "NOT_IMPLEMENTED" }
  | { type: "ERROR"; message: string; requestId?: string }
  | null;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState>(null);

  const handleGitHubLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

    if (useMocks) {
      // In mock mode, set dev-only demo session cookie and navigate to /overview.
      // Must not call /api/auth/github/login.
      document.cookie = "ss_session=mock-dev-session; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "ss_demo=1; path=/; max-age=86400; SameSite=Lax";
      router.push("/overview");
      return;
    }

    try {
      const res = await fetch("/api/auth/github/login", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const headerRequestId = res.headers.get("X-Request-ID") || undefined;

      if (res.status === 501) {
        let isNotImplemented = true;
        try {
          const data = await res.json();
          if (data?.error?.code && data.error.code !== "NOT_IMPLEMENTED") {
            isNotImplemented = false;
          }
        } catch {
          // Status 501 defaults to not implemented
        }

        if (isNotImplemented) {
          setErrorState({ type: "NOT_IMPLEMENTED" });
          return;
        }
      }

      if (!res.ok) {
        let message = "An error occurred during sign-in. Please try again.";
        let requestId = headerRequestId;

        try {
          const data = await res.json();
          if (data?.error?.message) {
            message = data.error.message;
          }
          if (data?.error?.request_id) {
            requestId = data.error.request_id;
          }
        } catch {
          // Fall back if response is non-JSON
        }

        setErrorState({
          type: "ERROR",
          message,
          requestId: requestId || "unknown",
        });
        return;
      }

      // If ok, follow redirect if present
      const data = await res.json().catch(() => null);
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (err: unknown) {
      setErrorState({
        type: "ERROR",
        message: err instanceof Error ? err.message : "Network error. Please try again.",
        requestId: "unknown",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[12px] border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <Link
            href="/"
            className="text-xs font-medium text-[#6E6268] hover:text-[#B8556B] transition-colors inline-block mb-2"
          >
            SupplyShield
          </Link>
          <h1 className="text-2xl font-medium text-[#1E1A1C] tracking-tight">
            Sign in
          </h1>
          <p className="text-sm text-[#6E6268] leading-[1.6]">
            SupplyShield reads repository metadata, pull request diffs, and package manifests to detect supply chain risks.
          </p>
        </div>

        {errorState?.type === "NOT_IMPLEMENTED" && (
          <div
            role="alert"
            className="rounded-[12px] border border-[#F0DCE2] bg-[#FFF5F7] p-3 text-xs text-[#A3213F] leading-[1.6]"
          >
            <span>GitHub sign-in is not set up yet. </span>
            <Link
              href="/scan?demo=1"
              className="font-medium underline hover:text-[#801830] transition-colors"
            >
              Use the demo scan instead.
            </Link>
          </div>
        )}

        {errorState?.type === "ERROR" && (
          <div
            role="alert"
            className="rounded-[12px] border border-[#F0DCE2] bg-[#FFF5F7] p-3 text-xs text-[#A3213F] leading-[1.6] space-y-1"
          >
            <p>{errorState.message}</p>
            {errorState.requestId && (
              <p className="text-[11px] font-mono text-[#6E6268]">
                Request ID: {errorState.requestId}
              </p>
            )}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-[12px] bg-[#B8556B] hover:bg-[#A2485C] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] focus-visible:ring-offset-2 shadow-[0_1px_2px_rgba(30,26,28,0.04)] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />}
            <span>{isLoading ? "Signing in..." : "Sign in with GitHub"}</span>
          </button>
        </div>

        <p className="text-xs text-[#6E6268] text-center leading-[1.5]">
          SupplyShield never executes the code or package scripts it inspects.
        </p>
      </div>
    </main>
  );
}
