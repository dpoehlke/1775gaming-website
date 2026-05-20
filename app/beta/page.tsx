import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import BetaForm from "./BetaForm";

export const metadata: Metadata = {
  title: "Join the Beta",
  description:
    "Become a founding beta tester for Omniverse: Ascension. Get early access, shape the game, and earn permanent Founder status. Limited spots available — apply now.",
};

/* ─── Benefit icons (server-safe SVGs, no hooks) ─── */
function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const BENEFITS = [
  { Icon: RocketIcon, title: "Early Access", body: "Play before public launch" },
  { Icon: PencilIcon, title: "Shape the Game", body: "Your feedback drives development" },
  { Icon: BadgeIcon, title: "Founder Status", body: "Permanent in-game founder badge" },
  { Icon: ChatIcon, title: "Direct Access", body: "Talk directly to the developer" },
];

/* ─── Server-side pioneer count ─── */
async function getPioneerCount(): Promise<number> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { count, error } = await supabase
      .from("beta_signups")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function BetaPage() {
  const pioneerCount = await getPioneerCount();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center py-28 px-4 bg-marine-black overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(204,0,0,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase">
            Limited Spots Available
          </p>
          <h1 className="font-heading text-7xl sm:text-9xl lg:text-[9rem] text-white tracking-wide leading-none">
            BECOME A PIONEER
          </h1>
          <p className="font-body text-silver/75 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
            Join the founding beta team for Omniverse: Ascension and help shape
            the future of AI-powered mobile gaming
          </p>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="font-body text-[10px] text-silver/35 uppercase tracking-[0.35em]">Apply below</span>
          <svg className="h-5 w-5 text-silver/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ─── BENEFITS BAR ─── */}
      <section className="py-12 px-4 bg-charcoal border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {BENEFITS.map(({ Icon, title, body }) => (
            <div key={title} className="text-center">
              <div className="text-gold flex justify-center mb-3">
                <Icon />
              </div>
              <p className="font-heading text-lg text-white tracking-wide mb-1">{title}</p>
              <p className="font-body text-silver/50 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PIONEER COUNTER ─── */}
      <section className="py-12 px-4 bg-marine-black border-b border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-heading text-7xl lg:text-8xl text-scarlet tracking-wide leading-none mb-1">
            {pioneerCount}
          </p>
          <p className="font-heading text-2xl lg:text-3xl text-gold tracking-[0.15em] uppercase mb-2">
            Pioneers Have Enlisted
          </p>
          <p className="font-body text-silver/45 text-sm uppercase tracking-widest">
            Join Them
          </p>
        </div>
      </section>

      {/* ─── FORM (client component) ─── */}
      <BetaForm />

      {/* ─── SOCIAL PROOF ─── */}
      <section className="py-20 px-4 bg-marine-black border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs text-silver/40 uppercase tracking-widest mb-10">
            Join Players From Around the World
          </p>

          <div className="flex justify-center -space-x-3 mb-10">
            {["001", "002", "003", "004", "005"].map((n) => (
              <div
                key={n}
                className="w-12 h-12 rounded-full bg-charcoal border-2 border-marine-black flex items-center justify-center"
              >
                <span className="font-heading text-[9px] text-gold/70 leading-tight text-center">
                  #{n}
                </span>
              </div>
            ))}
            <div className="w-12 h-12 rounded-full bg-charcoal border-2 border-marine-black flex items-center justify-center">
              <span className="font-body text-sm text-silver/40">+</span>
            </div>
          </div>

          <blockquote className="font-body text-silver/60 text-lg italic mb-4 max-w-md mx-auto">
            &ldquo;This is exactly what mobile gaming has been missing.&rdquo;
          </blockquote>
          <p className="font-body text-xs text-silver/35 uppercase tracking-widest">
            — Beta Tester, Chicago IL
          </p>
        </div>
      </section>
    </>
  );
}
