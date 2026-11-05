"use client";

import {
  IconCheck,
  IconCross,
  IconConflictShear,
  IconMutexLock,
  IconAstTree,
  IconCausalBus,
  IconStopHook,
} from "@/components/icons/LatchIcons";

export function ProblemSolutionSplit() {
  return (
    <section id="problem-solution" className="w-full max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
        
        {/* ==================== Box 01: The Problem ==================== */}
        <div className="rounded-2xl bg-card border border-destructive/30 p-7 sm:p-9 lg:p-11 flex flex-col justify-between text-card-foreground shadow-sm relative overflow-hidden w-full">
          {/* Subtle top indicator line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive/60" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-destructive">
                01 // The Problem
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold tracking-tight text-foreground leading-snug">
              AI agents are fast. But they don&apos;t coordinate.
            </h2>

            <p className="mt-3.5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              When multiple agents edit the same repository in parallel, they overwrite each other&apos;s changes, hallucinate broken AST interfaces, and destroy work.
            </p>

            {/* Problem Points */}
            <div className="mt-7 space-y-3.5 text-sm sm:text-base text-foreground">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCross className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  No filesystem lock coordination
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCross className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Zero awareness of other running agents
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCross className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Silent code clobbering &amp; broken builds
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCross className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Designed for solo developers, not agent swarms
                </span>
              </div>
            </div>
          </div>

          {/* Merge Conflict Code Card Inset */}
          <div className="mt-8 p-4 sm:p-5 rounded-xl bg-muted/40 border border-destructive/35 font-mono w-full">
            <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase mb-2.5">
              <IconConflictShear className="w-4 h-4" />
              <span>Merge Conflict Detected (No Latch)</span>
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed bg-background/60 p-3.5 rounded-lg border border-border">
              <div className="text-muted-foreground">// src/auth.ts · concurrent edits clobbered</div>
              <div className="text-destructive bg-destructive/10 px-2.5 py-1 rounded">
                &lt;&lt;&lt;&lt;&lt;&lt;&lt; Claude Code: rewrite session handler
              </div>
              <div className="text-muted-foreground px-2.5 py-0.5">
                ======= Cursor: inline token verification
              </div>
              <div className="text-destructive bg-destructive/10 px-2.5 py-1 rounded">
                &gt;&gt;&gt;&gt;&gt;&gt;&gt;
              </div>
            </div>
          </div>
        </div>

        {/* ==================== Box 02: The Solution ==================== */}
        <div className="rounded-2xl bg-card border border-primary/40 p-7 sm:p-9 lg:p-11 flex flex-col justify-between text-card-foreground shadow-sm relative overflow-hidden w-full">
          {/* Subtle top indicator line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                02 // The Solution
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold tracking-tight text-foreground leading-snug">
              A real-time coordination layer for machine-speed coders.
            </h2>

            <p className="mt-3.5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Latch wraps your repository in a distributed AST lock engine and causal patch bus. Agents request locks before editing and synchronize AST boundaries.
            </p>

            {/* Solution Points */}
            <div className="mt-7 space-y-3.5 text-sm sm:text-base text-foreground">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Sub-millisecond exclusive file mutex leases
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  AST dependency blast-radius bounding
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Real-time causal patch streaming via vector clocks
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">
                  Stop hook protocol integration for all major agents
                </span>
              </div>
            </div>
          </div>

          {/* Solution Spec Pill Matrix */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm font-mono w-full">
            <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-primary text-xs uppercase font-bold mb-1">
                <IconMutexLock className="w-4 h-4" />
                <span>Zero Overwrites</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-sans">
                Sub-millisecond file mutex
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-primary text-xs uppercase font-bold mb-1">
                <IconAstTree className="w-4 h-4" />
                <span>AST Blast Radius</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-sans">
                Dependency-bounded isolation
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-primary text-xs uppercase font-bold mb-1">
                <IconCausalBus className="w-4 h-4" />
                <span>Causal Streaming</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-sans">
                Vector clock ordered patches
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-primary text-xs uppercase font-bold mb-1">
                <IconStopHook className="w-4 h-4" />
                <span>Stop Hook API</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-sans">
                Native agent protocol hooks
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
