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
      <div className="min-h-screen flex items-center justify-center bg-[#0A0920] text-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#7CF5FF]">
            Verifying Security Credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0920] text-white">
      {/* MOBILE TOPBAR (< 768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0E0C2B]/95 border-b border-[rgba(138,132,196,0.25)] px-4 py-3 flex items-center justify-between backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2D2A6E] border border-[#6C63FF]/50 flex items-center justify-center text-[#7CF5FF]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-white text-base">SupplyShield</span>
        </Link>

        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#B8556B]/15 text-[#B8556B] border border-[#B8556B]/30">
              Demo mode
            </span>
          )}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8A84C4]"
            aria-label="Open command palette"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8A84C4]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-30 bg-[#0A0920]/95 backdrop-blur-2xl p-6 flex flex-col justify-between border-b border-[rgba(138,132,196,0.3)] animate-in fade-in duration-200">
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
                      ? "bg-[#2D2A6E] text-[#7CF5FF] border border-[#6C63FF]/40 shadow-[0_0_15px_rgba(108,99,255,0.3)]"
                      : "text-[#A39EC8] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.1] overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image unoptimized src={user.avatar_url} alt={user.login} width={36} height={36} />
                ) : (
                  <span className="font-bold text-xs">
                    {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {isDemoMode ? "Demo Mode" : user?.login}
                </p>
                <p className="text-xs text-[#8A84C4]">
                  {isDemoMode ? "Guest Operator" : "Connected GitHub"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm text-[#F43F5E] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isDemoMode ? "Exit Demo" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (>= 768px) */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 bg-[#0D0B26]/90 border-r border-[rgba(138,132,196,0.25)] backdrop-blur-2xl transition-all duration-300 relative ${
          collapsed ? "w-20 p-4" : "w-64 p-6"
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D2A6E] to-[#0A0920] border border-[#6C63FF]/50 flex items-center justify-center text-[#7CF5FF] shrink-0 shadow-[0_0_15px_rgba(108,99,255,0.3)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-display font-bold text-lg text-white block truncate">
                    SupplyShield
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A84C4] block -mt-1 truncate">
                    SecOps Console
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8A84C4] hover:text-white border border-white/[0.06] transition-colors"
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
                      ? "bg-[#2D2A6E] text-[#7CF5FF] border border-[#6C63FF]/40 shadow-[0_0_15px_rgba(108,99,255,0.25)]"
                      : "text-[#A39EC8] hover:bg-white/[0.05] hover:text-white"
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
        <div className="pt-4 border-t border-white/[0.08]">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[#7CF5FF] shrink-0" />
                  <span className="text-xs font-mono font-medium text-white truncate">
                    {isDemoMode ? "demo-sandbox" : "acme-corp"}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#34D399]" title="Connected organization" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] overflow-hidden flex items-center justify-center shrink-0">
                    {user?.avatar_url ? (
                      <Image unoptimized src={user.avatar_url} alt={user.login} width={32} height={32} />
                    ) : (
                      <span className="font-bold text-xs">
                        {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {isDemoMode ? "Demo Mode" : user?.login}
                    </p>
                    <p className="text-[10px] text-[#8A84C4] font-mono">
                      {isDemoMode ? "Guest Operator" : "SecOps Lead"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title={isDemoMode ? "Exit Demo" : "Sign out"}
                  className="p-1.5 rounded-lg text-[#8A84C4] hover:text-[#F43F5E] hover:bg-white/[0.04] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image unoptimized src={user.avatar_url} alt={user.login} width={32} height={32} />
                ) : (
                  <span className="font-bold text-xs">
                    {isDemoMode ? "DM" : user?.login?.slice(0, 2).toUpperCase() || "SS"}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                title={isDemoMode ? "Exit Demo" : "Sign out"}
                className="p-1.5 rounded-lg text-[#8A84C4] hover:text-[#F43F5E] hover:bg-white/[0.04] transition-colors"
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
        <header className="hidden md:flex h-16 bg-[#0E0C2B]/80 border-b border-[rgba(138,132,196,0.2)] px-8 items-center justify-between backdrop-blur-xl">
          {/* Command Palette Trigger */}
          <button
            data-testid="command-palette-trigger"
            aria-label="Search commands and repositories"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-[rgba(138,132,196,0.25)] text-xs text-[#A39EC8] hover:text-white transition-all w-72 justify-between cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#7CF5FF]" />
              <span>Search repos, actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.1] font-mono text-[10px] text-[#8A84C4]">
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
            <div className="flex items-center gap-2 text-xs font-mono text-[#7CF5FF] px-3 py-1 rounded-full bg-[#7CF5FF]/10 border border-[#7CF5FF]/30">
              <span className="w-2 h-2 rounded-full bg-[#7CF5FF] animate-live-pulse" />
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
