"use client";

import { useState, FormEvent } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "info" } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ text: "Please enter your email address.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage" }),
      });

      const data = await res.json();

      if (data.duplicate) {
        setSubmitted(true);
        setMessage({ text: "You are already on the list, Pioneer.", type: "info" });
        return;
      }

      if (!res.ok) {
        setMessage({ text: "Something went wrong. Try again.", type: "error" });
        return;
      }

      setSubmitted(true);
    } catch {
      setMessage({ text: "Something went wrong. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #CC0000 0%, #880000 35%, #1A1A1A 65%, #0D0D0D 100%)",
      }}
    >
      {/* Military grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 1px, transparent 60px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 1px, transparent 60px)",
        }}
      />

      {/* Depth fade at top/bottom */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-marine-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-marine-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="font-body text-xs text-white/60 tracking-[0.45em] uppercase mb-5">
          Early Access
        </p>
        <h2 className="font-heading text-6xl lg:text-8xl text-white tracking-wide mb-5">
          GET EARLY ACCESS
        </h2>
        <p className="font-body text-white/70 text-base lg:text-lg mb-12 leading-relaxed">
          Join thousands of gamers on the waitlist for Omniverse: Ascension
        </p>

        {submitted ? (
          /* ── Success state ── */
          <div className="bg-black/30 border border-white/20 p-10 backdrop-blur-sm">
            <div className="font-heading text-5xl text-gold mb-4">✓</div>
            <p className="font-heading text-3xl text-gold tracking-wide mb-3">
              YOU ARE ENLISTED, SOLDIER.
            </p>
            <p className="font-body text-white/70 text-sm leading-relaxed">
              Welcome to the 1775 Gaming inner circle. We&rsquo;ll be in touch
              with early access details when the mission goes live.
            </p>
            {message?.type === "info" && (
              <p className="font-body text-gold/70 text-xs mt-4">
                {message.text}
              </p>
            )}
          </div>
        ) : (
          /* ── Form ── */
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto"
              noValidate
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                className="flex-1 px-5 py-4 font-body text-sm text-white bg-black/40 border border-white/20 focus:border-gold focus:outline-none placeholder-white/35 backdrop-blur-sm min-w-0"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 font-body font-semibold text-sm uppercase tracking-widest text-marine-black bg-gold border border-gold hover:bg-gold/80 disabled:opacity-60 transition-colors duration-300 whitespace-nowrap"
              >
                {loading ? "Enlisting…" : "Enlist Now"}
              </button>
            </form>

            {message && (
              <p
                className={`font-body text-xs mt-3 ${
                  message.type === "error" ? "text-scarlet" : "text-white/70"
                }`}
              >
                {message.text}
              </p>
            )}

            <p className="font-body text-white/40 text-xs mt-5">
              🔒 No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
