"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Types ─── */
interface BetaFormData {
  firstName: string;
  lastName: string;
  email: string;
  ageRange: string;
  platform: string;
  hoursPerWeek: string;
  genres: string[];
  betaTested: string;
  deviceModel: string;
  whyTest: string;
  heardFrom: string;
  agreeNDA: boolean;
}

const INITIAL_DATA: BetaFormData = {
  firstName: "",
  lastName: "",
  email: "",
  ageRange: "",
  platform: "",
  hoursPerWeek: "",
  genres: [],
  betaTested: "",
  deviceModel: "",
  whyTest: "",
  heardFrom: "",
  agreeNDA: false,
};

const GENRES = ["RPG", "Strategy", "Action", "Sports", "Puzzle", "Other"];
const PLATFORMS = ["iOS", "Android", "Both"];

/* ─── Reusable field styles ─── */
const inputBase =
  "w-full px-4 py-3 font-body text-sm text-white bg-marine-black border focus:outline-none transition-colors duration-200 placeholder-silver/30";
const inputNormal = `${inputBase} border-white/15 focus:border-gold`;
const inputError = `${inputBase} border-scarlet focus:border-scarlet`;
const label =
  "block font-body text-xs text-silver/55 uppercase tracking-widest mb-2";
const errorMsg = "font-body text-xs text-scarlet mt-1.5";

/* ─── SVG benefit icons ─── */
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

/* ─── Progress bar ─── */
function ProgressBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Basic Info" },
    { n: 2, label: "Gaming Profile" },
    { n: 3, label: "Your Application" },
  ];
  return (
    <div className="flex items-center mb-10">
      {steps.map(({ n, label: lbl }, i) => (
        <div key={n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-sm border-2 transition-all duration-300 ${
                n < step
                  ? "bg-scarlet border-scarlet text-white"
                  : n === step
                  ? "bg-scarlet border-scarlet text-white"
                  : "bg-transparent border-white/20 text-silver/40"
              }`}
            >
              {n < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                n
              )}
            </div>
            <span
              className={`font-body text-[10px] uppercase tracking-wider mt-2 ${
                n <= step ? "text-silver/60" : "text-silver/25"
              }`}
            >
              {lbl}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-[2px] mx-2 mb-5 transition-all duration-300 ${
                n < step ? "bg-scarlet" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Custom checkbox ─── */
function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
        checked ? "bg-scarlet border-scarlet" : "border-white/20 hover:border-gold/40"
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 4" />
        </svg>
      )}
    </button>
  );
}

/* ─── Main page ─── */
export default function BetaPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BetaFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof BetaFormData, string>>>({});

  const set = <K extends keyof BetaFormData>(key: K, val: BetaFormData[K]) => {
    setFormData((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const toggleGenre = (g: string) => {
    const next = formData.genres.includes(g)
      ? formData.genres.filter((x) => x !== g)
      : [...formData.genres, g];
    set("genres", next);
  };

  const validate1 = () => {
    const e: typeof errors = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Please enter a valid email address";
    if (!formData.ageRange) e.ageRange = "Please select your age range";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e: typeof errors = {};
    if (!formData.platform) e.platform = "Please select your platform";
    if (!formData.hoursPerWeek) e.hoursPerWeek = "Please select hours per week";
    if (formData.genres.length === 0) e.genres = "Select at least one genre";
    if (!formData.betaTested) e.betaTested = "Please answer this question";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate3 = () => {
    const e: typeof errors = {};
    if (!formData.deviceModel.trim()) e.deviceModel = "Device model is required";
    if (!formData.whyTest.trim()) e.whyTest = "Please tell us why you want to beta test";
    else if (formData.whyTest.trim().length < 50)
      e.whyTest = `At least 50 characters required (${formData.whyTest.trim().length}/50 so far)`;
    if (!formData.heardFrom) e.heardFrom = "Please let us know how you heard about us";
    if (!formData.agreeNDA) e.agreeNDA = "You must agree to the NDA to submit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validate1()) setStep(2);
    else if (step === 2 && validate2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep((p) => p - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate3()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // silently fail — Phase 4 adds proper error handling
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text =
      "Just applied to beta test Omniverse: Ascension by @1775Gaming! 🎮 AI-powered mobile RPG with AR battles and health integration. #1775Gaming";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "1775 Gaming Beta", text }).catch(() => {});
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  };

  /* ── Step 1 ── */
  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="Enter first name"
            className={errors.firstName ? inputError : inputNormal}
          />
          {errors.firstName && <p className={errorMsg}>{errors.firstName}</p>}
        </div>
        <div>
          <label className={label}>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Enter last name"
            className={errors.lastName ? inputError : inputNormal}
          />
          {errors.lastName && <p className={errorMsg}>{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className={label}>Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="your@email.com"
          className={errors.email ? inputError : inputNormal}
          autoComplete="email"
        />
        {errors.email && <p className={errorMsg}>{errors.email}</p>}
      </div>

      <div>
        <label className={label}>Age Range *</label>
        <select
          value={formData.ageRange}
          onChange={(e) => set("ageRange", e.target.value)}
          className={errors.ageRange ? inputError : inputNormal}
        >
          <option value="">Select age range</option>
          <option value="under-18">Under 18</option>
          <option value="18-24">18–24</option>
          <option value="25-34">25–34</option>
          <option value="35-44">35–44</option>
          <option value="45+">45+</option>
        </select>
        {errors.ageRange && <p className={errorMsg}>{errors.ageRange}</p>}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full mt-2 py-4 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
      >
        Next: Gaming Profile &rarr;
      </button>
    </div>
  );

  /* ── Step 2 ── */
  const renderStep2 = () => (
    <div className="space-y-7">
      {/* Platform */}
      <div>
        <label className={label}>Primary Platform *</label>
        <div className="flex gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("platform", p)}
              className={`flex-1 py-3 font-body text-sm uppercase tracking-wider border transition-all duration-200 ${
                formData.platform === p
                  ? "bg-scarlet border-scarlet text-white"
                  : "bg-transparent border-white/15 text-silver hover:border-gold/40"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {errors.platform && <p className={errorMsg}>{errors.platform}</p>}
      </div>

      {/* Hours */}
      <div>
        <label className={label}>Hours Gaming Per Week *</label>
        <select
          value={formData.hoursPerWeek}
          onChange={(e) => set("hoursPerWeek", e.target.value)}
          className={errors.hoursPerWeek ? inputError : inputNormal}
        >
          <option value="">Select hours per week</option>
          <option value="less-5">Less than 5 hours</option>
          <option value="5-10">5–10 hours</option>
          <option value="10-20">10–20 hours</option>
          <option value="20+">20+ hours</option>
        </select>
        {errors.hoursPerWeek && <p className={errorMsg}>{errors.hoursPerWeek}</p>}
      </div>

      {/* Genres */}
      <div>
        <label className={label}>Gaming Genres (select all that apply) *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
          {GENRES.map((g) => (
            <label key={g} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={formData.genres.includes(g)}
                onChange={() => toggleGenre(g)}
              />
              <span className="font-body text-sm text-silver group-hover:text-white transition-colors">
                {g}
              </span>
            </label>
          ))}
        </div>
        {errors.genres && <p className={errorMsg}>{errors.genres}</p>}
      </div>

      {/* Beta tested before */}
      <div>
        <label className={label}>Have you done beta testing before? *</label>
        <div className="flex gap-3">
          {["Yes", "No"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("betaTested", v.toLowerCase())}
              className={`flex-1 py-3 font-body text-sm uppercase tracking-wider border transition-all duration-200 ${
                formData.betaTested === v.toLowerCase()
                  ? "bg-scarlet border-scarlet text-white"
                  : "bg-transparent border-white/15 text-silver hover:border-gold/40"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {errors.betaTested && <p className={errorMsg}>{errors.betaTested}</p>}
      </div>

      <div className="flex gap-4 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-4 font-body font-semibold text-sm uppercase tracking-widest text-silver border border-white/15 hover:border-white/30 transition-colors duration-300"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-[2] py-4 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 transition-colors duration-300"
        >
          Next: Final Step &rarr;
        </button>
      </div>
    </div>
  );

  /* ── Step 3 ── */
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className={label}>Device Model *</label>
        <input
          type="text"
          value={formData.deviceModel}
          onChange={(e) => set("deviceModel", e.target.value)}
          placeholder="e.g. iPhone 15 Pro, Samsung Galaxy S24"
          className={errors.deviceModel ? inputError : inputNormal}
        />
        {errors.deviceModel && <p className={errorMsg}>{errors.deviceModel}</p>}
      </div>

      <div>
        <label className={label}>
          Why do you want to beta test Omniverse: Ascension? *
        </label>
        <textarea
          value={formData.whyTest}
          onChange={(e) => set("whyTest", e.target.value)}
          placeholder="Tell us what excites you about the game, your gaming background, or what you hope to contribute as a tester... (minimum 50 characters)"
          rows={5}
          className={`${errors.whyTest ? inputError : inputNormal} resize-none`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.whyTest ? (
            <p className={errorMsg}>{errors.whyTest}</p>
          ) : (
            <span />
          )}
          <span
            className={`font-body text-xs ${
              formData.whyTest.trim().length >= 50
                ? "text-gold"
                : "text-silver/35"
            }`}
          >
            {formData.whyTest.trim().length}/50
          </span>
        </div>
      </div>

      <div>
        <label className={label}>How did you hear about us? *</label>
        <select
          value={formData.heardFrom}
          onChange={(e) => set("heardFrom", e.target.value)}
          className={errors.heardFrom ? inputError : inputNormal}
        >
          <option value="">Select an option</option>
          <option value="social">Social Media</option>
          <option value="reddit">Reddit</option>
          <option value="friend">Friend / Word of Mouth</option>
          <option value="search">Search Engine</option>
          <option value="other">Other</option>
        </select>
        {errors.heardFrom && <p className={errorMsg}>{errors.heardFrom}</p>}
      </div>

      {/* NDA checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={formData.agreeNDA}
            onChange={() => set("agreeNDA", !formData.agreeNDA)}
          />
          <span className="font-body text-sm text-silver/70 group-hover:text-silver transition-colors leading-relaxed mt-0.5">
            I agree to keep beta content confidential *
          </span>
        </label>
        {errors.agreeNDA && <p className={`${errorMsg} ml-8`}>{errors.agreeNDA}</p>}
      </div>

      <div className="flex gap-4 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-4 font-body font-semibold text-sm uppercase tracking-widest text-silver border border-white/15 hover:border-white/30 transition-colors duration-300"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] py-4 font-body font-semibold text-sm uppercase tracking-widest text-white bg-scarlet hover:bg-scarlet/80 disabled:opacity-60 transition-colors duration-300 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );

  /* ── Success screen ── */
  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-8">
        <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-4">
        APPLICATION RECEIVED
      </h2>
      <p className="font-body text-silver/70 text-base lg:text-lg leading-relaxed max-w-lg mx-auto mb-10">
        Welcome to the 1775 Gaming pioneer program,{" "}
        <span className="text-white font-semibold">{formData.firstName}</span>. We
        will review your application and contact you at{" "}
        <span className="text-gold">{formData.email}</span> within 7 days.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleShare}
          className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-marine-black bg-gold border border-gold hover:bg-gold/80 transition-colors duration-300"
        >
          Share With a Friend
        </button>
        <Link
          href="/"
          className="px-8 py-3 font-body font-semibold text-sm uppercase tracking-widest text-white border border-white/20 hover:border-white/40 transition-colors duration-300 text-center"
        >
          Return Home
        </Link>
      </div>
    </div>
  );

  const BENEFITS = [
    { Icon: RocketIcon, title: "Early Access", body: "Play before public launch" },
    { Icon: PencilIcon, title: "Shape the Game", body: "Your feedback drives development" },
    { Icon: BadgeIcon, title: "Founder Status", body: "Permanent in-game founder badge" },
    { Icon: ChatIcon, title: "Direct Access", body: "Talk directly to the developer" },
  ];

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

      {/* ─── FORM SECTION ─── */}
      <section className="py-24 px-4 bg-charcoal">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            renderSuccess()
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-3">
                  Pioneer Application
                </p>
                <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide">
                  APPLY FOR BETA ACCESS
                </h2>
              </div>

              <div className="bg-marine-black border border-white/5 p-8 lg:p-10">
                <ProgressBar step={step} />
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="py-20 px-4 bg-marine-black border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs text-silver/40 uppercase tracking-widest mb-10">
            Join Players From Around the World
          </p>

          {/* Pioneer avatars */}
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
