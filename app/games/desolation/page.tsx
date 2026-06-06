import Link from "next/link";
import type { Metadata } from "next";
import { VideoGameSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "Desolation: A World Ravaged by War | 1775 Gaming",
  description:
    "Desolation — A post-apocalyptic survival game where your choices matter. Lead your village through the wastes, forge alliances, or build an empire. In development now.",
  openGraph: {
    type: "website",
    title: "Desolation | 1775 Gaming",
    description:
      "Post-apocalyptic survival where your decisions reshape civilization. Will you build cooperation or rule through strength?",
  },
};

const GENRE_TAGS = ["Post-Apocalyptic", "Survival", "Choice-Driven", "Strategy"];

const CORE_MECHANICS = [
  "Dynamic village management system — your choices reshape settlements",
  "Multiple paths to victory: diplomacy, trade, exploration, or conquest",
  "Consequence system — alliances made or broken echo throughout the game",
  "Procedurally-influenced world with handcrafted settlements",
  "AI-driven NPCs with their own motivations and fears",
  "Faction reputation system — your actions define how communities see you",
];

const STATS = [
  { value: "Single Player", label: "Experience" },
  { value: "PC / Console", label: "Platform" },
  { value: "2026-2027", label: "Window" },
  { value: "Premium", label: "Model" },
];

export default function DesolationPage() {
  return (
    <>
      <VideoGameSchema />

      {/* ─── HERO ─── */}
      <section className="relative py-28 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,0,0,0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 font-body text-xs text-silver/45 uppercase tracking-widest hover:text-gold transition-colors mb-10"
          >
            ← Back to Games
          </Link>

          <div className="mb-8">
            <span className="inline-block bg-amber-700 px-4 py-2 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              In Development
            </span>
          </div>

          <h1 className="font-heading text-5xl lg:text-7xl text-white tracking-wide leading-tight mb-6">
            DESOLATION
          </h1>

          <p className="font-body text-amber-400 text-xl italic max-w-2xl mb-8">
            Humanity fractured. Civilization in ruins. Your village starving. The wastes call.
          </p>

          <p className="font-body text-silver/75 text-lg max-w-2xl leading-relaxed">
            A post-apocalyptic survival game where your choices determine if humanity rises or falls into darkness. Lead your village, forge alliances across the wastes, or build an empire through strength and cunning.
          </p>
        </div>
      </section>

      {/* ─── GENRE TAGS ─── */}
      <section className="py-6 px-4 border-b border-white/8 bg-charcoal/30">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {GENRE_TAGS.map((tag) => (
            <span
              key={tag}
              className="font-body text-xs uppercase tracking-wider text-silver/60 border border-white/15 px-3 py-1.5 bg-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ─── THE PREMISE ─── */}
      <section className="py-16 px-4 border-b border-white/8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl text-white tracking-wide">
            THE WEIGHT OF SELECTION
          </h2>
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            You weren't volunteered. You weren't conscripted. You were <em>chosen</em>. The elders studied you. The hunters watched you. Something in you marked you as different—capable, adaptable, or maybe just desperate enough to do what needs doing.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Your village is failing. Winter is coming. The granaries are empty. And you've been selected to venture into the wastes, find other survivors, and bring back resources—or hope, if you can find it. Your people are betting everything on you.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The wastes are vast. Storms come without warning. Ruins of the old world still stand in twisted monuments to what was lost. Some settlements you'll find will trade with you. Others will see only weakness. Some survivors remember civilization. Others have already decided there's a better way—a way of taking instead of trading, of strength instead of cooperation.
          </p>
          <p className="font-heading text-2xl text-amber-400 tracking-wide">
            And you have to decide who you are in that world.
          </p>
        </div>
      </section>

      {/* ─── MULTIPLE PATHS ─── */}
      <section className="py-16 px-4 border-b border-white/8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl text-white tracking-wide">
            THE CHOICES THAT DEFINE YOU
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-gold font-semibold">Scout & Explore:</span> Navigate the wastes, discover settlements, chart safe routes. Build a reputation for finding solutions others miss.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-gold font-semibold">Diplomat & Trader:</span> Build alliances, negotiate terms, convince fractured communities that cooperation might rebuild civilization. Trade, bargain, and forge bonds.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-gold font-semibold">Warlord & Conqueror:</span> The wastes corrupt ambition. Settlements that started desperate like yours turned to taking instead of trading. Fear is more reliable than trust. Will you follow that path?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Every choice reshapes your village. Every alliance changes the map. Every conflict opens new paths or closes them forever. The game doesn't judge you—the world only cares about survival. But your village will care about what you become.
          </p>
        </div>
      </section>

      {/* ─── CORE MECHANICS ─── */}
      <section className="py-16 px-4 border-b border-white/8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl text-white tracking-wide">
            GAMEPLAY PILLARS
          </h2>
          <ul className="space-y-3">
            {CORE_MECHANICS.map((mechanic) => (
              <li key={mechanic} className="flex items-start gap-3">
                <span className="text-amber-400 font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="font-body text-silver/75 text-base leading-relaxed">
                  {mechanic}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-12 px-4 bg-charcoal border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
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

      {/* ─── CORE QUESTION ─── */}
      <section className="py-16 px-4 border-b border-white/8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl text-white tracking-wide">
            SURVIVAL OR CIVILIZATION?
          </h2>
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            Desolation asks a question that matters: What are we willing to do to survive? And after we survive, what are we willing to give up to make it mean something?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It's easy to be noble when your belly is full. It's easy to believe in cooperation when you're not watching your children starve. It's easy to reject violence when violence isn't your only option.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            In Desolation, you don't have those luxuries. You have your village. You have the wastes. And you have yourself—a person being forged in real time by every decision you make.
          </p>
          <p className="font-heading text-3xl text-amber-400 tracking-wide pt-4">
            The world is broken. Civilization collapsed. Mankind was thrown back into the stone age. But that's not the story of Desolation.
          </p>
          <p className="font-heading text-3xl text-gold tracking-wide">
            The story is whether it climbs back out.
          </p>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-16 px-4 bg-charcoal border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Desolation is in development now. We're building a world where your choices echo across the wastes, where alliances matter, where the line between survival and tyranny is thin and easy to cross.
          </p>
          <p className="font-heading text-2xl text-gold tracking-wide">
            Will you help lead your people into a brighter future?
          </p>
          <p className="font-heading text-2xl text-amber-400 tracking-wide">
            Or will you turn to warmongering like so many in the past?
          </p>
          <div className="pt-4">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 font-body text-xs text-silver/45 uppercase tracking-widest hover:text-gold transition-colors"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
