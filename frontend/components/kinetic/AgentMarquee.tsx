"use client";

import Marquee from "react-fast-marquee";
import {
  IconMutexLock,
  IconConflictShear,
  IconCausalBus,
  IconCheck,
  IconTerminalPrompt,
} from "@/components/icons/LatchIcons";

const events = [
  { agent: "Cursor", action: "LOCKED", file: "src/engine/lock_table.rs", icon: <IconMutexLock className="w-3.5 h-3.5" /> },
  { agent: "Claude Code", action: "BLOCKED", file: "src/engine/lock_table.rs (held by Cursor)", icon: <IconConflictShear className="w-3.5 h-3.5" /> },
  { agent: "Antigravity", action: "SYNCED", file: "tests/concurrency_test.py", icon: <IconCausalBus className="w-3.5 h-3.5" /> },
  { agent: "Codex CLI", action: "RELEASED", file: "docs/architecture.md", icon: <IconCheck className="w-3.5 h-3.5" /> },
  { agent: "Copilot Workspace", action: "CLAIMED", file: "crates/latch-ast/src/parser.rs", icon: <IconTerminalPrompt className="w-3.5 h-3.5" /> },
];

export function AgentMarquee() {
  return (
    <div className="w-full border-b border-border bg-muted/40 py-2 select-none overflow-hidden font-mono text-xs transition-colors duration-200">
      <Marquee speed={35} direction="right" gradient={false} autoFill>
        <div className="flex items-center gap-6 pr-6">
          {events.map((e, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-card border border-border shadow-sm"
            >
              <span className="text-primary">{e.icon}</span>
              <span className="font-medium text-foreground">
                {e.agent}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  e.action === "BLOCKED"
                    ? "bg-destructive/15 text-destructive border border-destructive/30"
                    : e.action === "LOCKED"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {e.action}
              </span>
              <span className="text-muted-foreground text-[11px]">{e.file}</span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
