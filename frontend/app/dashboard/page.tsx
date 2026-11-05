"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThinkingOrb } from "thinking-orbs";
import {
  LayoutGrid,
  FolderGit2,
  Plus,
  LogOut,
  GitBranch,
  Bot,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Shield,
  Layers,
  Activity,
  Terminal,
  BookOpen,
  Settings,
  Copy,
  Check,
  ChevronDown,
  Clock,
  Lock,
  HelpCircle,
  Command,
  Loader2,
  Sliders,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { ProjectRecord, GitHubRepo } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { HeroRadialLight } from "@/components/landing/HeroRadialLight";
import { api } from "@/lib/api";

/** Render authenticated user dashboard and repository selection with serverboard integration. */
export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "failed">("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeSectionOpen, setActiveSectionOpen] = useState(true);
  const [failedSectionOpen, setFailedSectionOpen] = useState(true);

  // Payment cancelled/failed banner
  const [paymentBanner, setPaymentBanner] = useState<{ type: "cancelled" | "failed"; message: string } | null>(null);

  // Detect payment status query param via window.location (avoids SSR Suspense requirement)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "cancelled") {
      setPaymentBanner({ type: "cancelled", message: "Payment was cancelled. No charges were made." });
      window.history.replaceState({}, "", "/dashboard");
      setTimeout(() => setPaymentBanner(null), 8000);
    } else if (paymentStatus === "failed") {
      setPaymentBanner({ type: "failed", message: "Payment failed. Please try again or contact support." });
      window.history.replaceState({}, "", "/dashboard");
      setTimeout(() => setPaymentBanner(null), 8000);
    }
  }, []);

  // Billing / Plan Tier
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [planTier, setPlanTier] = useState<"free" | "pro" | "unknown">("unknown");
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [customRepoName, setCustomRepoName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [agentCount, setAgentCount] = useState<number>(4);
  const [branchName, setBranchName] = useState("main");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      // 1. Fetch authenticated user profile from serverboard
      try {
        const meRes = await api.auth.me();
        if (isSubscribed && meRes?.user) {
          setUser(meRes.user);
          if (meRes.user.plan_tier) {
            setPlanTier(meRes.user.plan_tier === "pro" ? "pro" : "free");
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          router.push("/login");
          return;
        }
      }

      // 2. Fetch projects from serverboard API
      try {
        const projRes = await api.projects.list();
        if (isSubscribed && projRes?.projects) {
          setProjects(projRes.projects);
        }
      } catch (err: any) {
        console.warn("[projects] Failed to fetch projects:", err.message);
      }

      // 3. Fetch billing entitlement status
      try {
        const billing = await api.billing.getStatus();
        if (isSubscribed && billing) {
          setPlanTier(billing.planTier);
          setDaysRemaining(billing.daysRemaining ?? null);
          setIsExpired(Boolean(billing.expired));
        }
      } catch (err: any) {
        console.warn("[billing] Could not fetch billing status:", err.message);
        // Do not force "free" if auth profile already verified pro
        if (isSubscribed && planTier === "unknown") {
          setPlanTier("free");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  // Auto-refresh when any project is in deploying/pending state
  useEffect(() => {
    const hasDeploying = projects.some(
      (p) => p.status === "deploying" || p.status === "pending"
    );
    if (!hasDeploying) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.projects.list();
        if (res?.projects) {
          setProjects(res.projects);
        }
      } catch {}
    }, 6000);

    return () => clearInterval(interval);
  }, [projects]);

  const fetchGithubRepos = async () => {
    setReposLoading(true);
    setGithubError(null);
    try {
      const res = await api.github.listRepos();
      if (res?.repos && Array.isArray(res.repos)) {
        setRepos(res.repos);
      } else {
        setRepos([]);
      }
    } catch (err: any) {
      console.warn("[github] Could not fetch repos:", err.message);
      setGithubError(err.message || "Failed to load GitHub repositories");
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (loading) return;
    // Only intercept if confirmed Free tier. If status is unknown, allow attempt and let backend enforce.
    if (planTier === "free" && projects.length >= 2) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setSelectedRepo(null);
    setRepoSearch("");
    setModalStep(1);
    setIsModalOpen(true);
    fetchGithubRepos();
  };

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setProjectName(repo.name);
    setBranchName(repo.default_branch || "main");
    setModalStep(2);
  };

  const handleSelectCustomRepo = () => {
    if (!customRepoName.trim()) return;
    const parts = customRepoName.trim().split("/");
    const repoName = parts[parts.length - 1] || "custom-project";
    const customRepo: GitHubRepo = {
      id: Date.now(),
      name: repoName,
      full_name: customRepoName.trim(),
      owner: { login: parts[0] || "custom", avatar_url: "" },
      private: false,
      html_url: `https://github.com/${customRepoName.trim()}`,
      description: "Custom connected repository for Latch Swarm",
      language: "TypeScript",
      default_branch: "main",
      updated_at: new Date().toISOString(),
    };
    setSelectedRepo(customRepo);
    setProjectName(repoName);
    setBranchName("main");
    setModalStep(2);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setSubmitting(true);
    setCreateError(null);

    try {
      const res = await api.projects.create({
        projectName: projectName.trim(),
        repo: selectedRepo?.html_url || (customRepoName.trim() ? `https://github.com/${customRepoName.trim()}` : undefined),
        branch: branchName || "main",
        agentLimit: agentCount,
      });

      // Add the project directly to UI state with deploying status
      if (res?.project) {
        setProjects((prev) => [res.project, ...prev.filter((p) => p.id !== res.project.id)]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("[projects] Create project failed:", err.message);
      setCreateError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEndpoint = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSignOut = async () => {
    await api.auth.logout();
    router.push("/login");
  };

  const displayedProjects = projects.filter((p) =>
    p.project_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.repo_name && p.repo_name.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const activeProjects = displayedProjects.filter((p) => p.status !== "failed");
  const failedProjects = displayedProjects.filter((p) => p.status === "failed");

  const filteredRepos = repos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-[var(--font-body)] antialiased transition-colors duration-200 relative overflow-hidden">
      {/* Signature Ambient Radial Light Glow */}
      <HeroRadialLight colorMode="brown" position="center" topClass="top-[180px] sm:top-[220px] md:top-[260px]" />

      {/* 1. SLIDING MENU BAR DRAWER (Hidden by default, slides in smoothly) */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-sidebar border-r border-sidebar-border shadow-2xl flex flex-col justify-between py-5 px-4 transition-transform duration-300 ease-in-out select-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-5 w-full">
          {/* Drawer Header with Logo and Close Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              title="latch.it"
            >
              <Image
                src="/latch-logo.png"
                alt="latch.it"
                width={120}
                height={28}
                className="h-7 w-auto object-contain dark:invert"
                priority
              />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                v2.4
              </span>
            </Link>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
              title="Close menu slider"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation items with large icons & menu names beside them */}
          <nav className="flex flex-col gap-1.5 w-full">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-3 py-1">
              Navigation
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm transition-all cursor-pointer"
            >
              <LayoutGrid className="w-5.5 h-5.5 shrink-0 text-primary" />
              <span className="flex-1 text-left">All Projects</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/#features");
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all cursor-pointer text-sm font-medium"
            >
              <Shield className="w-5.5 h-5.5 shrink-0" />
              <span className="flex-1 text-left">Architecture & Protocol</span>
            </button>

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/#stream");
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all cursor-pointer text-sm font-medium"
            >
              <Activity className="w-5.5 h-5.5 shrink-0" />
              <span className="flex-1 text-left">Telemetry Stream</span>
              <span className="w-2 h-2 rounded-full bg-primary" />
            </button>

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/#evolution");
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all cursor-pointer text-sm font-medium"
            >
              <Bot className="w-5.5 h-5.5 shrink-0" />
              <span className="flex-1 text-left">Agent Swarms</span>
            </button>

            <a
              href="https://github.com/unknownsideofme/LATCH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all text-sm font-medium"
            >
              <BookOpen className="w-5.5 h-5.5 shrink-0" />
              <span className="flex-1 text-left">Documentation</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60" />
            </a>
          </nav>
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex flex-col gap-3 w-full pt-4 border-t border-sidebar-border">
          {/* Daemon Connectivity Badge */}
          <div className="p-3 rounded-xl bg-card border border-sidebar-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-sm" />
              <span className="text-foreground font-medium">Daemon :3001</span>
            </div>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
              ONLINE
            </span>
          </div>

          {/* User Info */}
          <div className="px-2 py-1 text-xs font-mono text-muted-foreground truncate">
            Signed in as <span className="text-foreground">{user?.email || "developer"}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full text-sm font-medium"
          >
            <LogOut className="w-5.5 h-5.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA (Full Width, Zero Side Margins) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background w-full">
        {/* Supabase Studio Top Navigation Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Menu Bar Slider Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm group"
              title="Open menu slider"
              aria-label="Open menu slider"
            >
              <Sliders className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-xs font-mono font-medium hidden sm:inline">Menu</span>
            </button>

            {/* Latch Logo & Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:opacity-85 transition-opacity"
              title="latch.it"
            >
              <Image
                src="/latch-logo.png"
                alt="latch.it"
                width={110}
                height={26}
                className="h-6 sm:h-7 w-auto object-contain dark:invert"
                priority
              />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border hidden sm:inline">
                v2.4
              </span>
            </Link>

            {/* Org Switcher Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground/60">/</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none">
                {user?.email?.split("@")[0] || "personal-org"}
              </span>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                All Projects
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Daemon Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-[11px] font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Daemon :3001</span>
            </div>

            <a
              href="https://github.com/unknownsideofme/LATCH"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </a>

            {/* Pro Swarm Badge or Upgrade CTA */}
            {planTier === "pro" ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/40 text-[11px] font-mono text-primary font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro Swarm{daysRemaining !== null ? ` · ${daysRemaining}d left` : ""}</span>
              </div>
            ) : (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </button>
            )}

            {/* New Project Button */}
            <button
              onClick={handleOpenModal}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>New project</span>
            </button>
          </div>
        </header>

        {/* Studio Content Body - Refined Width with Side Breathing Room */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-10 relative z-10">
          {/* Expiration Alert if 30-Day Pro Pass Expired */}
          {isExpired && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Your 30-day Pro Swarm pass has expired. Free tier is active (2 projects maximum).</span>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-3 py-1 rounded bg-amber-500 text-black font-semibold text-[11px] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Renew Pro Pass
              </button>
            </div>
          )}

          {/* Payment Cancelled / Failed Banner */}
          {paymentBanner && (
            <div
              className={`p-3.5 rounded-lg flex items-center justify-between text-xs font-mono animate-in slide-in-from-top-2 duration-300 ${
                paymentBanner.type === "cancelled"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-500"
                  : "bg-destructive/10 border border-destructive/30 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{paymentBanner.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className={`px-3 py-1 rounded font-semibold text-[11px] transition-opacity cursor-pointer ${
                    paymentBanner.type === "cancelled"
                      ? "bg-amber-500 text-black hover:opacity-90"
                      : "bg-destructive text-destructive-foreground hover:opacity-90"
                  }`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => setPaymentBanner(null)}
                  className="p-0.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Title & Overview Banner: High-Impact Centered Layout */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 w-full">
            {/* Very Large All Projects Heading */}
            <div className="shrink-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-[var(--font-display)] leading-none select-none">
                All Projects
              </h1>
            </div>

            {/* Enlarged Centered Search Bar matching the Heading Scale */}
            <div className="flex-1 max-w-xl mx-auto w-full">
              <div className="relative w-full group">
                <Search className="w-5 h-5 text-muted-foreground absolute left-4.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter projects by repository name or branch..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 rounded-xl bg-card border border-border/80 hover:border-border focus:border-primary text-base sm:text-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
                {filterQuery ? (
                  <button
                    onClick={() => setFilterQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/60 text-[11px] font-mono text-muted-foreground pointer-events-none">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter Dropdown & Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                  className="h-14 px-5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs sm:text-sm font-mono font-medium transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2.5 select-none"
                  aria-expanded={isFilterDropdownOpen}
                >
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-foreground">
                    {statusFilter === "all"
                      ? "All Projects"
                      : statusFilter === "active"
                      ? "Active Only"
                      : "Failed Only"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      isFilterDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-card border border-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-mono flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        statusFilter === "all" ? "text-primary font-bold bg-primary/10" : "text-foreground"
                      }`}
                    >
                      <span>All Projects</span>
                      <span className="text-[10px] text-muted-foreground">{displayedProjects.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("active");
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-mono flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        statusFilter === "active" ? "text-emerald-500 font-bold bg-emerald-500/10" : "text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Active Only</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{activeProjects.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("failed");
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-mono flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        statusFilter === "failed" ? "text-red-500 font-bold bg-red-500/10" : "text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Failed Only</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{failedProjects.length}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleOpenModal}
                disabled={loading}
                className="h-14 px-6 rounded-xl bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground border border-border text-sm sm:text-base font-semibold font-mono transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2.5"
              >
                <FolderGit2 className="w-4.5 h-4.5 text-primary" />
                <span>Import Repo</span>
              </button>
            </div>
          </div>

          {/* MAIN BODY CONTENT */}
          {loading ? (
            <div className="py-24 text-center text-xs font-mono text-muted-foreground flex flex-col items-center gap-4">
              <ThinkingOrb state="searching" size={64} />
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground block">
                  Scanning Project Workspaces
                </span>
                <span className="text-xs text-muted-foreground">
                  Synchronizing daemon state & repository configurations…
                </span>
              </div>
            </div>
          ) : projects.length === 0 ? (
            /* SUPABASE STUDIO EMPTY STATE */
            <div className="space-y-8">
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border text-primary flex items-center justify-center shadow-inner">
                  <FolderGit2 className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-base font-semibold text-foreground">
                    No projects found
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Create your first project to start synchronizing concurrent AI agents, orchestrating file locks, and inspecting AST blast radiuses.
                  </p>
                </div>

                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New project</span>
                </button>
              </div>

              {/* Supabase-style Quickstart Helper Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="p-4 rounded-lg bg-card border border-border space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span>Quickstart CLI</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal font-mono">
                    npm install -g @latch/cli<br />
                    latch init && latch serve
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Bot className="w-4 h-4 text-primary" />
                    <span>Claude Code & Cursor Swarm</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Latch provisions zero-latency file mutex leases across concurrent IDEs and terminal agents.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>AST Blast Radius Bounds</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Prevent out-of-order writes and merge conflicts before git commits occur.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* PROJECT WORKSPACES: ACTIVE & FAILED HORIZONTAL LIST (DROPPED DOWN BY DEFAULT) */
            <div className="space-y-10">
              {/* 1. ACTIVE WORKSPACES SECTION (DROPPED DOWN BY DEFAULT) */}
              {(statusFilter === "all" || statusFilter === "active") && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setActiveSectionOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-border transition-colors cursor-pointer group select-none shadow-xs"
                    aria-expanded={activeSectionOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                      <h2 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-foreground tracking-tight">
                        Active Workspaces
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-500">
                        {activeProjects.length} Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-foreground">
                      <span>{activeSectionOpen ? "Collapse" : "Expand"}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeSectionOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </div>
                  </button>

                  {activeSectionOpen && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {activeProjects.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center text-xs font-mono text-muted-foreground">
                          No active projects match your filter.
                        </div>
                      ) : (
                        activeProjects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => router.push(`/dashboard/project/${proj.id}`)}
                            className="group relative rounded-2xl bg-card border border-border/80 hover:border-primary/60 hover:bg-muted/[0.04] transition-all duration-200 cursor-pointer overflow-hidden p-6 sm:p-7 shadow-sm hover:shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full"
                          >
                            {/* Left: Icon, Name, Repo, Status */}
                            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                              <div className="w-14 h-14 rounded-2xl border border-primary/30 bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors shadow-xs">
                                {proj.status === "deploying" || proj.status === "pending" ? (
                                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                ) : (
                                  <FolderGit2 className="w-6 h-6 stroke-[1.8]" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="font-bold text-xl sm:text-2xl text-foreground font-[var(--font-display)] group-hover:text-primary transition-colors tracking-tight truncate">
                                    {proj.project_name}
                                  </h3>

                                  {proj.status === "deploying" || proj.status === "pending" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-semibold text-amber-500">
                                      <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                      <span>DEPLOYING</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-500">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                                      <span>ACTIVE SWARM</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                                  <span className="truncate max-w-xs sm:max-w-md text-muted-foreground/80">
                                    {proj.repo_name || proj.project_name}
                                  </span>
                                  <span className="text-muted-foreground/40">•</span>
                                  <span className="inline-flex items-center gap-1 text-primary">
                                    <GitBranch className="w-3.5 h-3.5" />
                                    <span>{proj.branch || "main"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Horizontal Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 py-2 xl:py-0 border-t xl:border-t-0 xl:border-l border-border/80 xl:pl-6 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  Swarm Capacity
                                </span>
                                <span className="text-foreground font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                                  <Bot className="w-3.5 h-3.5 text-primary" />
                                  {proj.agent_limit || 4} Coders
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  AST Mutex Bus
                                </span>
                                <span className="text-foreground font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-primary" />
                                  Guarded
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 col-span-2 sm:col-span-1 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  Daemon Socket
                                </span>
                                <span className="text-foreground font-semibold text-sm mt-0.5 truncate flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-primary" />
                                  :3001 Live
                                </span>
                              </div>
                            </div>

                            {/* Right: Endpoint Copy & View Studio CTA */}
                            <div className="flex items-center gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-border/80 xl:pl-6">
                              <button
                                onClick={(e) =>
                                  handleCopyEndpoint(e, proj.render_url || "http://127.0.0.1:3001", proj.id)
                                }
                                className="h-12 px-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/80 hover:border-primary/40 text-xs font-mono text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center gap-2 group/copy"
                                title="Copy daemon endpoint URL"
                              >
                                {copiedId === proj.id ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-500 font-semibold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-muted-foreground group-hover/copy:text-primary transition-colors" />
                                    <span className="truncate max-w-[130px]">
                                      {proj.render_url ? new URL(proj.render_url).host : ":3001 Live"}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/project/${proj.id}`);
                                }}
                                className="h-12 px-5 sm:px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer shrink-0"
                              >
                                <span>View Studio</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. FAILED WORKSPACES SECTION (DROPPED DOWN BY DEFAULT) */}
              {(statusFilter === "all" || statusFilter === "failed") && (
                <div className="space-y-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setFailedSectionOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-card border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer group select-none shadow-xs"
                    aria-expanded={failedSectionOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                      <h2 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-foreground tracking-tight">
                        Failed / Blocked Workspaces
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-semibold text-red-500">
                        {failedProjects.length} {failedProjects.length === 1 ? "Failure" : "Failures"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-foreground">
                      <span>{failedSectionOpen ? "Collapse" : "Expand"}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          failedSectionOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </div>
                  </button>

                  {failedSectionOpen && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {failedProjects.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center text-xs font-mono text-muted-foreground">
                          No failed workspaces detected. Swarm synchronization is healthy.
                        </div>
                      ) : (
                        failedProjects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => router.push(`/dashboard/project/${proj.id}`)}
                            className="group relative rounded-2xl bg-card border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/[0.02] transition-all duration-200 cursor-pointer overflow-hidden p-6 sm:p-7 shadow-sm hover:shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full"
                          >
                            {/* Left: Icon, Name, Repo, Status */}
                            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                              <div className="w-14 h-14 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors shadow-xs">
                                <X className="w-6 h-6 stroke-[2.2]" />
                              </div>

                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="font-bold text-xl sm:text-2xl text-foreground font-[var(--font-display)] group-hover:text-red-400 transition-colors tracking-tight truncate">
                                    {proj.project_name}
                                  </h3>

                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-semibold text-red-500">
                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                                    <span>FAILED / BLOCKED</span>
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                                  <span className="truncate max-w-xs sm:max-w-md text-muted-foreground/80">
                                    {proj.repo_name || proj.project_name}
                                  </span>
                                  <span className="text-muted-foreground/40">•</span>
                                  <span className="inline-flex items-center gap-1 text-primary">
                                    <GitBranch className="w-3.5 h-3.5" />
                                    <span>{proj.branch || "main"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Horizontal Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 py-2 xl:py-0 border-t xl:border-t-0 xl:border-l border-border/80 xl:pl-6 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  Swarm Capacity
                                </span>
                                <span className="text-foreground font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                                  <Bot className="w-3.5 h-3.5 text-primary" />
                                  {proj.agent_limit || 4} Coders
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  AST Mutex Bus
                                </span>
                                <span className="text-red-400 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-red-400" />
                                  Conflict Halt
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 col-span-2 sm:col-span-1 min-w-[125px]">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  Daemon Socket
                                </span>
                                <span className="text-foreground font-semibold text-sm mt-0.5 truncate flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-primary" />
                                  :3001 Live
                                </span>
                              </div>
                            </div>

                            {/* Right: Endpoint Copy & View Studio CTA */}
                            <div className="flex items-center gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-border/80 xl:pl-6">
                              <button
                                onClick={(e) =>
                                  handleCopyEndpoint(e, proj.render_url || "http://127.0.0.1:3001", proj.id)
                                }
                                className="h-12 px-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/80 hover:border-primary/40 text-xs font-mono text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center gap-2 group/copy"
                                title="Copy daemon endpoint URL"
                              >
                                {copiedId === proj.id ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-500 font-semibold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-muted-foreground group-hover/copy:text-primary transition-colors" />
                                    <span className="truncate max-w-[130px]">
                                      {proj.render_url ? new URL(proj.render_url).host : ":3001 Live"}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/project/${proj.id}`);
                                }}
                                className="h-12 px-5 sm:px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer shrink-0"
                              >
                                <span>View Studio</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. SUPABASE-STYLE "CREATE A NEW PROJECT" MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {modalStep === 1
                    ? "Connect a GitHub Repository"
                    : "Configure Project & Agent Swarm"}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {modalStep === 1
                    ? "Choose a repository to orchestrate multi-agent file locks"
                    : "Set repository name and swarm concurrency limits"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: SELECT REPOSITORY */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search repositories…"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-md bg-input border border-border text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-ring"
                    />
                  </div>

                  {/* List of Repos */}
                  {reposLoading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Fetching repositories from GitHub…</span>
                    </div>
                  ) : githubError ? (
                    <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
                      <p className="text-muted-foreground">
                        GitHub account is not connected or token expired. Connect your GitHub account to load your repositories.
                      </p>
                      <a
                        href={api.auth.getGithubOAuthUrl()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded hover:opacity-90 font-medium transition-all"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Connect GitHub Account</span>
                      </a>
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      {repoSearch ? "No repositories match your search." : "No GitHub repositories found."}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {filteredRepos.map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => handleSelectRepo(repo)}
                          className="p-3 rounded-md bg-muted/40 border border-border hover:border-ring hover:bg-muted transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                {repo.full_name}
                              </span>
                              {repo.private && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                  Private
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {repo.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {repo.language && (
                              <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10">
                                {repo.language}
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom Repo Manual Entry */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      Or connect any custom GitHub repo:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="owner/repo-name"
                        value={customRepoName}
                        onChange={(e) => setCustomRepoName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-md bg-input border border-border text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-ring"
                      />
                      <button
                        type="button"
                        onClick={handleSelectCustomRepo}
                        disabled={!customRepoName.trim()}
                        className="px-3 py-1.5 rounded-md bg-muted hover:bg-accent disabled:opacity-40 text-xs font-semibold text-primary border border-border cursor-pointer transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CONFIGURE PROJECT & NUMBER OF AGENTS */}
              {modalStep === 2 && (
                <form onSubmit={handleCreateProject} className="space-y-4">
                  {/* Selected Repo Banner */}
                  <div className="p-3 rounded-md bg-muted/40 border border-primary/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                          Selected Repo
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {selectedRepo?.full_name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="text-[11px] font-mono text-primary hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Project Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-muted-foreground block">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Project Name"
                      className="w-full px-3 py-2 rounded-md bg-input border border-border text-xs text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  {/* Number of Agents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-muted-foreground">
                        Concurrent Agents Limit ({planTier === "pro" ? "Pro: max 20" : "Free: max 7"})
                      </label>
                      <span className="text-xs font-mono font-bold text-primary">
                        {agentCount} Coders
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {(planTier === "pro" ? [4, 8, 14, 20] : [2, 4, 6, 7]).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setAgentCount(count)}
                          className={`py-2 px-3 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                            agentCount === count
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                          }`}
                        >
                          {count} Agents
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-md bg-muted/40 border border-border text-[11px] font-mono text-muted-foreground space-y-1">
                      <span className="text-primary font-medium block">
                        Allocated Swarm Slots:
                      </span>
                      {agentCount === 2 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>Claude Code CLI + Cursor IDE</span>
                        </div>
                      )}
                      {agentCount === 4 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>Claude Code + Cursor IDE + Copilot CLI + Codex Task Runner</span>
                        </div>
                      )}
                      {agentCount >= 6 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>Multi-Agent Swarm with parallel AST boundary mutex</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Branch */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-muted-foreground block">
                      Primary Branch
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="main"
                      className="w-full px-3 py-2 rounded-md bg-input border border-border text-xs text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  {createError && (
                    <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                      {createError}
                    </div>
                  )}

                  {/* Modal Footer Actions */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="px-3.5 py-1.5 rounded-md bg-muted text-xs font-mono text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !projectName.trim()}
                      className="flex-1 py-2 px-4 rounded-md bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm min-h-[36px]"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <ThinkingOrb state="connecting" size={20} />
                          <span>Provisioning Workspace…</span>
                        </span>
                      ) : (
                        "Create new project"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userId={user?.id}
        onUpgradeSuccess={async () => {
          setPlanTier("pro");
          // Re-fetch billing + user state to sync Pro limits
          try {
            const billing = await api.billing.getStatus();
            if (billing) {
              setPlanTier(billing.planTier);
              setDaysRemaining(billing.daysRemaining ?? null);
              setIsExpired(false);
            }
          } catch {}
          try {
            const meRes = await api.auth.me();
            if (meRes?.user) setUser(meRes.user);
          } catch {}
        }}
      />
    </div>
  );
}
