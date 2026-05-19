"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  "ALL",
  "GAME DEV",
  "AR / AI TECH",
  "HEALTH GAMING",
  "COMPANY NEWS",
  "BETA UPDATES",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Post {
  slug: string;
  category: Exclude<Category, "ALL">;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  gradient: string;
  accentColor: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    slug: "building-ai-game-master",
    category: "GAME DEV",
    date: "May 14, 2026",
    readTime: "8 min read",
    title: "Building the AI Game Master: How We're Making Every Session Unique",
    excerpt:
      "Deep dive into the architecture behind Omniverse's adaptive narrative engine — an AI system that crafts personalized missions, remembers your choices, and reacts to your playstyle in real time.",
    gradient: "from-scarlet/30 via-scarlet/10 to-transparent",
    accentColor: "text-scarlet",
    featured: true,
  },
  {
    slug: "ar-combat-system",
    category: "AR / AI TECH",
    date: "May 7, 2026",
    readTime: "6 min read",
    title: "AR Combat in the Real World: Our Technical Approach",
    excerpt:
      "How we're using ARKit and ARCore to place supervillain battles in your living room — and the engineering challenges we had to solve to make it feel real.",
    gradient: "from-blue-700/25 via-blue-700/8 to-transparent",
    accentColor: "text-blue-400",
  },
  {
    slug: "health-data-powers-heroes",
    category: "HEALTH GAMING",
    date: "April 29, 2026",
    readTime: "5 min read",
    title: "Your Steps Are XP: How Real-World Health Powers Your Hero",
    excerpt:
      "Walk more, fight harder. The health integration system that turns your daily activity into in-game progression — without turning fitness into a chore.",
    gradient: "from-emerald-700/25 via-emerald-700/8 to-transparent",
    accentColor: "text-emerald-400",
  },
  {
    slug: "1775-gaming-founded",
    category: "COMPANY NEWS",
    date: "April 18, 2026",
    readTime: "3 min read",
    title: "1775 Gaming LLC Is Official: What Comes Next",
    excerpt:
      "From a vision scrawled on a legal pad to a registered company with a roadmap. Here's where we've been, where we're going, and why 2026 is just the beginning.",
    gradient: "from-gold/25 via-gold/8 to-transparent",
    accentColor: "text-gold",
  },
  {
    slug: "beta-program-launch",
    category: "BETA UPDATES",
    date: "April 10, 2026",
    readTime: "4 min read",
    title: "Beta Applications Are Open — Here's What to Expect",
    excerpt:
      "The closed beta for Omniverse: Ascension is accepting its first wave of testers. Learn what's being tested, what perks beta testers receive, and how to apply.",
    gradient: "from-purple-700/25 via-purple-700/8 to-transparent",
    accentColor: "text-purple-400",
  },
  {
    slug: "mutants-masterminds-framework",
    category: "GAME DEV",
    date: "March 31, 2026",
    readTime: "7 min read",
    title: "Why We Built on Mutants & Masterminds 3e",
    excerpt:
      "Green Ronin's legendary tabletop framework gives Omniverse its mechanical backbone. We explain the licensing deal, what M&M 3e brings to mobile, and how we're adapting it for touchscreen play.",
    gradient: "from-rose-700/25 via-rose-700/8 to-transparent",
    accentColor: "text-rose-400",
  },
];

// Newsletter component (inline, between grid rows)
function InlineNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="col-span-full my-2">
      <div
        className="relative overflow-hidden border border-gold/20 p-8 sm:p-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(184,134,11,0.12) 0%, rgba(13,13,13,0.95) 60%)",
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-gold tracking-[0.4em] uppercase mb-2">
              Intel Drop
            </p>
            <h3 className="font-heading text-3xl lg:text-4xl text-white tracking-wide leading-tight">
              GET MISSION BRIEFINGS IN YOUR INBOX
            </h3>
            <p className="font-body text-silver/55 text-sm mt-2">
              Dev updates, beta announcements, and behind-the-scenes content —
              delivered direct.
            </p>
          </div>

          <div className="w-full sm:w-auto flex-shrink-0">
            {submitted ? (
              <div className="text-center px-8 py-3 border border-gold/40 bg-gold/10">
                <span className="font-body text-gold text-sm font-semibold uppercase tracking-widest">
                  You&apos;re Enlisted ✓
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 min-w-0 sm:w-56 px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-silver/30 font-body text-sm focus:outline-none focus:border-gold/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gold font-body font-semibold text-xs uppercase tracking-widest text-marine-black hover:bg-gold/80 transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {loading ? "Enlisting…" : "Enlist Now"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small blog card
function BlogCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col bg-charcoal border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Gradient header strip */}
      <div
        className={`h-28 bg-gradient-to-br ${post.gradient} flex-shrink-0`}
      />
      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex items-center justify-between">
          <span
            className={`font-body text-[10px] uppercase tracking-widest font-semibold ${post.accentColor}`}
          >
            {post.category}
          </span>
          <span className="font-body text-[10px] text-silver/35 uppercase tracking-wider">
            {post.readTime}
          </span>
        </div>
        <h3 className="font-heading text-xl text-white tracking-wide leading-snug group-hover:text-scarlet transition-colors duration-200">
          {post.title}
        </h3>
        <p className="font-body text-silver/55 text-sm leading-relaxed flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
          <span className="font-body text-xs text-silver/35">{post.date}</span>
          <span className="font-body text-xs font-semibold text-scarlet uppercase tracking-wider">
            Read More →
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");

  const featured = POSTS.find((p) => p.featured)!;
  const regularPosts = POSTS.filter((p) => !p.featured);

  const filteredRegular =
    activeCategory === "ALL"
      ? regularPosts
      : regularPosts.filter((p) => p.category === activeCategory);

  const showFeatured =
    activeCategory === "ALL" || activeCategory === featured.category;

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex items-center justify-center min-h-[44vh] py-24 px-4 bg-marine-black overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(184,134,11,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            Intel &amp; Updates
          </p>
          <h1 className="font-heading text-8xl lg:text-[9rem] text-white tracking-wide leading-none mb-6">
            THE BRIEFING
          </h1>
          <p className="font-body text-silver/65 text-lg leading-relaxed">
            Dev diaries, tech deep-dives, and mission updates from inside 1775
            Gaming HQ
          </p>
        </div>
      </section>

      {/* ─── FEATURED POST ─── */}
      {showFeatured && (
        <section className="py-16 px-4 bg-marine-black border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-8">
              Featured Article
            </p>
            <article className="group grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/8 hover:border-scarlet/30 transition-all duration-300 overflow-hidden">
              {/* Left: gradient visual */}
              <div
                className={`relative min-h-[280px] lg:min-h-0 bg-gradient-to-br ${featured.gradient} flex items-end p-8`}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 80% at 30% 50%, rgba(204,0,0,0.20) 0%, transparent 60%)",
                  }}
                />
                <div className="relative z-10">
                  <span className="inline-block bg-scarlet px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-white mb-4">
                    {featured.category}
                  </span>
                  <p className="font-body text-white/50 text-sm">
                    {featured.date}
                  </p>
                </div>
              </div>

              {/* Right: content */}
              <div className="bg-charcoal p-8 lg:p-12 flex flex-col justify-center gap-5">
                <h2 className="font-heading text-3xl lg:text-4xl text-white tracking-wide leading-tight group-hover:text-scarlet transition-colors duration-200">
                  {featured.title}
                </h2>
                <p className="font-body text-silver/65 text-sm lg:text-base leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-6 pt-2 border-t border-white/8">
                  <span className="font-body text-xs text-silver/35">
                    {featured.readTime}
                  </span>
                  <span className="font-body text-sm font-semibold text-scarlet uppercase tracking-wider">
                    Read Article →
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ─── CATEGORY FILTER ─── */}
      <section className="py-8 px-4 bg-charcoal border-y border-white/8 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="font-body text-xs text-silver/35 uppercase tracking-widest whitespace-nowrap mr-2 flex-shrink-0">
            Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 font-body text-xs font-semibold uppercase tracking-widest border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-scarlet border-scarlet text-white"
                  : "bg-transparent border-white/15 text-silver/55 hover:border-white/35 hover:text-silver"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ─── BLOG GRID ─── */}
      <section className="py-16 px-4 bg-marine-black">
        <div className="max-w-7xl mx-auto">
          {filteredRegular.length === 0 && !showFeatured ? (
            <div className="text-center py-24">
              <p className="font-heading text-3xl text-white/25 tracking-wide mb-3">
                NO POSTS YET
              </p>
              <p className="font-body text-silver/35 text-sm">
                More intel drops coming soon for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First row: posts 0, 1, 2 */}
              {filteredRegular.slice(0, 3).map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}

              {/* Inline newsletter — between row 1 and row 2 */}
              {filteredRegular.length > 3 && <InlineNewsletter />}

              {/* Second row: posts 3+ */}
              {filteredRegular.slice(3).map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-20 px-4 bg-charcoal border-t border-white/8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            Don&apos;t Miss a Drop
          </p>
          <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-4">
            STAY IN THE FIGHT
          </h2>
          <p className="font-body text-silver/55 text-base mb-10 leading-relaxed">
            Follow the mission. Join the beta. Be part of what we&apos;re
            building.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/beta"
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300 text-center"
            >
              Join the Beta →
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-gold border border-gold hover:bg-gold/10 transition-colors duration-300 text-center"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
