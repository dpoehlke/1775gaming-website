import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BREAKING: An AI Game Master Is Coming to Mobile — And It Never Cancels | 1775 Gaming",
  description:
    "Mobile gamers, the tabletop RPG you've been waiting your whole life to carry in your pocket is almost here — and it thinks faster than any human GM alive.",
};

const TAGS = [
  "#superheroRPG",
  "#mobileRPG",
  "#AIgamemaster",
  "#TTRPG",
  "#comingsoon",
];

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-gold font-bold flex-shrink-0 mt-0.5">✓</span>
      <span className="font-body text-silver/75 text-base leading-relaxed">
        {children}
      </span>
    </li>
  );
}

export default function BlogPostPage() {
  return (
    <div className="bg-marine-black min-h-screen">

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(204,0,0,0.13) 0%, transparent 70%)",
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
            <span className="inline-block bg-scarlet px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              Game Announcement
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              May 17, 2025 &nbsp;·&nbsp; 5 min read
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            BREAKING: AN AI GAME MASTER IS COMING TO MOBILE — AND IT NEVER
            CANCELS
          </h1>

          {/* Subheadline */}
          <p className="font-body text-gold text-base italic">
            All the News That&apos;s Fit to Print — From Every Reality
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Intro section */}
        <div className="space-y-5">
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            Mobile gamers, the tabletop RPG you&apos;ve been waiting your whole
            life to carry in your pocket is almost here — and it thinks faster
            than any human GM alive.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Coming soon to iOS and Android. Drop the scheduling conflicts, the
            cancelled sessions, and the six-month waits. Just you, your
            superhero, and an AI-powered Game Master that never sleeps, never
            cancels, and never forgets a single choice you&apos;ve made.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 2 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THIS GAME WILL LET ME ACTUALLY ROLEPLAY
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            For years, mobile RPG players have made peace with a brutal truth:
            depth is a desktop thing. Real choices, real consequences, emergent
            narrative — those belong to the tabletop crowd.
          </p>
          <p className="font-heading text-2xl text-scarlet tracking-wide">
            Not anymore.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            OMNIVERSE: Ascension is built on the{" "}
            <span className="text-gold font-semibold">
              Mutants &amp; Masterminds 3e
            </span>{" "}
            ruleset and will play exactly like a full campaign. Your choices
            shape the world. NPCs remember your reputation. The story bends
            around you, not a pre-written script.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The secret? An AI Game Master running every session. Throw it a
            curveball — talk your way out of a fight, blow your cover, make an
            alliance with the villain — and it rolls with it. Every session is
            unique because you are unique.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 3 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            YOUR FACE ON THE FRONT PAGE
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Roll your stats. Write your backstory. Then watch{" "}
            <span className="text-gold font-semibold">Gemini Imagen 3</span>{" "}
            turn your imagination into a full hero portrait — unique to you,
            generated on the spot. No stock art. No generic avatars. Your
            superhero, visualized.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 4 */}
        <div className="space-y-6">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT MAKES THIS DIFFERENT
          </h2>
          <ul className="space-y-4">
            <BulletItem>
              A GM that adapts — not a dialogue tree, a real narrative engine
              that reacts to what you actually do
            </BulletItem>
            <BulletItem>
              True TTRPG rules on mobile — Mutants &amp; Masterminds 3e, in
              your pocket
            </BulletItem>
            <BulletItem>
              AI-generated hero portraits — your character, illustrated, every
              time
            </BulletItem>
            <BulletItem>
              Persistent consequence — your choices echo across sessions
            </BulletItem>
            <BulletItem>
              Anytime. Anywhere. No group needed. No DM needed. No waiting.
            </BulletItem>
          </ul>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 5 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE OMNIVERSE IS ALMOST HERE
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            OMNIVERSE: Ascension is coming soon to iOS and Android. Follow 1775
            Gaming now and be first in line when the campaign goes live.
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
