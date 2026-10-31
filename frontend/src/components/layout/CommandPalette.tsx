"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Radar,
  FolderGit2,
  LayoutDashboard,
  Settings,
  ArrowRight,
  X,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { fetchRepos } from "@/lib/api/endpoints";

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Actions" | "Repositories" | "Verdicts";
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch repos for command palette search
  const { data: repos = [] } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
    enabled: open,
  });

  // Recent verdicts mock references
  const recentVerdicts = useMemo(() => [
    {
      id: "11111111-1111-4111-8111-111111111111",
      pr: "PR #142 (cloud-infra-orchestrator)",
      score: 92,
      level: "HIGH",
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      pr: "PR #88 (auth-gateway-service)",
      score: 54,
      level: "MEDIUM",
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      pr: "PR #35 (frontend-portal)",
      score: 12,
      level: "LOW",
    },
  ], []);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      {
        id: "nav-scan",
        title: "Scan Pull Request",
        subtitle: "Analyze a new PR security risk",
        category: "Actions",
        icon: <Radar className="w-4 h-4 text-[#7CF5FF]" />,
        action: () => {
          router.push("/scan");
          onClose();
        },
      },
      {
        id: "nav-overview",
        title: "Security Overview",
        subtitle: "Executive metrics and live feed",
        category: "Navigation",
        icon: <LayoutDashboard className="w-4 h-4 text-[#34D399]" />,
        action: () => {
          router.push("/overview");
          onClose();
        },
      },
      {
        id: "nav-repos",
        title: "Repositories",
        subtitle: "Monitored codebases and trends",
        category: "Navigation",
        icon: <FolderGit2 className="w-4 h-4 text-[#6C63FF]" />,
        action: () => {
          router.push("/repos");
          onClose();
        },
      },
      {
        id: "nav-settings",
        title: "Organization Settings",
        subtitle: "Manage installations and account",
        category: "Navigation",
        icon: <Settings className="w-4 h-4 text-[#A39EC8]" />,
        action: () => {
          router.push("/settings");
          onClose();
        },
      },
    ];

    // Add Repositories
    repos.forEach((repo) => {
      list.push({
        id: `repo-${repo.id}`,
        title: `${repo.owner}/${repo.name}`,
        subtitle: `Score: ${repo.latest_score ?? "N/A"} (${repo.latest_level ?? "None"}) • Branch: ${repo.default_branch}`,
        category: "Repositories",
        icon: <FolderGit2 className="w-4 h-4 text-[#7CF5FF]" />,
        action: () => {
          router.push(`/repos/${repo.owner}/${repo.name}`);
          onClose();
        },
      });
    });

    // Add Recent Verdicts
    recentVerdicts.forEach((v) => {
      const iconColor =
        v.level === "HIGH" ? "text-[#F43F5E]" : v.level === "MEDIUM" ? "text-[#FBBF24]" : "text-[#34D399]";
      list.push({
        id: `verdict-${v.id}`,
        title: `Verdict: ${v.pr}`,
        subtitle: `Risk score: ${v.score} (${v.level})`,
        category: "Verdicts",
        icon:
          v.level === "HIGH" ? (
            <ShieldAlert className={`w-4 h-4 ${iconColor}`} />
          ) : v.level === "MEDIUM" ? (
            <Shield className={`w-4 h-4 ${iconColor}`} />
          ) : (
            <ShieldCheck className={`w-4 h-4 ${iconColor}`} />
          ),
        action: () => {
          router.push(`/verdicts/${v.id}`);
          onClose();
        },
      });
    });

    return list;
  }, [router, onClose, repos, recentVerdicts]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [items, query]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, filtered, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0A0920]/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0E0C2B] border border-[rgba(138,132,196,0.35)] rounded-2xl max-w-xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(108,99,255,0.2)] overflow-hidden">
        {/* Screen Reader Live Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {filtered.length === 0
            ? "No results found."
            : `${filtered.length} search results available. Use arrow keys to navigate.`}
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-[#8A84C4] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={true}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={
              filtered.length > 0 && selectedIndex >= 0 ? `command-item-${selectedIndex}` : undefined
            }
            placeholder="Search commands, repositories, verdicts... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="command-palette-input"
            className="w-full bg-transparent text-sm text-white placeholder:text-[#716C9B] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded text-[#8A84C4] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          aria-label="Command suggestions"
          className="p-2 max-h-80 overflow-y-auto space-y-1 focus:outline-none"
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8A84C4] font-mono">
              No matching commands or entities found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`command-item-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] text-[#7CF5FF] border border-[#6C63FF]/30 shadow-[0_0_15px_rgba(108,99,255,0.15)]"
                      : "text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? "bg-[#2D2A6E] border-[#6C63FF]/50"
                          : "bg-white/[0.04] border-white/[0.08]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-[#8A84C4] block truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/[0.08] text-[#716C9B]">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 text-[#8A84C4] transition-opacity ${
                        isSelected ? "opacity-100 text-[#7CF5FF]" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-[11px] text-[#716C9B] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white">Up</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white">Down</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white">Enter</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
