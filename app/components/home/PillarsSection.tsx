/* Inline SVG icons — no external icon library */
function CpuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-11 h-11"
      aria-hidden="true"
    >
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M9 7V4M12 7V3M15 7V4" />
      <path d="M9 17v3M12 17v4M15 17v3" />
      <path d="M7 9H4M7 12H3M7 15H4" />
      <path d="M17 9h3M17 12h4M17 15h3" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-11 h-11"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

function HeartPulseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-11 h-11"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <polyline points="8 12 10 12 11 9 13 15 15 12 17 12" />
    </svg>
  );
}

const PILLARS = [
  {
    Icon: CpuIcon,
    title: "AI-POWERED GAMEPLAY",
    body: "An intelligent AI Game Master that adapts to your playstyle, creates dynamic story missions, and challenges you in ways no static game can.",
  },
  {
    Icon: LayersIcon,
    title: "AUGMENTED REALITY",
    body: "See your battles come to life in the real world. 1775 Gaming integrates AR technology directly into gameplay — your environment becomes your battlefield.",
  },
  {
    Icon: HeartPulseIcon,
    title: "HEALTH INTEGRATION",
    body: "Your real-world fitness powers your in-game hero. Steps, workouts, and health data translate directly into game progression and character strength.",
  },
];

export default function PillarsSection() {
  return (
    <section className="py-28 px-4 bg-charcoal">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
            Our Technology
          </p>
          <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide">
            BUILT FOR THE NEXT GENERATION
          </h2>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PILLARS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="group relative p-8 bg-marine-black border border-white/5 hover:-translate-y-2 transition-all duration-300 cursor-default"
            >
              {/* Scarlet top border — slides in on hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-scarlet scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              {/* Subtle inner glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(204,0,0,0.05) 0%, transparent 70%)" }}
              />

              <div className="relative z-10">
                <div className="text-gold mb-6">
                  <Icon />
                </div>
                <h3 className="font-heading text-2xl text-white tracking-wide mb-4">
                  {title}
                </h3>
                <p className="font-body text-silver/60 text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
