"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  LayoutDashboard,
  Radar,
  FolderGit2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { fetchMe, logout } from "@/lib/api/endpoints";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Spinner } from "@/components/ui/Spinner";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ChatErrorBoundary } from "@/components/chat/ChatErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Check if running in mock demo mode
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("ss_demo=1"));
      const hasQuery = window.location.search.includes("demo=1");
      return hasCookie || hasQuery;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("ss_demo=1"));
      const hasQuery = window.location.search.includes("demo=1");
      if (hasCookie || hasQuery) {
        setIsDemoMode(true);
      }
    }
  }, []);

  // Authentication check: disabled in demo mode
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    enabled: !isDemoMode,
  });

  useEffect(() => {
    if (!isDemoMode && isError) {
      router.push("/login");
    }
  }, [isDemoMode, isError, router]);

  // Global shortcut for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // Ignored: proceed to redirect regardless
    }
    // Clear demo cookie on sign out
    if (typeof document !== "undefined") {
      document.cookie = "ss_demo=; path=/; max-age=0";
    }
    router.push("/login");
  };

  const navLinks = [
    { href: "/overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { href: "/scan", label: "Scan", icon: <Radar className="w-5 h-5 shrink-0" /> },
    { href: "/repos", label: "Repositories", icon: <FolderGit2 className="w-5 h-5 shrink-0" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

  if (isLoading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-[#1E1A1C]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#B8556B]">
            Verifying Security Credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent text-[#1E1A1C]">
      {/* MOBILE TOPBAR (< 768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 border-b border-[#F0DCE2] px-4 py-3 flex items-center justify-between backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF4F6] border border-[#F0DCE2] flex items-center justify-center text-[#B8556B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-[#1E1A1C] text-base">SupplyShield</span>
        </Link>

        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#B8556B]/15 text-[#B8556B] border border-[#B8556B]/30">
              Demo mode
            </span>
          )}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg bg-white border border-[#F0DCE2] text-[#6E6268] hover:text-[#1E1A1C]"
            aria-label="Open command palette"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-white border border-[#F0DCE2] text-[#6E6268] hover:text-[#1E1A1C]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#1E1A1C]" /> : <Menu className="w-5 h-5 text-[#1E1A1C]" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-30 bg-white/95 backdrop-blur-2xl p-6 flex flex-col justify-between border-b border-[#F0DCE2] animate-in fade-in duration-200">
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href === "/overview" && pathname === "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#FAF4F6] text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                      : "text-[#6E6268] hover:bg-[#FAF4F6] hover:text-[#1E1A1C]"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-[#F0DCE2] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image unoptimized src={user.avatar_url} alt={user.login} width={36} height={36} />
                ) : (
                  <span className="font-bold text-xs text-[#1E1A1C]">
                    {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1E1A1C] truncate">
                  {isDemoMode ? "Demo Mode" : user?.login}
                </p>
                <p className="text-xs text-[#6E6268]">
                  {isDemoMode ? "Guest Operator" : "Connected GitHub"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#A3213F]/5 border border-[#F0DCE2] text-sm text-[#A3213F] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isDemoMode ? "Exit Demo" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (>= 768px) */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 bg-white/80 border-r border-[#F0DCE2] backdrop-blur-2xl transition-all duration-300 relative ${
          collapsed ? "w-20 p-4" : "w-64 p-6"
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] flex items-center justify-center text-[#B8556B] shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-display font-bold text-lg text-[#1E1A1C] block truncate">
                    SupplyShield
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6268] block -mt-1 truncate">
                    SecOps Console
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-lg bg-white hover:bg-[#FAF4F6] text-[#6E6268] hover:text-[#1E1A1C] border border-[#F0DCE2] transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href === "/overview" && pathname === "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#FAF4F6] text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                      : "text-[#6E6268] hover:bg-[#FAF4F6] hover:text-[#1E1A1C]"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  {link.icon}
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Org & User Info */}
        <div className="pt-4 border-t border-[#F0DCE2]">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-white border border-[#F0DCE2] flex items-center justify-between shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[#B8556B] shrink-0" />
                  <span className="text-xs font-mono font-medium text-[#1E1A1C] truncate">
                    {isDemoMode ? "demo-sandbox" : "acme-corp"}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" title="Connected organization" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] overflow-hidden flex items-center justify-center shrink-0">
                    {user?.avatar_url ? (
                      <Image unoptimized src={user.avatar_url} alt={user.login} width={32} height={32} />
                    ) : (
                      <span className="font-bold text-xs text-[#1E1A1C]">
                        {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1E1A1C] truncate">
                      {isDemoMode ? "Demo Mode" : user?.login}
                    </p>
                    <p className="text-[10px] text-[#6E6268] font-mono">
                      {isDemoMode ? "Guest Operator" : "SecOps Lead"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title={isDemoMode ? "Exit Demo" : "Sign out"}
                  className="p-1.5 rounded-lg text-[#6E6268] hover:text-[#A3213F] hover:bg-[#A3213F]/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image unoptimized src={user.avatar_url} alt={user.login} width={32} height={32} />
                ) : (
                  <span className="font-bold text-xs text-[#1E1A1C]">
                    {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                title={isDemoMode ? "Exit Demo" : "Sign out"}
                className="p-1.5 rounded-lg text-[#6E6268] hover:text-[#A3213F] hover:bg-[#A3213F]/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOPBAR */}
        <header className="hidden md:flex h-16 bg-white/80 border-b border-[#F0DCE2] px-8 items-center justify-between backdrop-blur-xl">
          {/* Command Palette Trigger */}
          <button
            data-testid="command-palette-trigger"
            aria-label="Search commands and repositories"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF4F6] border border-[#F0DCE2] text-xs text-[#6E6268] hover:text-[#1E1A1C] transition-all w-72 justify-between cursor-pointer shadow-[0_1px_2px_rgba(30,26,28,0.04)]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#B8556B]" />
              <span>Search repos, actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#FAF4F6] border border-[#F0DCE2] font-mono text-[10px] text-[#6E6268]">
              Cmd+K
            </kbd>
          </button>

          {/* Topbar Right Status */}
          <div className="flex items-center gap-4">
            {isDemoMode && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#B8556B]/15 text-[#B8556B] border border-[#B8556B]/30">
                Demo mode
              </span>
            )}
            <div className="flex items-center gap-2 text-xs font-mono text-[#2F7D5B] px-3 py-1 rounded-full bg-[#2F7D5B]/10 border border-[#2F7D5B]/30">
              <span className="w-2 h-2 rounded-full bg-[#2F7D5B] animate-live-pulse" />
              <span>Perimeter: SECURE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Help Assistant Chat Widget (Hidden behind NEXT_PUBLIC_SHOW_CHAT=false until gate confirmation) */}
      {process.env.NEXT_PUBLIC_SHOW_CHAT === "true" && (
        <ChatErrorBoundary>
          <ChatWidget />
        </ChatErrorBoundary>
      )}
    </div>
  );
}
