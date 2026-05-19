import Link from "next/link";

const POSTS = [
  {
    title: "How AI is Revolutionizing Mobile Gaming",
    excerpt:
      "Artificial intelligence is no longer just an NPC script — it's becoming the game master itself.",
    date: "May 15, 2025",
    gradientFrom: "from-scarlet/25",
    gradientTo: "to-charcoal",
    slug: "/blog",
  },
  {
    title: "What is AR Gaming and Why It Matters",
    excerpt:
      "Augmented reality is blurring the line between the digital battlefield and your living room.",
    date: "May 8, 2025",
    gradientFrom: "from-gold/25",
    gradientTo: "to-charcoal",
    slug: "/blog",
  },
  {
    title: "The Science of Health Gamification",
    excerpt:
      "How real-world fitness data can power in-game characters — and why it changes everything.",
    date: "May 1, 2025",
    gradientFrom: "from-silver/20",
    gradientTo: "to-charcoal",
    slug: "/blog",
  },
] as const;

export default function BlogPreviewSection() {
  return (
    <section className="py-28 px-4 bg-marine-black">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="mb-14">
          <h2 className="font-heading text-5xl lg:text-6xl text-gold tracking-wide mb-3">
            INTEL BRIEFING
          </h2>
          <p className="font-body text-silver/55 text-base">
            Latest from the 1775 Gaming command center
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="group bg-charcoal border border-white/5 hover:border-gold/40 hover:scale-[1.025] transition-all duration-300"
            >
              {/* Placeholder image area with gradient */}
              <div
                className={`relative h-48 bg-gradient-to-br ${post.gradientFrom} ${post.gradientTo} overflow-hidden`}
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-6xl text-white/10 tracking-widest select-none">
                    1775
                  </span>
                </div>
                {/* Shine overlay on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
              </div>

              {/* Card body */}
              <div className="p-6">
                <p className="font-body text-[10px] text-silver/40 uppercase tracking-widest mb-3">
                  {post.date}
                </p>
                <h3 className="font-heading text-xl text-white tracking-wide mb-3 leading-tight">
                  {post.title}
                </h3>
                <p className="font-body text-silver/55 text-sm leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <Link
                  href={post.slug}
                  className="font-body text-xs font-semibold uppercase tracking-widest text-scarlet group-hover:text-scarlet/70 transition-colors duration-200"
                >
                  Read More &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-14">
          <Link
            href="/blog"
            className="font-body text-sm uppercase tracking-widest text-silver/50 hover:text-white border border-white/10 hover:border-white/30 px-10 py-3 transition-all duration-300"
          >
            View All Intel &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
