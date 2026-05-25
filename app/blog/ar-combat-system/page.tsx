import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "AR Combat in the Real World: Our Technical Approach",
  description:
    "How we're bringing augmented reality encounters to OMNIVERSE: Ascension — no headsets, no extra hardware, just the phone in your pocket.",
  openGraph: {
    type: "article",
    publishedTime: "2026-05-07T10:00:00Z",
    authors: ["1775 Gaming"],
  },
};

const TAGS = [
  "#AugmentedReality",
  "#MobileGaming",
  "#OMNIVERSE",
  "#GameDev",
  "#AITECH",
  "#FitnesGaming",
];

export default function ARCombatTechnicalApproach() {
  return (
    <div className="bg-marine-black min-h-screen">
      <BlogPostSchema
        title="AR Combat in the Real World: Our Technical Approach"
        description={metadata.description ?? ""}
        publishedDate="2026-05-07"
        slug="ar-combat-system"
      />

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(29,78,216,0.12) 0%, transparent 70%)",
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
            <span className="inline-block bg-blue-700 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              AR / AI Tech
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              May 7, 2026 &nbsp;·&nbsp; 6 min read
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            AR COMBAT IN THE REAL WORLD: OUR TECHNICAL APPROACH
          </h1>

          {/* Subheadline */}
          <p className="font-body text-blue-400 text-base italic">
            No headsets. No extra hardware. Just the phone you&apos;re already carrying — and the world around you.
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Intro */}
        <div className="space-y-5">
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            When we started building OMNIVERSE: Ascension, one question kept
            coming back to us during design sessions: <em>what does it actually
            feel like to be a hero?</em>
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Not in a menu. Not on a map screen. In the world you&apos;re already
            standing in.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            That question pushed us toward augmented reality — not as a gimmick,
            but as a natural extension of something we were already doing. If
            your steps power your hero. If your workouts earn you CAPS. If your
            real-world activity is already threaded into the game&apos;s
            economy... then the world around you is already part of the
            OMNIVERSE. It made sense to let you see it that way, too.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            This post walks through our thinking — and some of the technical
            decisions — behind how AR fits into Ascension. We&apos;ll be honest
            about where things stand and what we&apos;re working toward.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 1 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            STARTING FROM WHAT&apos;S ALREADY IN YOUR POCKET
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The first and most important decision we made was this:{" "}
            <span className="text-white font-semibold">no additional hardware required.</span>
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            No headsets. No glasses. No peripherals. Just the phone you&apos;re
            already carrying.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Modern smartphones — both iOS and Android — ship with capable camera
            systems, gyroscopes, accelerometers, and depth-sensing capabilities
            that make lightweight AR possible without any additional setup.
            ARKit on iOS and ARCore on Android have matured considerably, and
            the gap between what&apos;s technically achievable and what feels
            natural to a player has narrowed enough to work with.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            That constraint — phone only — wasn&apos;t a limitation we
            reluctantly accepted. It was a design principle we chose. Ascension
            is built around the idea that heroism lives in your daily life, not
            in equipment you have to buy. Requiring a headset would contradict
            everything{" "}
            <span className="text-gold font-semibold">Heroic Momentum</span>{" "}
            stands for.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 2 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            HOW AR CONNECTS TO THE OMNIVERSE LAYER
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            In Ascension, the world has two layers. There&apos;s the OMNIVERSE
            — the persistent multiverse your hero inhabits, with its factions,
            campaigns, nemeses, and lore. And there&apos;s the physical world
            you move through every day.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Heroic Momentum already bridges those two layers. Your steps, your
            workouts, your daily movement — they generate CAPS and Omni-Credits
            in the OMNIVERSE. You&apos;re already affecting the game world by
            living your life.
          </p>
          <p className="font-heading text-2xl text-blue-400 tracking-wide">
            AR extends that bridge visually.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Rather than being purely an abstract system (&ldquo;you walked
            12,000 steps today&rdquo;), AR gives the OMNIVERSE a presence in
            your physical space. Your environment can become a mission context.
            A parking lot becomes a crisis zone. A park becomes a{" "}
            <span className="text-gold font-semibold">FAFO</span> encounter
            location. The neighborhood you walk through every morning becomes a
            territory your hero actually patrols.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We&apos;re not rendering persistent 3D structures on every street
            corner — that&apos;s a level of infrastructure that doesn&apos;t
            serve the game we&apos;re making. What we&apos;re doing is more
            targeted: AR-enhanced moments tied to specific mission types and
            encounters, triggered contextually, anchored to your physical
            location via GPS and camera orientation.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 3 - FAFO */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE FAFO ENCOUNTER LAYER
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            FAFO — Fuck Around and Find Out — is already the most
            improvisational part of Ascension. You step into an encounter
            without knowing exactly what&apos;s coming. The difficulty tier sets
            the stakes; the AI GM generates the narrative on the fly.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            That structure maps naturally to an AR experience.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            When a FAFO encounter fires in an AR-enabled context, the encounter
            narrative can reference your actual surroundings. The AI GM
            isn&apos;t just generating a generic street fight — it knows
            you&apos;re outside, it has a sense of the environment type (urban,
            suburban, open space), and it can frame the encounter accordingly.
            The physical world provides the stage; the OMNIVERSE provides the
            antagonist.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            On the visual side, encounter indicators, threat overlays, and
            outcome animations can be anchored to real-world surfaces rather
            than rendered purely on a 2D screen. Your d20 roll doesn&apos;t
            just produce a number — it produces a result that plays out against
            the backdrop of wherever you&apos;re standing.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The technical implementation here leans on ARKit/ARCore&apos;s
            plane detection and world-space anchoring. We detect horizontal
            surfaces (ground, pavement) and use them as anchors for encounter
            visuals. It&apos;s not trying to be something cinematic that
            requires studio-level production. It&apos;s trying to make a random
            encounter feel like it happened <em>here</em>, in the place you
            actually are.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 4 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            MISSIONS AND AR CONTENT
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Campaigns in Ascension are chapter-based, AI-driven, and designed
            to unfold over multiple sessions. Most campaign content is narrative
            — you and your AI GM working through a story together.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Some missions, though, are built around <em>doing something in the
            world</em> — not just reading and responding to narrative, but
            physically moving, arriving at a location, or completing a
            real-world action that feeds back into the mission state.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We&apos;re building mission types that incorporate AR presentation
            without requiring the player to be somewhere specific or do
            something complicated. The design principle is that{" "}
            <span className="text-gold font-semibold">
              AR should lower the barrier to immersion, not raise it.
            </span>{" "}
            If triggering an AR moment requires you to stand still for 30
            seconds while the app calibrates, we&apos;ve already lost.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            What we&apos;re targeting instead:
          </p>
          <ul className="space-y-4 pl-1">
            {[
              {
                label: "Encounter arrival sequences",
                body: "When you reach a mission waypoint, a brief AR overlay frames the scene before the narrative begins.",
              },
              {
                label: "Threat visualization",
                body: "Enemy indicators rendered in world-space during combat encounters, giving positional weight to what the AI GM is describing.",
              },
              {
                label: "Victory moments",
                body: "Outcome animations anchored to your environment so that winning a crisis-tier encounter feels like it happened in your world, not a generic game UI.",
              },
              {
                label: "Heroic Momentum celebrations",
                body: "When you hit your daily step goal or log a workout, a short AR moment acknowledges it in the world around you — not just an app notification.",
              },
            ].map(({ label, body }) => (
              <li key={label} className="flex gap-3">
                <span className="text-blue-400 mt-1 flex-shrink-0">▸</span>
                <p className="font-body text-silver/75 text-base leading-relaxed">
                  <span className="text-white font-semibold">{label}</span>{" "}
                  — {body}
                </p>
              </li>
            ))}
          </ul>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            None of this requires you to be somewhere special. It works in your
            living room, on your commute, in the gym parking lot. The phone
            handles the spatial anchoring; the AI GM handles the narrative
            context; you bring the location.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 5 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT WE&apos;RE NOT DOING (AND WHY)
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It&apos;s worth being direct about the things we decided against.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-white font-semibold">Persistent world objects</span>{" "}
            — the idea of leaving AR markers at physical locations for other
            players to find — is technically possible but operationally complex
            in ways that don&apos;t serve the game we&apos;re making right now.
            It introduces moderation challenges, hardware variation issues, and
            a dependency on player density in a given area that doesn&apos;t
            match how Ascension is built. It might be a direction we revisit.
            It&apos;s not where we&apos;re starting.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-white font-semibold">Full environmental occlusion and real-time physics</span>{" "}
            — the kind of AR that places a fully rendered 3D character in your
            space and has it interact with furniture, shadows, and depth —
            requires a level of device capability and battery consumption that
            would cut off too many players. We&apos;re making deliberate choices
            to keep the AR layer light enough to work well on mid-range
            hardware, not just flagship devices.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            <span className="text-white font-semibold">Mandatory AR</span>{" "}
            — none of the AR content is required to play the game. FAFO
            encounters, campaigns, and Heroic Momentum all function completely
            in standard mode. AR is an enhancement layer, not a gate.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 6 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE STACK BEHIND IT
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            For the technically curious: Ascension is built on React Native with
            Expo. AR integration on this stack isn&apos;t as plug-and-play as it
            would be in a native Swift or Kotlin app, but the tooling has
            improved. We&apos;re working with{" "}
            <span className="text-blue-400 font-semibold">ViroReact</span> and
            direct bridge modules to ARKit/ARCore for the core spatial
            anchoring, with our own layer connecting AR session state to the
            rest of the game.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The AI GM doesn&apos;t need to know anything about AR to work within
            it. It generates narrative. The AR layer presents that narrative in
            physical space. They&apos;re decoupled, which keeps both systems
            cleaner and makes it easier to iterate on the AR presentation
            without touching the story generation logic.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Location context, when used, is handled with standard device GPS.
            We don&apos;t require fine-grained location beyond what&apos;s
            needed to establish &ldquo;you&apos;re outside&rdquo; vs.
            &ldquo;you&apos;re stationary indoors&rdquo; for encounter framing
            purposes.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 7 — closing */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHERE THIS GOES
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We&apos;re not announcing a release date for AR mission content in
            this post. What we can say is that the architecture supports it, the
            design principles are settled, and the constraint — phone only, no
            extra hardware — holds.
          </p>
          <p className="font-heading text-2xl text-blue-400 tracking-wide">
            The OMNIVERSE is already in your neighborhood.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            You&apos;re already earning power by moving through it. The AR layer
            is just helping you see what&apos;s always been there.
          </p>
          <p className="font-body text-silver/55 text-sm leading-relaxed">
            More on this as it develops.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="font-body text-xs text-blue-400 border border-blue-400/30 bg-blue-400/10 px-3 py-1.5"
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
