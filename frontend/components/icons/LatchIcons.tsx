import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * LATCH PRODUCTION ICON SYSTEM
 * Precision-engineered systems software iconography:
 * 1.5px crisp hairline geometry, high information density, zero generic AI-slop.
 */

// 1. Sharp Diagonal Dispatch Arrow (for primary CTAs and external links)
export function IconArrowUpRight({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 11.5L11.5 4.5" />
      <path d="M6 4.5h5.5V10" />
    </svg>
  );
}

// 2. Precision Technical Verification Checkmark
export function IconCheck({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 8.25l3 3L12.5 4.75" />
    </svg>
  );
}

// 3. Precision Technical Rejection Cross
export function IconCross({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </svg>
  );
}

// 4. File Collision & Conflict Shear (Opposing concurrent diff markers)
export function IconConflictShear({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M2.5 4.5h7a2 2 0 0 1 2 2v5" />
      <path d="M5 2l-2.5 2.5L5 7" />
      <path d="M13.5 11.5h-7a2 2 0 0 1-2-2v-5" />
      <path d="M11 14l2.5-2.5L11 9" />
    </svg>
  );
}

// 5. Exclusive Mutex Deadbolt (Mechanical lock shackle with keyway)
export function IconMutexLock({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 6V4.25a3 3 0 0 1 6 0V6" />
      <rect x="3" y="6" width="10" height="8" rx="1.5" />
      <circle cx="8" cy="9.5" r="0.75" fill="currentColor" />
      <path d="M8 10.25v1.75" />
    </svg>
  );
}

// 6. AST Syntax Dependency Graph (Root node with bounded child token branches)
export function IconAstTree({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="3.5" r="1.75" />
      <circle cx="3.5" cy="12.5" r="1.75" />
      <circle cx="12.5" cy="12.5" r="1.75" />
      <path d="M6.8 4.8L4.6 11M9.2 4.8l2.2 6.2" />
    </svg>
  );
}

// 7. Causal Vector Clock Bus (Discrete chronologically ordered event vectors)
export function IconCausalBus({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 4.5h12M2 8.5h12M2 12.5h12" />
      <circle cx="5" cy="4.5" r="1" fill="currentColor" />
      <circle cx="11" cy="8.5" r="1" fill="currentColor" />
      <circle cx="7" cy="12.5" r="1" fill="currentColor" />
      <path d="M5 4.5v4M11 8.5v4" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

// 8. Daemon Engine Socket (Local loopback daemon on port 3001)
export function IconSocketDaemon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
      <circle cx="5.5" cy="5.5" r="0.75" fill="currentColor" />
      <circle cx="8" cy="5.5" r="0.75" fill="currentColor" />
      <path d="M4.5 10.5h7" />
      <path d="M6 8.5h4" />
    </svg>
  );
}

// 9. Stop Hook Protocol (Agent interrupt handler)
export function IconStopHook({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 3h10v2.5L9 8.5v4.5l-2-1V8.5L3 5.5V3z" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

// 10. Multi-Agent Swarm Cluster (Parallel autonomous agent nodes)
export function IconAgentSwarm({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="5.75" y="9.5" width="4.5" height="4.5" rx="1" />
      <path d="M4.25 7v1.5a1.5 1.5 0 0 0 1.5 1.5h.5" />
      <path d="M11.75 7v1.5a1.5 1.5 0 0 1-1.5 1.5h-.5" />
    </svg>
  );
}

// 11. Coordination Primitives Shield
export function IconCoordinationShield({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 2.25L3 4.5v4.25c0 3.25 3.5 5.25 5 5.75 1.5-.5 5-2.5 5-5.75V4.5L8 2.25z" />
      <path d="M8 5.5v5M6 8h4" />
    </svg>
  );
}

// 12. Minimal Terminal Prompt ($ _)
export function IconTerminalPrompt({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 5l3 3-3 3M8.5 11h4" />
    </svg>
  );
}

// 13. Synchronized Heartbeat / Lease Clock
export function IconLeaseClock({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.75V8l2.5 1.5" />
    </svg>
  );
}

// 14. Astronomical Sun (ThemeToggle)
export function IconSun({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="3.25" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
    </svg>
  );
}

// 15. Astronomical Crescent Moon (ThemeToggle)
export function IconMoon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.2 9.5a5.5 5.5 0 1 1-6.7-6.7 4.5 4.5 0 0 0 6.7 6.7z" />
    </svg>
  );
}

