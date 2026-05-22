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

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-gold font-bold flex-shrink-0">•</span>
      <span>{children}</span>
    </li>
  );
}

export default function HeroicMomentumPart1() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Heroic Momentum Part 1: Leveling Up In Real Life
        </h1>
        <div className="text-gray-400 text-sm">
          <p>Published May 22, 2026</p>
          <p>by 1775 Gaming</p>
        </div>
      </header>

      <BlogPostSchema
        title="Heroic Momentum Part 1: Leveling Up In Real Life"
        description={metadata.description}
        datePublished="2026-05-22"
        author="1775 Gaming"
      />

      <section className="prose prose-invert max-w-none mb-8">
        <h2>The Challenge We're All Facing</h2>
        <p>
          The numbers tell a story we all know too well. The average person spends over 7 hours a day on screens—scrolling, clicking, and engaging with digital worlds. Meanwhile, physical activity has hit a quiet crisis. Most of us fall short of the World Health Organization's recommendation of 150 minutes of moderate exercise per week. We've created an imbalance: we're becoming experts at controlling avatars on screens while our own bodies move less and less.
        </p>
        <p>
          It's not about blame or guilt. Life is demanding, schedules are packed, and those screens offer real value—connection, entertainment, learning. But somewhere in the shift toward digital living, we've left something important behind: the simple act of moving our bodies, getting outside, and feeling the real-world benefits of physical activity.
        </p>
        <p>
          The health impacts are real—increased sedentary time is linked to higher rates of obesity, cardiovascular issues, and mental health challenges. Yet despite knowing this, the trend continues. Why? Because when we're caught up in the game, the real world feels less compelling.
        </p>
      </section>

      <section className="prose prose-invert max-w-none mb-8">
        <h2>A Different Approach</h2>
        <p>
          I was watching <em>Solo Leveling</em>—the anime phenomenon that's captivated gamers everywhere. If you haven't seen it, it's the ultimate power fantasy: a weak protagonist discovers a leveling system that lets him grow exponentially stronger. The show is brilliantly done, and like countless other gamers, I found myself daydreaming about it. What if that were real? What if you could actually level up like that?
        </p>
        <p>
          Then the thought hit me: why not create a version of that? Not just in a fantasy world, but in real life.
        </p>
        <p>
          We started thinking about this problem differently. What if the game—the thing that captivates us—could actually encourage us to step away from the screen and move?
        </p>
        <p>
          What if your character's power wasn't just a reward for grinding, but a reflection of your own real-world effort? What if the next level wasn't just waiting in your phone, but out there, waiting for you to earn it by going outside?
        </p>
        <p>
          That's the core insight behind <strong>Heroic Momentum</strong>. We believe that gaming and real-world health don't have to be at odds. They can work together.
        </p>
      </section>

      <section className="prose prose-invert max-w-none mb-8">
        <h2>Innovation at the Intersection</h2>
        <p>
          We're living in an era of incredible innovation in gaming—better graphics, deeper stories, more immersive worlds. But there's one frontier that's been largely untouched: actually connecting the game to the player's life outside the screen.
        </p>
        <p>
          <strong>Heroic Momentum is the first to directly tie in-game rewards with real-life activities.</strong> You power up your character as you pump yourself up. When you go for a run, take a walk, hit the gym, or simply spend time moving and being active, your game reflects that. Your power increases. Your character levels up. The progress is real because the effort is real.
        </p>
        <p>
          This isn't about replacing games or shaming people for gaming. It's about rethinking what's possible. Games are powerful motivators. They've taught us that progression, rewards, and achievements drive engagement. We've just expanded the definition of what counts as an achievement.
        </p>
      </section>

      <section className="prose prose-invert max-w-none mb-12">
        <h2>Thinking Beyond the Box</h2>
        <p>
          The gaming industry has done an amazing job of creating experiences that pull players in. But most of the innovation happens inside the game engine—better mechanics, prettier visuals, more compelling narratives. All valuable. All important.
        </p>
        <p>
          We wanted to ask: what if the real innovation was stepping outside that box? What if we could build a game that makes moving your body feel like the most rewarding quest?
        </p>
        <p>
          This is just one of the ways we're trying to bring new thinking to gaming. There's so much untapped potential when you stop asking "how do we make a better game?" and start asking "how do we make a game that makes life better?"
        </p>
        <p>
          <strong>Heroic Momentum</strong> is our answer to that question. It's the beginning of something we think could reshape how we think about gaming and health.
        </p>
      </section>

      <footer className="border-t border-gray-700 pt-8 mt-12">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span key={tag} className="text-gold text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          <em>The adventure starts when you step outside. Your character is waiting.</em>
        </p>
      </footer>
    </article>
  );
}

