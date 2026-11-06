"use client";

import React from "react";

export interface RadialLightProps {
  color?: "green" | "brown" | "red";
  position?: "left" | "right" | "center";
  className?: string;
}

export function RadialLight({
  color = "green",
  position = "center",
  className = "",
}: RadialLightProps) {
  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
      style={{ contain: "strict" }}
    >
      {/* 
        ============================================================
        OUTER AURA ANCHOR (Large expansive green radius)
        ============================================================
      */}
      <div
        className="absolute top-[200px] sm:top-[260px] md:top-[300px] left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <div
          className="w-[1450px] sm:w-[1850px] md:w-[2200px] h-[1050px] sm:h-[1350px] md:h-[1600px] pointer-events-none aura-outer"
          style={{
            background:
              color === "green"
                ? "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(55, 160, 115, 0.22) 0%, rgba(28, 90, 65, 0.12) 38%, rgba(14, 45, 32, 0.03) 65%, rgba(0, 0, 0, 0) 82%)"
                : "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(150, 105, 80, 0.24) 0%, rgba(100, 74, 64, 0.13) 38%, rgba(55, 38, 30, 0.04) 65%, rgba(0, 0, 0, 0) 82%)",
            filter: "blur(100px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* 
        ============================================================
        INNER CORE ANCHOR (Concentrated green core)
        ============================================================
      */}
      <div
        className="absolute top-[200px] sm:top-[260px] md:top-[300px] left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <div
          className="w-[820px] sm:w-[1100px] md:w-[1360px] h-[600px] sm:h-[800px] md:h-[990px] pointer-events-none aura-inner"
          style={{
            background:
              color === "green"
                ? "radial-gradient(ellipse 60% 50% at 52% 46%, rgba(85, 200, 148, 0.36) 0%, rgba(52, 150, 108, 0.22) 30%, rgba(25, 85, 60, 0.09) 58%, rgba(10, 35, 24, 0) 78%)"
                : "radial-gradient(ellipse 60% 50% at 52% 46%, rgba(195, 135, 100, 0.36) 0%, rgba(145, 95, 72, 0.23) 30%, rgba(90, 55, 40, 0.10) 58%, rgba(45, 25, 18, 0) 78%)",
            filter: "blur(65px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <style jsx>{`
        .aura-outer {
          animation: morphOuter 18s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
          will-change: transform;
        }
        .aura-inner {
          animation: morphInner 12s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
          will-change: transform;
        }
        @keyframes morphOuter {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1, 0.85);
          }
          33% {
            transform: translate(-50%, -50%) rotate(28deg) scale(1.12, 0.82);
          }
          66% {
            transform: translate(-50%, -50%) rotate(-24deg) scale(0.92, 1.06);
          }
          100% {
            transform: translate(-50%, -50%) rotate(18deg) scale(1.06, 0.88);
          }
        }
        @keyframes morphInner {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1, 0.86);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-32deg) scale(1.14, 0.80);
          }
          100% {
            transform: translate(-50%, -50%) rotate(26deg) scale(0.90, 1.10);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .aura-outer,
          .aura-inner {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

