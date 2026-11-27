"use client";

/**
 * 1775 Gaming account password reset.
 *
 * Every "Forgot password?" button (website SDK, Hear & Translate, the Expo apps, Flight Tracker)
 * sends people here. Reset emails are requested with the *implicit* flow so the link works on any
 * device or browser, not only the one that asked for it. This page accepts every link shape the
 * platform can send:
 *   #access_token=…&refresh_token=…&type=recovery   (implicit flow, the default we request)
 *   ?token_hash=…&type=recovery                     (custom email template using {{ .TokenHash }})
 *   ?code=…                                         (PKCE; only works in the browser that asked)
 *   ?error_code=…&error_description=…               (expired or already-used link)
 */
import { useEffect, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PLATFORM_URL = "https://ksizqvecclwvevfzdjnb.supabase.co";
const PLATFORM_KEY = "sb_publishable_ZIBA2VcS1-RgkLMAgvDppA_So4_UJ9l";
const SELF = "https://www.1775gaming.com/account/reset-password";

// Where "Back to …" may send people afterwards. Anything else falls back to the homepage.
const RETURN_HOSTS = [
  "1775gaming.com",
  "www.1775gaming.com",
  "gravity-flip-sepia.vercel.app",
  "gravity-breakout.vercel.app",
  "drop-merge-neon.vercel.app",
  "portal-snake-kappa.vercel.app",
  "memory-grid-snowy.vercel.app",
  "afterhours-leadkit.vercel.app",
  "flight-tracker-one-xi.vercel.app",
];

export function safeReturn(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    if (!RETURN_HOSTS.includes(u.hostname.toLowerCase())) return null;
    // Never bounce back into the reset page itself or carry tokens along.
    u.hash = "";
    if (u.pathname.startsWith("/account/reset-password")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function returnLabel(url: string | null): string {
  if (!url) return "Back to 1775 Gaming";
  const h = new URL(url).hostname;
  if (h.endsWith("1775gaming.com")) return "Back to 1775 Gaming";
  const name = h.split(".")[0].replace(/-(sepia|neon|kappa|snowy|one-xi)$/, "").replace(/-/g, " ");
  return `Back to ${name.replace(/\b\w/g, (c) => c.toUpperCase())}`;
}

function makeClient(): SupabaseClient {
  return createClient(PLATFORM_URL, PLATFORM_KEY, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

const friendly = (m: string) => {
  const s = m.toLowerCase();
  if (s.startsWith("pkce:") || s.includes("code verifier")) {
    return "This reset link has to be opened in the same browser that asked for it. Request a new one below; the new link works on any device.";
  }
  if (s.includes("expired") || s.includes("invalid") || s.includes("otp")) {
    return "This reset link has expired or was already used. Links work once and expire after about an hour. Request a new one below.";
  }
  if (s.includes("same_password") || s.includes("different from the old") || (s.includes("same") && s.includes("password"))) return "Your new password must be different from your old one.";
  if (s.includes("weak") || s.includes("characters")) return m;
  if (s.includes("rate") || s.includes("too many") || s.includes("seconds")) {
    return "Too many requests. Wait a minute, then try again.";
  }
  return m;
};

type Stage = "loading" | "request" | "sent" | "set" | "done";

export default function ResetPasswordClient() {
  const clientRef = useRef<SupabaseClient | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [ret, setRet] = useState<string | null>(null);

  useEffect(() => {
    const client = makeClient();
    clientRef.current = client;
    const url = new URL(window.location.href);
    const q = url.searchParams;
    const h = new URLSearchParams(url.hash.replace(/^#/, ""));
    setRet(safeReturn(q.get("return")));
    const prefill = q.get("email");
    if (prefill) setEmail(prefill);

    // Strip tokens from the address bar right away (history, screenshots, shoulder-surfing).
    const clean = new URL(url.toString());
    clean.hash = "";
    ["code", "token_hash", "type", "error", "error_code", "error_description", "sb"].forEach((k) => clean.searchParams.delete(k));
    window.history.replaceState(null, "", clean.pathname + clean.search);

    const fail = (m: string) => { setError(friendly(m)); setStage("request"); };
    const ready = async () => {
      const { data } = await client.auth.getUser();
      setAccountEmail(data.user?.email ?? "");
      setStage("set");
    };

    (async () => {
      const errDesc = h.get("error_description") || q.get("error_description");
      if (errDesc) return fail(errDesc.replace(/\+/g, " "));

      const access = h.get("access_token");
      const refresh = h.get("refresh_token");
      if (access && refresh) {
        const { error: e } = await client.auth.setSession({ access_token: access, refresh_token: refresh });
        return e ? fail(e.message) : ready();
      }
      const tokenHash = q.get("token_hash");
      if (tokenHash) {
        const { error: e } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        return e ? fail(e.message) : ready();
      }
      const code = q.get("code");
      if (code) {
        // PKCE: needs the verifier saved by the browser that requested the email. A fresh page
        // never has it, so this almost always fails; the message explains what to do instead.
        const { error: e } = await client.auth.exchangeCodeForSession(code);
        return e ? fail("pkce: " + e.message) : ready();
      }
      setStage("request");
    })().catch((e) => fail(String(e?.message ?? e)));
  }, []);

  async function requestLink(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { setError("Enter the email address of your 1775 Gaming account."); return; }
    setBusy(true);
    const redirectTo = SELF + (ret ? `?return=${encodeURIComponent(ret)}` : "");
    const { error: e } = await makeClient().auth.resetPasswordForEmail(em, { redirectTo });
    setBusy(false);
    if (e) { setError(friendly(e.message)); return; }
    setNotice(em);
    setStage("sent");
  }

  async function savePassword(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (pw.length < 8) { setError("Use at least 8 characters."); return; }
    if (pw !== pw2) { setError("The two passwords don't match."); return; }
    const client = clientRef.current;
    if (!client) return;
    setBusy(true);
    const { error: e } = await client.auth.updateUser({ password: pw });
    if (e) { setBusy(false); setError(friendly(e.message)); return; }
    // Sign out everywhere so an old session (or whoever had the old password) can't stay in.
    await client.auth.signOut({ scope: "global" }).catch(() => undefined);
    setBusy(false);
    setPw(""); setPw2("");
    setStage("done");
  }

  const input = "w-full rounded-md border border-white/15 bg-charcoal px-4 py-3 text-base text-white placeholder-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
  const button = "w-full rounded-md bg-scarlet px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6 sm:p-8 shadow-xl" aria-live="polite">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">1775 Gaming account</p>

      {stage === "loading" && (
        <>
          <h1 className="mt-2 font-heading text-4xl tracking-wide">Checking your link…</h1>
          <p className="mt-3 text-white/70">One moment.</p>
        </>
      )}

      {stage === "request" && (
        <>
          <h1 className="mt-2 font-heading text-4xl tracking-wide">Reset your password</h1>
          <p className="mt-3 text-white/70">
            Enter the email you use for 1775 Gaming. We&apos;ll email you a link to choose a new password.
            One account works in every 1775 game and app.
          </p>
          {error && <p role="alert" className="mt-4 rounded-md border border-scarlet/50 bg-scarlet/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <form onSubmit={requestLink} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="mb-1 block text-sm text-white/80">Email</span>
              <input className={input} type="email" autoComplete="email" inputMode="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <button className={button} type="submit" disabled={busy}>{busy ? "Sending…" : "Email me a reset link"}</button>
          </form>
          <p className="mt-4 text-xs text-white/50">
            Signed up with Google or Apple and never set a password? Keep using that button; you don&apos;t need one.
          </p>
        </>
      )}

      {stage === "sent" && (
        <>
          <h1 className="mt-2 font-heading text-4xl tracking-wide">Check your email</h1>
          <p className="mt-3 text-white/70">
            If <span className="text-white">{notice}</span> has a 1775 Gaming account, a reset link is on its way.
            It works once and expires in about an hour. You can open it on any device.
          </p>
          <p className="mt-3 text-sm text-white/50">Nothing after a few minutes? Check spam, or wait a minute and send another.</p>
          <button className="mt-6 text-sm text-gold underline underline-offset-4" type="button" onClick={() => { setStage("request"); setError(""); }}>
            Use a different email
          </button>
        </>
      )}

      {stage === "set" && (
        <>
          <h1 className="mt-2 font-heading text-4xl tracking-wide">Choose a new password</h1>
          {accountEmail && <p className="mt-3 text-white/70">For <span className="text-white">{accountEmail}</span></p>}
          {error && <p role="alert" className="mt-4 rounded-md border border-scarlet/50 bg-scarlet/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <form onSubmit={savePassword} className="mt-6 space-y-4" noValidate>
            {/* Hidden username helps password managers save the new password to the right account. */}
            <input type="email" autoComplete="username" value={accountEmail} readOnly hidden />
            <label className="block">
              <span className="mb-1 block text-sm text-white/80">New password</span>
              <input className={input} type={show ? "text" : "password"} autoComplete="new-password" minLength={8}
                value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-white/80">Type it again</span>
              <input className={input} type={show ? "text" : "password"} autoComplete="new-password" minLength={8}
                value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
            </label>
            <p className="text-xs text-white/50">At least 8 characters. A short phrase is easier to remember and harder to guess.</p>
            <button className={button} type="submit" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
          </form>
        </>
      )}

      {stage === "done" && (
        <>
          <h1 className="mt-2 font-heading text-4xl tracking-wide">Password updated</h1>
          <p className="mt-3 text-white/70">
            Your new password works in every 1775 game and app. For safety you&apos;ve been signed out everywhere,
            so sign in again with the new password.
          </p>
          <a href={ret ?? "/"} className={`${button} mt-6 block text-center`}>{returnLabel(ret)}</a>
        </>
      )}
    </section>
  );
}
