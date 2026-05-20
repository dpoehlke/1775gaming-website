"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* --------------------------------------------------------------------------
   Star field — pure CSS, no external libraries.
   Generated on the client only to avoid SSR hydration mismatch.
   Three layers scroll at different speeds; each layer is duplicated
   so the loop is perfectly seamless.
-------------------------------------------------------------------------- */
function StarField() {
  const [layers, setLayers] = useState<{
    sm: string;
    md: string;
    lg: string;
  } | null>(null);

  useEffect(() => {
    const gen = (count: number, minAlpha: number) =>
      Array.from({ length: count }, () => {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        const a = (minAlpha + Math.random() * (1 - minAlpha)).toFixed(2);
        return `${x}px ${y}px rgba(255,255,255,${a})`;
      }).join(", ");

    setLayers({ sm: gen(250, 0.2), md: gen(120, 0.4), lg: gen(60, 0.6) });
  }, []);

  if (!layers) return null;

  const base = (shadow: string, size: number, dur: string, topOffset = 0): React.CSSProperties => ({
    position: "absolute",
    top: topOffset,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    boxShadow: shadow,
    animation: `animStars ${dur} linear infinite`,
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={base(layers.sm, 1, "110s")} />
      <div style={base(layers.sm, 1, "110s", -2000)} />
      <div style={base(layers.md, 2, "75s")} />
      <div style={base(layers.md, 2, "75s", -2000)} />
      <div style={base(layers.lg, 3, "50s")} />
      <div style={base(layers.lg, 3, "50s", -2000)} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Hero Section
-------------------------------------------------------------------------- */
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-marine-black overflow-hidden">

      {/* ── Layer 1: animated star field ── */}
      <StarField />

      {/* ── Layer 2: edge vignette so stars fade at the borders ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 0%, rgba(13,13,13,0.5) 60%, #0D0D0D 100%)",
        }}
      />

      {/* ── Layer 3: scarlet dramatic glow behind the headline ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(204,0,0,0.18) 0%, rgba(204,0,0,0.06) 45%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-7">

        {/* Small-caps label */}
        {/* NOTE: opacity-0 is REMOVED. animation-fill-mode:both handles the
            initial hidden state during the delay (backwards fill) and keeps
            the final state after completion (forwards fill). */}
        <p className="font-body text-xs sm:text-sm text-gold tracking-[0.4em] uppercase animate-fade-in-up">
          1775 Gaming LLC Presents
        </p>

        {/* Giant headline — at least 80px on desktop via clamp */}
        <h1
          className="font-heading text-[clamp(4rem,9vw,9rem)] text-white leading-none tracking-wide animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          THE FUTURE OF
          <br />
          <span className="text-scarlet">MOBILE GAMING</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-body text-silver/80 text-base sm:text-lg lg:text-xl tracking-wider animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          AI-Powered Gameplay
          <span className="mx-3 text-gold/50">•</span>
          Augmented Reality
          <span className="mx-3 text-gold/50">•</span>
          Health Integration
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href="/games"
            className="w-full sm:w-auto px-8 py-4 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet border border-gold hover:bg-scarlet/80 transition-all duration-300 text-center"
          >
            ▶&nbsp; Play Omniverse: Ascension
          </Link>
          <Link
            href="/beta"
            className="w-full sm:w-auto px-8 py-4 font-body font-semibold text-sm uppercase tracking-widest text-gold bg-transparent border border-gold hover:bg-gold/10 hover:text-white transition-all duration-300 text-center"
          >
            Join Beta &rarr;
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 animate-bounce-slow">
        <span className="font-body text-[10px] text-silver/40 uppercase tracking-[0.35em]">
          Scroll
        </span>
        <svg
          className="h-5 w-5 text-silver/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
