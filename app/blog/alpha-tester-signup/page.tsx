import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "Alpha Testers Wanted: Be First. Shape Everything. | 1775 Gaming",
  description:
    "We're opening a small, elite group of Alpha Testers to help forge OMNIVERSE: Ascension in real time. Active Alphas earn automatic Beta access — and there may be a lifetime upgrade waiting for the best of them.",
  openGraph: {
    type: "article",
    publishedTime: "2026-06-12T00:00:00Z",
    authors: ["1775 Gaming"],
  },
};

const TAGS = [
  "#OmniverseAscension",
  "#AlphaTesting",
  "#BetaAccess",
  "#MobileRPG",
  "#1775Gaming",
];

export default function AlphaTesterSignupArticle() {
  return (
    <div className="bg-marine-black min-h-screen">
      <BlogPostSchema
        title="Alpha Testers Wanted: Be First. Shape Everything."
        description={metadata.description ?? ""}
        publishedDate="2026-06-12"
        slug="alpha-tester-signup"
      />

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(109,40,217,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-xs text-silver/45 uppercase tracking-widest hover:text-gold transition-colors mb-10"
          >
            ← Back to The Briefing
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="inline-block bg-purple-700 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              Beta Updates
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              June 12, 2026 &nbsp;·&nbsp; 5 min read
            </span>
          </div>

          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            ALPHA TESTERS WANTED: BE FIRST. SHAPE EVERYTHING.
          </h1>

          <p className="font-body text-purple-400 text-base italic">
            Before beta. Before launch. Before the rest of the world sees it — you could be the ones who built it.
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Intro */}
        <div className="space-y-5">
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            We&apos;re not finished yet. That&apos;s not a warning — it&apos;s an invitation.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            OMNIVERSE: Ascension is being built right now. New systems are shipping every week. New features are going live, getting stress-tested, getting torn apart and rebuilt. It&apos;s a living project — and we need the kind of players who want to be in the room while it happens.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Not observers. Participants. People who find a bug and report it. People who try something the dev team didn&apos;t anticipate and come back with notes. People who want to help shape a game instead of just play one.
          </p>
          <p className="font-heading text-2xl text-purple-400 tracking-wide">
            That&apos;s the Alpha Program. And we&apos;re opening it now.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* What Alpha Testing Means */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT ALPHA ACTUALLY MEANS
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Let&apos;s be straight with you. Alpha is not a polished experience. It&apos;s earlier than beta — which means rougher edges, placeholder UI in some spots, features that are half-deployed, and mechanics that are still being tuned. You might hit a wall. You might encounter something that doesn&apos;t work right.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            That&apos;s the point. We need testers who can look at an unfinished system and give us useful feedback, not just &quot;it crashed.&quot; Tell us <em>what you were doing</em>. Tell us <em>what you expected</em>. Tell us what felt good and what felt wrong. That intelligence is invaluable — and it&apos;s what separates Alpha Testing from sitting on a waitlist.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            In exchange for showing up seriously, we&apos;re making a serious commitment back to you.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* What You're Testing */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT YOU&apos;LL BE TESTING
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The build is already deeper than most finished mobile games. Here&apos;s what Alpha Testers will get their hands on:
          </p>

          <div className="space-y-4 pl-4 border-l-2 border-purple-700/40">
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">THE GM AVATAR</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                A fully animated AI Game Master with real-time voice narration. It watches every move you make and responds — dynamically, dramatically, with a presence that no mobile game has ever had. This is the core of the experience, and we need testers hammering it from every angle.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">VOICE INPUT</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                Speak to your GM. Issue commands. Ask questions. Our local speech-to-text pipeline runs on-device for privacy and speed. We need testers with different accents, environments, and speech patterns to make it work for everyone.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">REAL-WORLD BATTLEMAP</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                Your actual street. Your actual city. Fog of War lifting as you explore your real neighborhood, with superhero combat layered on top of live map tiles. It sounds ambitious because it is.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">COMMS &amp; INBOX</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                A real-time player communication system and an in-game mail inbox — for squad coordination, official transmissions from HQ, and everything in between.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">PVP LEADERBOARDS</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                Regional rankings, player dossiers, and competitive play. The infrastructure is live — we need real players to stress it.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg text-purple-300 tracking-wide mb-1">QUICKSTART HEROES</p>
              <p className="font-body text-silver/65 text-sm leading-relaxed">
                Six ready-to-play character builds — Brick, Blaster, Speedster, Mystic, Martial Artist, Gadgeteer — balanced for street-level play under M&amp;M 3e rules. We want to know if they feel good from minute one.
              </p>
            </div>
          </div>

          <p className="font-body text-silver/75 text-base leading-relaxed">
            New systems will be added to the Alpha build as they ship. Testers who stick around will keep getting access to the latest, most unfinished, most exciting corners of the game.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* What You Get */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT ALPHA TESTERS GET
          </h2>

          {/* Guaranteed */}
          <div
            className="border border-purple-700/30 p-6"
            style={{
              background: "linear-gradient(135deg, rgba(109,40,217,0.10) 0%, transparent 80%)",
            }}
          >
            <p className="font-heading text-xl text-purple-300 tracking-wide mb-4">
              GUARANTEED: AUTOMATIC BETA INCLUSION
            </p>
            <p className="font-body text-silver/75 text-sm leading-relaxed">
              Every active Alpha Tester who stays in good standing will be automatically included in the official Closed Beta — no application required, no waitlist, no lottery. You put in the work during Alpha, you earn your seat at the Beta table. Full stop.
            </p>
          </div>

          {/* Lifetime Upgrade Hint */}
          <div
            className="border border-gold/20 p-6"
            style={{
              background: "linear-gradient(135deg, rgba(184,134,11,0.08) 0%, transparent 80%)",
            }}
          >
            <p className="font-heading text-xl text-gold tracking-wide mb-4">
              POSSIBLE: THE LIFETIME UPGRADE
            </p>
            <p className="font-body text-silver/75 text-sm leading-relaxed">
              We don&apos;t make promises we can&apos;t keep. But we&apos;ll say this plainly: the testers who show up consistently — who file real reports, who stress the systems, who stay engaged and stay clean — those are the people we&apos;re paying attention to.
            </p>
            <p className="font-body text-silver/75 text-sm leading-relaxed mt-3">
              Accounts that remain in good standing throughout Alpha testing may receive a lifetime account upgrade. Details are still being finalized, but the signal we&apos;re sending is this: <span className="text-gold font-semibold">loyal, serious testers will not be forgotten when the game goes live.</span>
            </p>
          </div>

          <p className="font-body text-silver/60 text-sm leading-relaxed italic">
            &quot;Good standing&quot; means: active participation, no exploiting, no harassment, no cheating. Be the kind of player you&apos;d want to share a server with.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Who We're Looking For */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHO WE&apos;RE LOOKING FOR
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We&apos;re not looking for influencers. We&apos;re not chasing follower counts. We want players who actually care about the craft of making a game — people who&apos;ve been waiting for a mobile RPG that treats them like adults, and who want to be part of building it.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Tabletop RPG players. JRPG veterans. People who read patch notes for fun. People who have opinions about game balance and aren&apos;t afraid to share them. People who will try to break the system and come back with a detailed description of exactly how they did it.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            If that sounds like you — we want you. The Alpha group will be kept intentionally small so every piece of feedback actually reaches the team.
          </p>
          <p className="font-heading text-2xl text-scarlet tracking-wide">
            This is not a number. This is a room.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* CTA */}
        <div className="space-y-6 pt-4">
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The build is running. Features are shipping. Every week we delay is a week we&apos;re missing feedback that could make the game better.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Sign up through the Beta page — Alpha Testers are being pulled from that pool first. Flag in your application that you&apos;re interested in Alpha access specifically. We&apos;re reviewing applications now.
          </p>
          <p className="font-body text-gold font-semibold text-base">
            The city needs heroes. So does the game.
          </p>
          <div className="pt-2">
            <Link
              href="/beta"
              className="inline-block px-8 py-4 bg-purple-700 hover:bg-purple-600 font-body font-semibold text-sm uppercase tracking-widest text-white transition-colors duration-300"
            >
              Apply for Alpha Access →
            </Link>
          </div>
        </div>

      </article>

      {/* ─── FOOTER ─── */}
      <section className="border-t border-white/8 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="font-body text-xs text-gold/60 hover:text-gold transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="font-body text-silver/35 text-xs mt-8">
            — 1775 Dev Team
          </p>
        </div>
      </section>
    </div>
  );
}
