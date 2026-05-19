import Link from "next/link";

export default function BetaBanner() {
  return (
    <section className="relative py-20 px-4 bg-[#080808] overflow-hidden">

      {/* Scarlet accent line across the top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #CC0000 20%, #CC0000 80%, transparent 100%)",
        }}
      />

      {/* Military crosshair / grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.045,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(204,0,0,1) 0, rgba(204,0,0,1) 1px, transparent 1px, transparent 80px)," +
            "repeating-linear-gradient(90deg, rgba(204,0,0,1) 0, rgba(204,0,0,1) 1px, transparent 1px, transparent 80px)",
        }}
      />

      {/* Corner crosshair accents */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-scarlet/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-scarlet/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-scarlet/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-scarlet/30" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* ── Left: copy ── */}
          <div className="text-center lg:text-left">
            <p className="font-body text-xs text-scarlet tracking-[0.45em] uppercase mb-4">
              Founding Beta Testers
            </p>
            <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-4">
              BECOME A PIONEER
            </h2>
            <p className="font-body text-silver/55 text-base max-w-lg leading-relaxed">
              Shape the future of Omniverse: Ascension as a founding beta tester.
              Your feedback writes the future of AI-powered mobile gaming.
            </p>
          </div>

          {/* ── Right: CTA button ── */}
          <div className="flex-shrink-0">
            <Link
              href="/beta"
              className="group inline-flex items-center gap-3 px-12 py-5 font-body font-semibold text-base uppercase tracking-widest text-white bg-scarlet border-2 border-gold hover:bg-scarlet/80 hover:border-gold/70 transition-all duration-300"
            >
              Apply Now
              <svg
                className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
