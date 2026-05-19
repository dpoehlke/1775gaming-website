import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games | 1775 Gaming LLC",
  description:
    "Explore 1775 Gaming titles — Omniverse: Ascension, an AI-powered mobile RPG with AR combat and real-world health integration.",
};

const GENRE_TAGS = ["Mobile RPG", "AR Combat", "AI-Powered", "Health Integration"];

const FEATURES = [
  "AI Game Master that adapts to your playstyle",
  "Augmented Reality combat system",
  "Real-world health and fitness integration",
  "Built on Mutants & Masterminds 3e framework",
  "Solo and cooperative multiplayer modes",
  "Dynamic story missions that never repeat",
];

const STATS = [
  { value: "M&M 3e", label: "Framework" },
  { value: "iOS + Android", label: "Platform" },
  { value: "2025", label: "Beta Year" },
  { value: "Free to Play", label: "Model" },
];

function PadlockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-12 h-12 text-silver/25"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function GamesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex items-center justify-center min-h-[52vh] py-28 px-4 bg-marine-black overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(204,0,0,0.14) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            1775 Gaming LLC
          </p>
          <h1 className="font-heading text-8xl lg:text-[9rem] text-white tracking-wide mb-6">
            OUR GAMES
          </h1>
          <p className="font-body text-silver/70 text-lg lg:text-xl leading-relaxed">
            Cutting-edge mobile experiences powered by AI, AR, and real-world
            health integration
          </p>
        </div>
      </section>

      {/* ─── FEATURED GAME ─── */}
      <section className="py-24 px-4 bg-marine-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Left: Images with scarlet glow */}
            <div className="relative">
              <div
                className="absolute inset-0 animate-pulse pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(204,0,0,0.22) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10 space-y-8">
                {/* Main game logo — large */}
                <Image
                  src="/images/Omniverse-Logo.png"
                  alt="Omniverse: Ascension"
                  width={600}
                  height={280}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  priority
                />
                {/* Badge — smaller, centered */}
                <div className="flex justify-center">
                  <Image
                    src="/images/Omniverse-Badge.png"
                    alt="Omniverse: Ascension badge"
                    width={220}
                    height={260}
                    className="h-auto object-contain"
                    style={{ maxWidth: "220px" }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="space-y-6">
              <p className="font-body text-xs text-gold tracking-[0.45em] uppercase">
                Available Now in Beta
              </p>
              <h2 className="font-heading text-6xl lg:text-7xl text-white leading-none tracking-wide">
                OMNIVERSE:
                <br />
                <span className="text-scarlet">ASCENSION</span>
              </h2>

              {/* Genre tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {GENRE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="font-body text-xs uppercase tracking-wider text-silver/60 border border-white/15 px-3 py-1.5 bg-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="font-body text-silver/75 text-sm lg:text-base leading-relaxed">
                  Omniverse: Ascension is a next-generation mobile RPG built on
                  the legendary{" "}
                  <span className="text-gold font-semibold">
                    Mutants &amp; Masterminds
                  </span>{" "}
                  framework. Choose your hero, build your powers, and battle
                  villains in a living world driven by an intelligent AI Game
                  Master.
                </p>
                <p className="font-body text-silver/75 text-sm lg:text-base leading-relaxed">
                  Experience combat like never before with augmented reality
                  battles that bring the fight into your real-world environment.
                  Your kitchen becomes a battlefield. Your street becomes an
                  arena.
                </p>
                <p className="font-body text-silver/75 text-sm lg:text-base leading-relaxed">
                  Your real-world health data powers your hero. Walk more, fight
                  harder. Work out, unlock abilities. Omniverse: Ascension is
                  the first game that makes getting healthy a superpower.
                </p>
              </div>

              {/* Feature checklist */}
              <ul className="space-y-2.5 pt-1">
                {FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <span className="text-gold font-bold flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="font-body text-silver/70 text-sm">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/beta"
                  className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
                >
                  Join Beta
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-gold border border-gold hover:bg-gold/10 transition-colors duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-10 px-4 bg-charcoal border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-heading text-2xl lg:text-3xl text-white tracking-wide mb-1">
                {value}
              </p>
              <p className="font-body text-xs text-silver/50 uppercase tracking-widest">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMING SOON ─── */}
      <section className="py-24 px-4 bg-marine-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
              In Development
            </p>
            <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-4">
              MORE TITLES IN DEVELOPMENT
            </h2>
            <p className="font-body text-silver/55 text-base max-w-xl mx-auto">
              1775 Gaming is building the future. More titles coming soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 — Project Liberty */}
            <div className="group relative bg-charcoal border border-white/5 hover:border-scarlet/40 transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-blue-900/30 to-charcoal" />
              <div className="p-8">
                <h3 className="font-heading text-2xl text-white/25 tracking-wide mb-3">
                  PROJECT LIBERTY
                </h3>
                <p className="font-body text-silver/25 text-sm leading-relaxed">
                  A tactical AR strategy game set in a near-future America
                </p>
              </div>
              {/* Blur overlay */}
              <div className="absolute inset-0 bg-marine-black/65 backdrop-blur-[2px] z-10 group-hover:bg-marine-black/55 transition-all duration-300" />
              {/* Badge above overlay */}
              <div className="absolute top-4 left-4 z-20 bg-gold px-3 py-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-marine-black">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Card 2 — Iron Patriots */}
            <div className="group relative bg-charcoal border border-white/5 hover:border-scarlet/40 transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-emerald-900/30 to-charcoal" />
              <div className="p-8">
                <h3 className="font-heading text-2xl text-white/25 tracking-wide mb-3">
                  IRON PATRIOTS
                </h3>
                <p className="font-body text-silver/25 text-sm leading-relaxed">
                  A cooperative mobile shooter with real-world geolocation
                  missions
                </p>
              </div>
              <div className="absolute inset-0 bg-marine-black/65 backdrop-blur-[2px] z-10 group-hover:bg-marine-black/55 transition-all duration-300" />
              <div className="absolute top-4 left-4 z-20 bg-gold px-3 py-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-marine-black">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Card 3 — Classified */}
            <div className="group relative bg-charcoal border border-white/5 hover:border-scarlet/40 transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-scarlet/15 to-charcoal" />
              <div className="p-8">
                <div className="flex flex-col items-center justify-center py-4 gap-4">
                  <PadlockIcon />
                  <p className="font-heading text-5xl text-silver/15 tracking-widest">
                    ???
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-marine-black/65 backdrop-blur-[2px] z-10 group-hover:bg-marine-black/55 transition-all duration-300" />
              <div className="absolute top-4 left-4 z-20 bg-gold px-3 py-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-marine-black">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
