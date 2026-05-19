import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-marine-black">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-marine-black to-marine-black pointer-events-none" />

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#C0C0C0 1px, transparent 1px), linear-gradient(90deg, #C0C0C0 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <h1 className="font-heading text-7xl sm:text-9xl lg:text-[11rem] text-white tracking-wider leading-none mb-6">
          1775 GAMING
        </h1>

        <p className="font-body text-silver text-base sm:text-xl lg:text-2xl tracking-widest uppercase mb-12">
          AI-Powered Mobile Gaming Is Coming
        </p>

        <Link
          href="/beta"
          className="inline-flex items-center px-10 py-4 font-body font-semibold text-lg uppercase tracking-widest text-white bg-scarlet border border-gold hover:bg-scarlet/80 transition-colors duration-200"
        >
          Join Beta
        </Link>
      </div>
    </section>
  );
}
