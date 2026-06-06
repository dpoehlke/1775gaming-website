import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "Desolation: A World Ravaged by War | 1775 Gaming",
  description:
    "Discover Desolation, our second title in development. A post-apocalyptic journey where your choices determine if humanity rises or falls into darkness.",
  openGraph: {
    type: "article",
    publishedTime: "2026-05-27T00:00:00Z",
    authors: ["1775 Gaming"],
  },
};

const TAGS = [
  "#Desolation",
  "#GameDev",
  "#PostApocalyptic",
  "#Survival",
  "#ChoiceMatters",
];

export default function DesolationArticle() {
  return (
    <div className="bg-marine-black min-h-screen">
      <BlogPostSchema
        title="Desolation: A World Ravaged by War"
        description={metadata.description ?? ""}
        publishedDate="2026-05-27"
        slug="desolation-world-awaits"
      />

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,0,0,0.15) 0%, transparent 70%)",
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
            <span className="inline-block bg-amber-700 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              Game Reveal
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              May 27, 2026 &nbsp;·&nbsp; 7 min read
            </span>
          </div>

          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            DESOLATION: THE WORLD AWAITS YOUR CHOICE
          </h1>

          <p className="font-body text-amber-400 text-base italic">
            Humanity fractured. Civilization in ruins. Your village starving. The wastes call.
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Intro */}
        <div className="space-y-5">
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            War came like a plague. Not quick. Not clean. It festered. It spread. It burned everything—the cities, the nations, the very idea that humanity could keep climbing higher. When the dust settled, there was no dust to settle. There was only ash. And silence.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Mankind was thrown backward. Not in years. In centuries. The knowledge, the infrastructure, the systems that held us together—all of it gone. The survivors clustered into villages, tribes, scavenger bands. Some found new purpose in the wastes. Others found only hunger.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Your village is one of the failing ones.
          </p>
          <p className="font-heading text-2xl text-amber-400 tracking-wide">
            Winter is coming. The granaries are empty. And you've been chosen.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 1 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE WEIGHT OF SELECTION
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            You weren&apos;t volunteered. You weren&apos;t conscripted. You were <em>chosen</em>. The elders studied you. The hunters watched you. Something in you marked you as different—capable, adaptable, or maybe just desperate enough to do what needs doing.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The task is impossible: venture into the wastes. Find other villages, other settlements, other survivors. Bring back food. Bring back tools. Bring back <em>hope</em>, if you can find it. Your people are dying. Not quickly, but inevitably. The math is simple and brutal.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            They&apos;re betting everything on you.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The wastes are vast. The storms come without warning—walls of wind and rain that can bury you where you stand. The ruins of the old world still stand in places, twisted monuments to what we lost. Some settlements you find will have food to trade. Others will have weapons ready. Some survivors remember civilization. Others have already decided there&apos;s a better way—a way of taking instead of trading, of strength instead of cooperation.
          </p>
          <p className="font-heading text-2xl text-scarlet tracking-wide">
            And you have to decide who you are in that world.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 2 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE CHOICES THAT DEFINE US
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Will you be a scout? A trader? Someone who barks out offers and threats, who moves through the wastes with armor and steel, claiming what you need?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Will you be a diplomat? Building alliances, negotiating terms, learning that the communities scattered across the ruins have their own stories, their own pain, their own reasons for fear? Will you convince them that cooperation—that the old idea of civilization—might be worth reviving?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Or will you be a warlord?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Because the wastes have a way of corrupting ambition. Other villages have done it. Settlements that started out desperate, like yours, but somewhere along the way decided that <em>taking</em> was easier than trading. That fear was more reliable than trust. That the only way to survive was to make sure everyone else was afraid of <em>you</em>.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The game doesn&apos;t judge you for this. The world doesn&apos;t care about morality. It only cares about survival. But your village will care about what you become. And you will care about what they become because of your choices.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 3 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            YOUR PEOPLE, YOUR BURDEN
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Desolation is built on one core idea: <em>your choices matter because people&apos;s lives depend on them</em>. This isn&apos;t a game where you hunt for the "right answer." There is no right answer in a world of ash and survival.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            You can bring your village into a network of communities working together to rebuild something better. You can establish dominance and rule through strength. You can trade, hustle, and navigate the gray zones between cooperation and conflict. You can chase rumors of a safe haven, a place where the old world wasn&apos;t destroyed. You can build a reputation—for mercy, for ruthlessness, for cunning, for honor.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Every choice reshapes your village. Every alliance changes the map. Every conflict opens new paths or closes them forever. The people you meet in the wastes have their own agency, their own fears, their own visions for what humanity could be.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Your village starts on the brink of collapse. But where it ends—that&apos;s determined by every decision you make in the wastes. Whether they survive is up to you. Whether they <em>thrive</em> is up to what kind of leader, diplomat, or tyrant you choose to become.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 4 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            SURVIVAL OR CIVILIZATION?
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Desolation asks a question that matters more now than it did before the world broke: What are we willing to do to survive? And after we survive, what are we willing to give up to make it mean something?
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It&apos;s easy to be noble when your belly is full. It&apos;s easy to believe in cooperation when you&apos;re not watching your children starve. It&apos;s easy to reject violence as a solution when violence isn&apos;t your only option.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            In Desolation, you don&apos;t have those luxuries. You have your village. You have the wastes. You have other survivors out there, each with their own impossible choices. And you have yourself—a person being forged in real time by every decision you make.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The world is broken. Civilization collapsed. Mankind was thrown back into the stone age. But that&apos;s not the story of Desolation.
          </p>
          <p className="font-heading text-2xl text-amber-400 tracking-wide">
            The story is whether it climbs back out.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Call to Action */}
        <div className="space-y-5 pt-8">
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Desolation is in development now. We&apos;re building a world where your choices echo across the wastes, where alliances matter, where the line between survival and tyranny is thin and easy to cross.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The wastes are waiting. The choice is yours.
          </p>
          <p className="font-body text-gold font-bold text-base">
            Will you help lead your people into a brighter future?
          </p>
          <p className="font-body text-gold font-bold text-base">
            Or will you turn to warmongering like so many in the past?
          </p>
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
