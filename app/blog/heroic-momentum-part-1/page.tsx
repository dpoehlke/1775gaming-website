import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "Heroic Momentum Part 1: Leveling Up In Real Life",
  description:
    "Inspired by Solo Leveling, we created a game where your character's power reflects your real-world effort. Heroic Momentum ties in-game rewards with real-life activities—power up your character as you pump yourself up.",
  openGraph: {
    type: "article",
    publishedTime: "2026-05-22T10:00:00Z",
    authors: ["1775 Gaming"],
  },
};

const TAGS = [
  "#HeroicMomentum",
  "#Gaming",
  "#FitnessGaming",
  "#Innovation",
  "#SoloLeveling",
  "#GameDev",
];

export default function HeroicMomentumPart1() {
  return (
    <div className="bg-marine-black min-h-screen">
      <BlogPostSchema
        title="Heroic Momentum Part 1: Leveling Up In Real Life"
        description={metadata.description ?? ""}
        publishedDate="2026-05-22"
        slug="heroic-momentum-part-1"
      />

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-xs text-silver/45 uppercase tracking-widest hover:text-gold transition-colors mb-10"
          >
            ← Back to The Briefing
          </Link>

          {/* Category + date */}
          <div className="flex items-center gap-4 mb-6">
            <span className="inline-block bg-emerald-700 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              Health Gaming
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              May 22, 2026 &nbsp;·&nbsp; 5 min read
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            HEROIC MOMENTUM PART 1: LEVELING UP IN REAL LIFE
          </h1>

          {/* Subheadline */}
          <p className="font-body text-gold text-base italic">
            The adventure starts when you step outside. Your character is waiting.
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Section 1 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE CHALLENGE WE&apos;RE ALL FACING
          </h2>
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            The numbers tell a story we all know too well. The average person
            spends over 7 hours a day on screens — scrolling, clicking, and
            engaging with digital worlds. Meanwhile, physical activity has hit
            a quiet crisis.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Most of us fall short of the World Health Organization&apos;s
            recommendation of 150 minutes of moderate exercise per week.
            We&apos;ve created an imbalance: we&apos;re becoming experts at
            controlling avatars on screens while our own bodies move less and
            less.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It&apos;s not about blame or guilt. Life is demanding, schedules
            are packed, and those screens offer real value — connection,
            entertainment, learning. But somewhere in the shift toward digital
            living, we&apos;ve left something important behind: the simple act
            of moving our bodies, getting outside, and feeling the real-world
            benefits of physical activity.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The health impacts are real — increased sedentary time is linked
            to higher rates of obesity, cardiovascular issues, and mental
            health challenges. Yet despite knowing this, the trend continues.
            Why? Because when we&apos;re caught up in the game, the real world
            feels less compelling.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 2 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            A DIFFERENT APPROACH
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            I was watching{" "}
            <span className="text-gold font-semibold">Solo Leveling</span> —
            the anime phenomenon that&apos;s captivated gamers everywhere. If
            you haven&apos;t seen it, it&apos;s the ultimate power fantasy: a
            weak protagonist discovers a leveling system that lets him grow
            exponentially stronger.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The show is brilliantly done, and like countless other gamers, I
            found myself daydreaming about it. What if that were real? What if
            you could actually level up like that?
          </p>
          <p className="font-heading text-2xl text-emerald-400 tracking-wide">
            Then the thought hit me: why not create a version of that?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Not just in a fantasy world — in real life. What if your
            character&apos;s power wasn&apos;t just a reward for grinding, but
            a reflection of your own real-world effort? What if the next level
            wasn&apos;t just waiting in your phone, but out there, waiting for
            you to earn it by going outside?
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 3 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            INNOVATION AT THE INTERSECTION
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We&apos;re living in an era of incredible innovation in gaming —
            better graphics, deeper stories, more immersive worlds. But
            there&apos;s one frontier that&apos;s been largely untouched:
            actually connecting the game to the player&apos;s life outside the
            screen.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-gold font-semibold">
              Heroic Momentum is the first to directly tie in-game rewards with
              real-life activities.
            </span>{" "}
            You power up your character as you pump yourself up. When you go
            for a run, take a walk, hit the gym, or simply spend time moving
            and being active, your game reflects that. Your power increases.
            Your character levels up. The progress is real because the effort
            is real.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            This isn&apos;t about replacing games or shaming people for gaming.
            It&apos;s about rethinking what&apos;s possible. Games are powerful
            motivators — they&apos;ve taught us that progression, rewards, and
            achievements drive engagement. We&apos;ve just expanded the
            definition of what counts as an achievement.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 4 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THINKING BEYOND THE BOX
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The gaming industry has done an amazing job of creating experiences
            that pull players in. But most of the innovation happens inside the
            game engine — better mechanics, prettier visuals, more compelling
            narratives. All valuable. All important.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We wanted to ask: what if the real innovation was stepping outside
            that box? What if we could build a game that makes moving your body
            feel like the most rewarding quest?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            This is just one of the ways we&apos;re trying to bring new
            thinking to gaming. There&apos;s so much untapped potential when
            you stop asking &ldquo;how do we make a better game?&rdquo; and
            start asking &ldquo;how do we make a game that makes life
            better?&rdquo;
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-gold font-semibold">Heroic Momentum</span>{" "}
            is our answer to that question. It&apos;s the beginning of
            something we think could reshape how we think about gaming and
            health.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="font-body text-xs text-gold border border-gold/30 bg-gold/10 px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA box */}
        <div className="border border-gold/30 bg-charcoal p-8 lg:p-10 text-center space-y-4">
          <p className="font-heading text-3xl lg:text-4xl text-white tracking-wide">
            READY TO ANSWER THE CALL?
          </p>
          <p className="font-body text-silver/60 text-sm">
            Join the beta waitlist for Omniverse: Ascension
          </p>
          <Link
            href="/beta"
            className="inline-block mt-2 px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
          >
            Join Beta
          </Link>
        </div>

        {/* Back link bottom */}
        <div className="pt-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-xs text-silver/45 uppercase tracking-widest hover:text-gold transition-colors"
          >
            ← Back to The Briefing
          </Link>
        </div>
      </article>
    </div>
  );
}
