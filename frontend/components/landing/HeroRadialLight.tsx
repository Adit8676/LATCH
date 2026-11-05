"use client";

export function HeroRadialLight() {
  return (
    <div
      className="absolute top-0 left-0 right-0 w-full h-[1500px] pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 
        Outer Diffuse Aura:
        - 1.7x enlarged diameter (up to 2300px × 1620px)
        - Anchor: Shifted downwards level with headline (top: ~380px)
        - 1.5x amplified shape-shifting and fluid rotational wave morph
      */}
      <div
        className="absolute left-[calc(50%+240px)] sm:left-[calc(50%+310px)] md:left-[calc(50%+360px)] top-[340px] sm:top-[380px] md:top-[410px] w-[1450px] sm:w-[1850px] md:w-[2300px] h-[1050px] sm:h-[1350px] md:h-[1620px] pointer-events-none aura-outer"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(55, 160, 115, 0.20) 0%, rgba(28, 90, 65, 0.11) 38%, rgba(14, 45, 32, 0.03) 65%, rgba(0, 0, 0, 0) 82%)",
          filter: "blur(115px)",
        }}
      />

      {/* 
        Inner Luminous Core:
        - 1.7x enlarged diameter (up to 1360px × 990px)
        - Shifted downwards level with headline text
        - Asynchronous counter-rhythm
      */}
      <div
        className="absolute left-[calc(50%+230px)] sm:left-[calc(50%+290px)] md:left-[calc(50%+340px)] top-[340px] sm:top-[380px] md:top-[410px] w-[820px] sm:w-[1100px] md:w-[1360px] h-[600px] sm:h-[800px] md:h-[990px] pointer-events-none aura-inner"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 52% 46%, rgba(85, 200, 148, 0.32) 0%, rgba(52, 150, 108, 0.20) 30%, rgba(25, 85, 60, 0.08) 58%, rgba(10, 35, 24, 0) 78%)",
          filter: "blur(68px)",
        }}
      />

      {/* Subtle organic micro-noise film grain preventing gradient banding */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-radial-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-radial-grain)" />
      </svg>

      <style jsx>{`
        /* Outer boundary: 1.5x amplified shape-shifting morph & rotational drift */
        .aura-outer {
          animation: morphOuter 16s ease-in-out infinite alternate;
          transform-origin: 50% 48%;
          will-change: transform, border-radius;
        }

        /* Inner core: 1.5x amplified organic morph with independent counter rhythm */
        .aura-inner {
          animation: morphInner 11s ease-in-out infinite alternate;
          transform-origin: 52% 46%;
          will-change: transform, border-radius;
        }

        @keyframes morphOuter {
          0% {
            border-radius: 74% 26% 62% 38% / 38% 70% 30% 62%;
            transform: translate(-50%, -50%) rotate(0deg) scale(1, 0.84);
          }
          33% {
            border-radius: 38% 62% 26% 74% / 65% 35% 65% 35%;
            transform: translate(-54%, -46%) rotate(38deg) scale(1.14, 0.80);
          }
          66% {
            border-radius: 32% 68% 68% 32% / 70% 30% 70% 30%;
            transform: translate(-46%, -54%) rotate(-32deg) scale(0.90, 1.08);
          }
          100% {
            border-radius: 66% 34% 40% 60% / 44% 68% 32% 56%;
            transform: translate(-52%, -48%) rotate(24deg) scale(1.08, 0.88);
          }
        }

        @keyframes morphInner {
          0% {
            border-radius: 68% 32% 40% 60% / 36% 64% 36% 64%;
            transform: translate(-50%, -50%) rotate(0deg) scale(1, 0.85);
          }
          50% {
            border-radius: 32% 68% 68% 32% / 68% 32% 68% 32%;
            transform: translate(-55%, -45%) rotate(-50deg) scale(1.18, 0.78);
          }
          100% {
            border-radius: 46% 54% 34% 66% / 40% 60% 40% 60%;
            transform: translate(-45%, -55%) rotate(38deg) scale(0.88, 1.14);
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
