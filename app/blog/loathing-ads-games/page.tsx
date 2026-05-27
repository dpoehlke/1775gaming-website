import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostSchema } from "../../components/StructuredData";

export const metadata: Metadata = {
  title: "The Tyranny of Ads: Why Games Should Go Ad-Free",
  description:
    "A passionate manifesto on why mobile games and all games should eliminate ads and monetize through integrity instead.",
  openGraph: {
    type: "article",
    publishedTime: "2026-05-23T00:00:00Z",
    authors: ["1775 Gaming"],
  },
};

const TAGS = [
  "#AdFreeGaming",
  "#MobileGaming",
  "#GameDev",
  "#Monetization",
  "#PlayerFirst",
];

export default function LoathingAdsGames() {
  return (
    <div className="bg-marine-black min-h-screen">
      <BlogPostSchema
        title="The Tyranny of Ads: Why Mobile Games Should Go Ad-Free"
        description={metadata.description ?? ""}
        publishedDate="2026-05-23"
        slug="loathing-ads-games"
      />

      {/* ─── HERO ─── */}
      <section className="relative py-24 px-4 border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(190,18,60,0.10) 0%, transparent 70%)",
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
            <span className="inline-block bg-rose-700 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white">
              Game Dev
            </span>
            <span className="font-body text-silver/35 text-xs uppercase tracking-wider">
              May 23, 2026 &nbsp;·&nbsp; 5 min read
            </span>
          </div>

          <h1 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-5">
            THE TYRANNY OF ADS: WHY MOBILE GAMES SHOULD GO AD-FREE
          </h1>

          <p className="font-body text-gold text-base italic">
            A manifesto on contempt, attention, and monetizing with integrity.
          </p>
        </div>
      </section>

      {/* ─── ARTICLE BODY ─── */}
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Intro */}
        <div className="space-y-5">
          <p className="font-body text-silver/80 text-lg leading-relaxed">
            You&apos;re three seconds into a gaming session. You&apos;ve got
            five minutes before your next meeting. You load up the game you
            actually want to play — the one you&apos;ve been waiting to get
            back to. But before you can even tap the screen, a full-screen ad
            erupts.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It&apos;s for some other game. Some hyper-casual puzzle game with
            shitty graphics and a title you&apos;ll forget before the ad ends.
            You watch helplessly as a 30-second countdown timer mocks you. 15
            seconds left. 10. 5. Finally, it&apos;s gone.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            You&apos;ve now spent 25% of your gaming session watching an ad for
            a game you will never, ever play.
          </p>
          <p className="font-heading text-2xl text-rose-400 tracking-wide">
            This is the absurdity of ad-supported games.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 1 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE INSULT AT THE CORE
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Here&apos;s what really gets me: the fundamental betrayal of it
            all. You <em>chose</em> to play <em>this</em> game. You downloaded
            it. You opened it. You want to <em>play it</em>. And the first
            thing the game does is punish you by forcing you to watch an ad for
            a <em>different</em> game.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It&apos;s like buying a pizza and being forced to watch a
            commercial for burgers before you can take a bite.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The worst part? The ads are for games you&apos;re never going to
            play. They&apos;re targeting you with games that don&apos;t match
            your interests, your skill level, or your taste. They&apos;re
            generic, low-effort knockoffs churned out by studios that
            understand one thing: how to farm ad revenue.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            And we&apos;ve all accepted this. We&apos;ve normalized it. We sit
            there and wait. We watch the countdown. We tap &ldquo;close&rdquo;
            when the timer finally lets us. We&apos;ve been trained like
            Pavlov&apos;s dogs to just... accept it.
          </p>
          <p className="font-heading text-2xl text-scarlet tracking-wide">
            But why?
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 2 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE ECONOMICS OF CONTEMPT
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The answer is money, of course. Ad networks will pay developers for
            impressions. Every time you watch an ad — even if you&apos;re
            seething with rage — that&apos;s a dollar sign. Multiply that by
            millions of players, and suddenly, a game that costs $0.99 (or is
            &ldquo;free&rdquo;) becomes a revenue machine.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The catch? That revenue is built on contempt.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Free-to-play games have become hostage situations. The game is
            free, which sounds great — until you realize you&apos;re not the
            customer. You&apos;re the product. Your attention is being
            harvested and sold to the highest bidder. Every ad is a transaction
            where your time becomes someone else&apos;s profit.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            And the worst part is that this model <em>works</em>. It&apos;s so
            effective at extracting money that it&apos;s become the default for
            indie developers and massive studios alike. Because if they leave,
            there are a million other players willing to tolerate the ads.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 3 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE DEVELOPER&apos;S DILEMMA — AND THE WAY OUT
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            I get it. I&apos;m a game developer too. I know the pressure to
            monetize. Servers cost money. Development takes time. If
            you&apos;re not charging an upfront price, you need <em>some</em>{" "}
            way to fund your work.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            But there are other options. In-app purchases for cosmetics.
            Premium tiers that unlock extra features. Battle passes that reward
            engaged players. Even a one-time &ldquo;remove ads&rdquo; purchase
            for $2.99 that lets players vote with their wallet.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            The irony? Players are <em>willing</em> to pay. They just
            don&apos;t want to be waterboarded by ads for games they
            don&apos;t want. A paid game with no ads? I&apos;ll buy it. A free
            game with cosmetic purchases and no ads? I&apos;ll spend money on
            it. A free game where ads are <em>optional</em> — where I choose
            to watch one to get a reward? That respects my time.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            But a free game that ambushes me with ads every five seconds?
            That&apos;s not monetization.{" "}
            <span className="text-gold font-semibold">
              That&apos;s extortion dressed up as a business model.
            </span>
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 4 */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            WHAT &ldquo;AD-FREE&rdquo; REALLY MEANS
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            I&apos;m not talking about banning ads from the internet.
            I&apos;m not a purist. But in games — in{" "}
            <em>
              interactive entertainment that requires your full attention and
              participation
            </em>{" "}
            — ads are fundamentally incompatible with the experience.
          </p>
          <ul className="space-y-3 pt-1">
            {[
              "No forced video ads before, during, or after gameplay",
              "No banner ads cluttering the UI",
              "No pop-up ads interrupting your flow",
              "No ads masquerading as tutorials you're forced to watch",
              "No ads as 'rewards' where you trade your time for something you should get for just playing",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-rose-400 font-bold flex-shrink-0 mt-0.5">✗</span>
                <span className="font-body text-silver/75 text-base leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            It means respecting the player&apos;s time and attention as a
            finite resource that deserves protection.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* Section 5 — Manifesto */}
        <div className="space-y-5">
          <h2 className="font-heading text-3xl text-white tracking-wide">
            THE PATH FORWARD
          </h2>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            Here&apos;s my manifesto:{" "}
            <span className="text-gold font-semibold">
              games should go ad-free.
            </span>{" "}
            Not all of them. Not immediately. But consciously, deliberately, as
            a choice.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            If you&apos;re building a game, I&apos;m asking you to do
            something radical: value your player&apos;s experience more than
            the ad impressions they generate. Charge for it. Ask for
            donations. Sell cosmetics. Offer battle passes. Give power users
            premium features. Get creative. But don&apos;t treat your players
            like billboards.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            And if you&apos;re a player? Vote with your feet. Delete games that
            abuse your attention. Spend your money on developers who respect
            you. Make it clear: we&apos;re done with this.
          </p>
          <p className="font-body text-silver/75 text-base leading-relaxed">
            We can have better games. Games that don&apos;t punish you for
            playing them.
          </p>
          <p className="font-heading text-2xl text-gold tracking-wide">
            Games with no ads. Ever. It&apos;s time.
          </p>
          <p className="font-body text-silver/40 text-sm italic pt-2">
            — 1775 Dev Team
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

        {/* CTA */}
        <div className="border border-gold/30 bg-charcoal p-8 lg:p-10 text-center space-y-4">
          <p className="font-heading text-3xl lg:text-4xl text-white tracking-wide">
            READY TO PLAY IT DIFFERENT?
          </p>
          <p className="font-body text-silver/60 text-sm">
            Omniverse: Ascension — no ads. Ever.
          </p>
          <Link
            href="/beta"
            className="inline-block mt-2 px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
          >
            Join Beta
          </Link>
        </div>

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
