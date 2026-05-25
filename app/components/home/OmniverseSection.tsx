"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const FEATURE_PILLS = ["AI Game Master", "AR Battles", "Health Integration"];

function BadgeImage() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[340px] bg-charcoal/60 border border-scarlet/20">
        <div className="text-center p-8">
          <p className="font-heading text-5xl text-gold/30 tracking-wider">OMNIVERSE</p>
          <p className="font-body text-xs text-silver/30 mt-3 uppercase tracking-widest">
            Drop Omniverse-Badge.png in public/images/
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/images/Omniverse-Badge.png"
      alt="Omniverse: Ascension badge"
      width={480}
      height={580}
      className="w-full h-auto max-w-[380px] lg:max-w-[420px] mx-auto object-contain drop-shadow-2xl"
      onError={() => setError(true)}
      priority
    />
  );
}

export default function OmniverseSection() {
  return (
    <section className="py-28 px-4 bg-marine-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── LEFT: badge + scarlet glow ── */}
          <div className="relative flex items-center justify-center order-2 lg:order-1">
            {/* Animated glow ring behind image */}
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background:
                  "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(204,0,0,0.28) 0%, transparent 70%)",
              }}
            />
            {/* Hard inner glow for extra drama */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 30% 30% at 50% 50%, rgba(204,0,0,0.12) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10 w-full">
              <BadgeImage />
            </div>
          </div>

          {/* ── RIGHT: text content ── */}
          <div className="space-y-6 order-1 lg:order-2">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase">
              Featured Title
            </p>

            <h2 className="font-heading text-6xl lg:text-7xl xl:text-8xl text-white leading-none tracking-wide">
              OMNIVERSE:
              <br />
              <span className="text-scarlet">ASCENSION</span>
            </h2>

            <p className="font-body text-silver/75 text-base lg:text-lg leading-relaxed max-w-lg">
              An AI-powered mobile RPG built on the legendary{" "}
              <span className="text-gold font-semibold">Mutants &amp; Masterminds</span>{" "}
              framework. Battle in augmented reality, track your real-world health
              stats to power your hero, and experience a living game world driven
              by intelligent AI.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 pt-1">
              {FEATURE_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="font-body text-xs uppercase tracking-wider text-gold border border-gold/40 px-4 py-2 bg-gold/5 hover:bg-gold/10 transition-colors duration-200 cursor-default"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/games"
                className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
              >
                Learn More
              </Link>
              <Link
                href="/beta"
                className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-gold border border-gold hover:bg-gold/10 transition-colors duration-300"
              >
                Join Beta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
