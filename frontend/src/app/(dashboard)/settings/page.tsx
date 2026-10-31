"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Building2,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { fetchMe, fetchMyInstallations, logout } from "@/lib/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: user,
    isLoading: loadingUser,
    isError: errorUser,
    error: userErrorObj,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const {
    data: installations = [],
    isLoading: loadingInst,
    isError: errorInst,
    error: instErrorObj,
    refetch: refetchInst,
  } = useQuery({
    queryKey: ["installations"],
    queryFn: fetchMyInstallations,
  });

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // Ignored: proceed to clear local cookies and redirect regardless
    }

    if (typeof document !== "undefined") {
      document.cookie = "ss_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "ss_demo=; path=/; max-age=0; SameSite=Lax";
    }

    toast({
      type: "info",
      title: "Session Terminated",
      message: "You have been safely signed out.",
    });

    router.push("/login");
  };

  return (
    <div className="space-y-8 max-w-4xl py-2">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-medium text-[#1E1A1C] tracking-tight">
          Account &amp; Perimeter Settings
        </h1>
        <p className="text-sm text-[#6E6268] mt-1.5 leading-relaxed">
          Manage your authenticated identity, GitHub App organization access, and session policies.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0DCE2]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#B8556B]" />
            <h2 className="text-lg font-medium text-[#1E1A1C]">
              Authenticated Identity
            </h2>
          </div>
          <span className="text-xs font-mono text-[#2F7D5B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" />
            Active Session
          </span>
        </div>

        {loadingUser ? (
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ) : errorUser ? (
          <ErrorState
            title="Unable to load profile"
            message={userErrorObj instanceof Error ? userErrorObj.message : "Failed to load authenticated identity."}
            onRetry={() => refetchUser()}
          />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image
                    unoptimized
                    src={user.avatar_url}
                    alt={user.login || "User avatar"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg text-[#1E1A1C]">
                    {user?.login ? user.login.slice(0, 2).toUpperCase() : "SS"}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-medium text-[#1E1A1C]">
                  {user?.login ?? "Unknown User"}
                </h3>
                <p className="text-xs font-mono text-[#6E6268] mt-0.5">
                  GitHub ID: {user?.github_id ?? "—"}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#6E6268] mt-2 font-mono">
                  <span>Joined: {user?.created_at ? formatDate(user.created_at) : "—"}</span>
                  <span>•</span>
                  <span>Last active: {user?.last_login_at ? formatRelativeTime(user.last_login_at) : "Just now"}</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="shrink-0 text-[#A3213F] hover:bg-[#A3213F]/5 border-[#F0DCE2]"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </Card>

      {/* GitHub App Installations List */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0DCE2]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#B8556B]" />
            <div>
              <h2 className="text-lg font-medium text-[#1E1A1C]">
                GitHub App Installations
              </h2>
              <span className="text-xs text-[#6E6268]">
                Organizations and personal accounts granting SupplyShield scan permissions
              </span>
            </div>
          </div>

          <a
            href="https://github.com/apps/supplyshield-security"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              <span>Install on Organization</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
        </div>

        {loadingInst ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-[12px]" />
            <Skeleton className="h-16 w-full rounded-[12px]" />
          </div>
        ) : errorInst ? (
          <ErrorState
            title="Unable to load installations"
            message={instErrorObj instanceof Error ? instErrorObj.message : "Failed to load GitHub App installations."}
            onRetry={() => refetchInst()}
          />
        ) : installations.length === 0 ? (
          <EmptyState
            title="No installations found"
            description="No GitHub App installations found for this account. Install the GitHub App on your repositories or organization to start scanning."
          />
        ) : (
          <div className="space-y-3">
            {installations.map((inst) => {
              const isSuspended = inst.suspended_at !== null && inst.suspended_at !== undefined;

              return (
                <div
                  key={inst.id}
                  className="p-4 sm:p-5 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[10px] bg-[#FAF4F6] border border-[#F0DCE2] flex items-center justify-center text-[#B8556B]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-base text-[#1E1A1C]">
                          {inst.account_login}
                        </span>
                        {isSuspended ? (
                          <Badge level="HIGH">Suspended</Badge>
                        ) : (
                          <Badge level="LOW">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#6E6268] mt-1">
                        <span>Type: {inst.account_type}</span>
                        <span>•</span>
                        <span>Installation ID: {inst.github_installation_id}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://github.com/organizations/${inst.account_login}/settings/installations/${inst.github_installation_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <span>Manage Access</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
