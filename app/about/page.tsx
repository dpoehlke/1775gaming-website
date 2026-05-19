import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | 1775 Gaming LLC",
  description:
    "Learn about 1775 Gaming LLC — our mission to revolutionize mobile gaming through AI, augmented reality, and real-world health integration.",
};

function ValueCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="group relative p-8 bg-marine-black border border-white/5 hover:-translate-y-1 transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-scarlet scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <h3 className="font-heading text-2xl text-white tracking-wide mb-4">
        {title}
      </h3>
      <p className="font-body text-silver/60 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex items-center justify-center min-h-[52vh] py-28 px-4 bg-marine-black overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(204,0,0,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            Our Story
          </p>
          <h1 className="font-heading text-7xl lg:text-[8.5rem] text-white tracking-wide leading-none mb-6">
            ABOUT 1775 GAMING
          </h1>
          <p className="font-body text-silver/70 text-lg leading-relaxed">
            Born from a vision to revolutionize mobile gaming through AI, AR,
            and human health
          </p>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="py-24 px-4 bg-marine-black border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Pull quote */}
          <div>
            <p className="font-heading text-5xl lg:text-[3.75rem] text-scarlet leading-tight tracking-wide">
              &ldquo;GAMING THAT MAKES YOU STRONGER&rdquo;
            </p>
          </div>

          {/* Right: Mission copy */}
          <div className="space-y-5">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-2">
              Our Mission
            </p>
            <div className="space-y-4">
              <p className="font-body text-silver/75 text-base lg:text-lg leading-relaxed">
                1775 Gaming LLC was founded on a simple but revolutionary idea:
                what if your games made you healthier? What if the hours you
                spent gaming also made you stronger, faster, and more active in
                the real world?
              </p>
              <p className="font-body text-silver/75 text-base leading-relaxed">
                We are building a new category of mobile gaming — one where
                artificial intelligence creates infinite stories, augmented
                reality brings those stories into your world, and your
                real-world health and fitness directly powers your in-game
                progression.
              </p>
              <p className="font-body text-white font-semibold text-base leading-relaxed">
                This is not the future of gaming. This is gaming, right now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY 1775 ─── */}
      <section className="py-24 px-4 bg-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            Why 1775?
          </p>
          <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-8">
            THE SPIRIT OF REVOLUTION
          </h2>
          <p className="font-body text-silver/70 text-base lg:text-lg leading-relaxed">
            1775 marks the birth of the American fighting spirit — the year
            citizen soldiers stood against impossible odds and changed the world
            forever. At 1775 Gaming, we carry that same spirit into every game
            we build. We are the underdogs. We are the innovators. And we are
            just getting started.
          </p>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-24 px-4 bg-charcoal border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
              What We Stand For
            </p>
            <h2 className="font-heading text-5xl text-white tracking-wide">
              OUR VALUES
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
              title="INNOVATION FIRST"
              body="We build what hasn't been built before. Every title we develop pushes the boundaries of what mobile gaming can be."
            />
            <ValueCard
              title="COMMUNITY DRIVEN"
              body="Our players shape our games. Beta testers, fans, and community members have a direct voice in everything we create."
            />
            <ValueCard
              title="MISSION READY"
              body="Like the soldiers of 1775, we are disciplined, prepared, and committed to executing at the highest level."
            />
          </div>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section className="py-24 px-4 bg-marine-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
              Leadership
            </p>
            <h2 className="font-heading text-5xl text-white tracking-wide">
              MEET THE FOUNDER
            </h2>
          </div>

          <div className="max-w-lg mx-auto bg-charcoal border border-white/5 p-10 text-center">
            {/* Avatar circle with initials */}
            <div className="w-24 h-24 rounded-full bg-scarlet flex items-center justify-center mx-auto mb-6 ring-4 ring-scarlet/20">
              <span className="font-heading text-3xl text-white tracking-wider">
                DO
              </span>
            </div>

            <h3 className="font-heading text-3xl text-white tracking-wide mb-1">
              Darin Oehlke
            </h3>
            <p className="font-body text-gold text-xs uppercase tracking-widest mb-6">
              Founder &amp; Lead Developer
            </p>
            <p className="font-body text-silver/70 text-sm leading-relaxed mb-6">
              Darin Oehlke is the founder and lead developer of 1775 Gaming LLC.
              With a vision for AI-powered mobile gaming that integrates
              real-world health data and augmented reality, Darin is building the
              next generation of mobile gaming from the ground up.
            </p>
            <p className="font-body text-silver/40 text-xs uppercase tracking-widest">
              📍 Weatherby Lake, MO
            </p>
          </div>
        </div>
      </section>

      {/* ─── CONTACT CTA ─── */}
      <section className="py-20 px-4 bg-charcoal border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-5xl text-white tracking-wide mb-4">
            GET IN TOUCH
          </h2>
          <p className="font-body text-silver/60 text-base mb-10 leading-relaxed">
            For press inquiries, partnership opportunities, or licensing
            discussions:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:legal@1775gaming.com"
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-gold border border-gold hover:bg-gold/10 transition-colors duration-300 text-center"
            >
              legal@1775gaming.com
            </a>
            <Link
              href="/beta"
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300 text-center"
            >
              Join the Mission &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
