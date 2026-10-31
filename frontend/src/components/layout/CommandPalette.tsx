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
        icon: <Radar className="w-4 h-4 text-[#B8556B]" />,
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
        icon: <LayoutDashboard className="w-4 h-4 text-[#2F7D5B]" />,
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
        icon: <FolderGit2 className="w-4 h-4 text-[#B8556B]" />,
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
        icon: <Settings className="w-4 h-4 text-[#6E6268]" />,
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
        icon: <FolderGit2 className="w-4 h-4 text-[#B8556B]" />,
        action: () => {
          router.push(`/repos/${repo.owner}/${repo.name}`);
          onClose();
        },
      });
    });

    // Add Recent Verdicts
    recentVerdicts.forEach((v) => {
      const iconColor =
        v.level === "HIGH" ? "text-[#A3213F]" : v.level === "MEDIUM" ? "text-[#9A6410]" : "text-[#2F7D5B]";
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#1E1A1C]/30 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#F0DCE2] rounded-2xl max-w-xl w-full shadow-[0_20px_60px_rgba(30,26,28,0.15)] overflow-hidden">
        {/* Screen Reader Live Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {filtered.length === 0
            ? "No results found."
            : `${filtered.length} search results available. Use arrow keys to navigate.`}
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#F0DCE2] gap-3">
          <Search className="w-5 h-5 text-[#6E6268] shrink-0" />
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
            className="w-full bg-transparent text-sm text-[#1E1A1C] placeholder:text-[#6E6268] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded text-[#6E6268] hover:text-[#1E1A1C] transition-colors"
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
            <div className="p-8 text-center text-xs text-[#6E6268] font-mono">
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
                      ? "bg-[#FAF4F6] text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                      : "text-[#1E1A1C] hover:bg-[#FAF4F6] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? "bg-white border-[#F0DCE2]"
                          : "bg-[#FAF4F6] border-[#F0DCE2]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-[#6E6268] block truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF4F6] border border-[#F0DCE2] text-[#6E6268]">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 text-[#6E6268] transition-opacity ${
                        isSelected ? "opacity-100 text-[#B8556B]" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#F0DCE2] bg-[#FAF4F6] flex items-center justify-between text-[11px] text-[#6E6268] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white border border-[#F0DCE2] text-[#1E1A1C]">Up</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-white border border-[#F0DCE2] text-[#1E1A1C]">Down</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white border border-[#F0DCE2] text-[#1E1A1C]">Enter</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#F0DCE2] text-[#1E1A1C]">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
