"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* --------------------------------------------------------------------------
   Star field — pure CSS animation, no external libraries.
   Stars are generated on the client to avoid hydration mismatch.
   Three layers (small / medium / large) scroll at different speeds,
   each duplicated so the loop is seamless.
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

  const starStyle = (
    shadow: string,
    size: number,
    duration: string
  ): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    boxShadow: shadow,
    animation: `animStars ${duration} linear infinite`,
  });

  const starStyleOffset = (
    shadow: string,
    size: number,
    duration: string
  ): React.CSSProperties => ({
    ...starStyle(shadow, size, duration),
    top: "-2000px",
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={starStyle(layers.sm, 1, "110s")} />
      <div style={starStyleOffset(layers.sm, 1, "110s")} />
      <div style={starStyle(layers.md, 2, "75s")} />
      <div style={starStyleOffset(layers.md, 2, "75s")} />
      <div style={starStyle(layers.lg, 3, "50s")} />
      <div style={starStyleOffset(layers.lg, 3, "50s")} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Hero Section
-------------------------------------------------------------------------- */
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-marine-black overflow-hidden">
      {/* Animated star field */}
      <StarField />

      {/* Depth gradient — vignette keeps stars readable without blowing out center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, rgba(13,13,13,0.55) 55%, #0D0D0D 100%)",
        }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-7">

        {/* Small-caps label */}
        <p
          className="font-body text-xs sm:text-sm text-gold tracking-[0.4em] uppercase opacity-0 animate-fade-in-up"
        >
          1775 Gaming LLC Presents
        </p>

        {/* Giant headline */}
        <h1
          className="font-heading text-[clamp(3.5rem,10vw,10rem)] text-white leading-none tracking-wide opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          THE FUTURE OF
          <br />
          <span className="text-scarlet">MOBILE GAMING</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-body text-silver/75 text-base sm:text-lg lg:text-xl tracking-wider opacity-0 animate-fade-in-up"
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 opacity-0 animate-fade-in-up"
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
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
