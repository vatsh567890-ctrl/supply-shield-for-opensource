import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import SettingsPage from "@/app/(dashboard)/settings/page";
import * as endpoints from "@/lib/api/endpoints";
import { UserProfile, Installation } from "@/lib/schemas/auth";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUser: UserProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  github_id: 1234567,
  login: "sec-ops-lead",
  avatar_url: "https://avatars.githubusercontent.com/u/1234567?v=4",
  created_at: "2026-01-15T10:00:00Z",
  last_login_at: "2026-10-30T18:30:00Z",
};

const mockInstallations: Installation[] = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    github_installation_id: 987654,
    account_login: "acme-corp",
    account_type: "Organization",
    suspended_at: null,
    created_at: "2026-01-20T12:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    github_installation_id: 987655,
    account_login: "legacy-partner-sandbox",
    account_type: "Organization",
    suspended_at: "2026-09-01T08:00:00Z",
    created_at: "2025-11-10T14:00:00Z",
  },
];

describe("SettingsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockPush.mockClear();
    vi.restoreAllMocks();
    document.cookie = "ss_session=; path=/; max-age=0";
    document.cookie = "ss_demo=; path=/; max-age=0";

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <SettingsPage />
        </ToastProvider>
      </QueryClientProvider>
    );
  };

  it("renders loading skeleton state while queries are pending", () => {
    vi.spyOn(endpoints, "fetchMe").mockReturnValue(new Promise(() => {}));
    vi.spyOn(endpoints, "fetchMyInstallations").mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText("Account & Perimeter Settings")).toBeDefined();
    expect(screen.getByText("Authenticated Identity")).toBeDefined();
    // Skeleton elements exist
    const skeletons = document.querySelectorAll(".animate-shimmer");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders success state with profile and active/suspended installation badges", async () => {
    vi.spyOn(endpoints, "fetchMe").mockResolvedValue(mockUser);
    vi.spyOn(endpoints, "fetchMyInstallations").mockResolvedValue(mockInstallations);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("sec-ops-lead")).toBeDefined();
      expect(screen.getByText(/GitHub ID: 1234567/)).toBeDefined();
    });

    expect(screen.getByText("acme-corp")).toBeDefined();
    expect(screen.getByText("legacy-partner-sandbox")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Suspended")).toBeDefined();
  });

  it("renders empty state when zero installations are returned", async () => {
    vi.spyOn(endpoints, "fetchMe").mockResolvedValue(mockUser);
    vi.spyOn(endpoints, "fetchMyInstallations").mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No installations found")).toBeDefined();
    });
  });

  it("renders error state with retry button on API failure (e.g. 401), without crashing", async () => {
    vi.spyOn(endpoints, "fetchMe").mockRejectedValue(new Error("Authentication failed: 401 Unauthorized"));
    vi.spyOn(endpoints, "fetchMyInstallations").mockRejectedValue(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Unable to load profile")).toBeDefined();
      expect(screen.getByText(/401 Unauthorized/)).toBeDefined();
      expect(screen.getByText("Unable to load installations")).toBeDefined();
    });

    const retryButtons = screen.getAllByRole("button", { name: /try again/i });
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it("handles sign out by clearing cookies and redirecting to /login", async () => {
    document.cookie = "ss_session=mock-dev-session; path=/";
    document.cookie = "ss_demo=1; path=/";

    vi.spyOn(endpoints, "fetchMe").mockResolvedValue(mockUser);
    vi.spyOn(endpoints, "fetchMyInstallations").mockResolvedValue(mockInstallations);
    const logoutSpy = vi.spyOn(endpoints, "logout").mockResolvedValue({ ok: true });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("sec-ops-lead")).toBeDefined();
    });

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
