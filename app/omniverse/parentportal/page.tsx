'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Controls {
  master_enabled:        boolean;
  filter_chat:           boolean;
  filter_names:          boolean;
  allow_social_link:     boolean;
  allow_social_share:    boolean;
  allow_friend_requests: boolean;
  allow_player_chat:     boolean;
}

type ViewState = 'login' | 'dashboard' | 'saved';

const SUPABASE_URL = process.env.NEXT_PUBLIC_OMNIVERSE_SUPABASE_URL ?? '';

// ── Toggle row component ──────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 py-4 border-b border-gray-800 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex-1">
        <p className="font-semibold text-white text-sm">{label}</p>
        <p className="text-gray-400 text-xs mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          value ? 'bg-purple-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ParentPortalPage() {
  // Login state
  const [email, setEmail]         = useState('');
  const [pin, setPin]             = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Session state
  const [view, setView]           = useState<ViewState>('login');
  const [sessionToken, setToken]  = useState('');
  const [playerName, setName]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  // Controls
  const [controls, setControls] = useState<Controls>({
    master_enabled:        true,
    filter_chat:           true,
    filter_names:          true,
    allow_social_link:     false,
    allow_social_share:    false,
    allow_friend_requests: false,
    allow_player_chat:     false,
  });

  // ── Login handler ───────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim() || !pin.trim()) {
      setLoginError('Please enter your email and PIN.');
      return;
    }
    if (!/^\d{6}$/.test(pin.trim())) {
      setLoginError('PIN must be exactly 6 digits.');
      return;
    }

    setLoggingIn(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/parent-portal-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_email: email.trim().toLowerCase(), pin: pin.trim() }),
      });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        setLoginError(data.error ?? 'Login failed. Please check your email and PIN.');
        return;
      }

      setToken(data.session_token);
      setName(data.player_name ?? 'Your child');
      if (data.controls) setControls(data.controls as Controls);
      setView('dashboard');
    } catch {
      setLoginError('Network error — please check your connection and try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  // ── Save handler ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/parent-portal-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, controls }),
      });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        if (resp.status === 401) {
          setSaveError('Your session has expired. Please log in again.');
          setView('login');
          return;
        }
        setSaveError(data.error ?? 'Save failed. Please try again.');
        return;
      }

      setView('saved');
    } catch {
      setSaveError('Network error — please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Controls) => (val: boolean) =>
    setControls((prev) => ({ ...prev, [key]: val }));

  const featsDisabled = !controls.master_enabled;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header banner */}
      <div className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-lg font-black shrink-0">
            O
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">OMNIVERSE: ASCENSION</p>
            <p className="text-purple-400 text-xs tracking-widest">PARENT SAFETY PORTAL</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <div>
            <h1 className="text-2xl font-bold mb-1">Parent Sign-In</h1>
            <p className="text-gray-400 text-sm mb-8">
              Enter the email address and 6-digit PIN from the email we sent you
              when your child registered.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide uppercase">
                  Parent / Guardian Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide uppercase">
                  6-Digit PIN
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="——————"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-colors"
              >
                {loggingIn ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 bg-[#111827] border border-gray-800 rounded-xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Didn&apos;t receive your PIN?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Check your spam/junk folder for an email from{' '}
                <span className="text-gray-300">family@1775gaming.com</span>.
                If your child used the wrong email address, they can update it
                from <strong className="text-gray-300">Settings → Safety</strong> inside the app.
              </p>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Safety Settings</h1>
              <p className="text-gray-400 text-sm mt-1">
                Controlling account for:{' '}
                <span className="text-purple-400 font-semibold">{playerName}</span>
              </p>
            </div>

            {/* Master toggle — prominent card */}
            <div className={`rounded-xl border-2 p-5 mb-6 transition-colors ${
              controls.master_enabled
                ? 'border-purple-600 bg-purple-900/20'
                : 'border-red-700 bg-red-900/20'
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-white">Master Safety Switch</p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {controls.master_enabled
                      ? 'ON — individual settings below are active.'
                      : 'OFF — ALL social & chat features are locked, all filters ON. Individual settings are ignored.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={controls.master_enabled}
                  onClick={() => set('master_enabled')(!controls.master_enabled)}
                  className={`relative shrink-0 w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    controls.master_enabled ? 'bg-purple-600' : 'bg-red-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                      controls.master_enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Individual controls */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl px-5 mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pt-4 pb-2">
                Content Filters
              </p>
              <ToggleRow
                label="Filter Chat Messages"
                description="Replace inappropriate words with asterisks in all chat messages."
                value={controls.master_enabled ? controls.filter_chat : true}
                onChange={set('filter_chat')}
                disabled={featsDisabled}
              />
              <ToggleRow
                label="Filter Player Names"
                description="Replace inappropriate words in player display names and character names."
                value={controls.master_enabled ? controls.filter_names : true}
                onChange={set('filter_names')}
                disabled={featsDisabled}
              />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pt-5 pb-2">
                Social Features
              </p>
              <ToggleRow
                label="Link Social Media Accounts"
                description="Allow your child to link their TikTok, Instagram, or other social media to their profile."
                value={controls.master_enabled ? controls.allow_social_link : false}
                onChange={set('allow_social_link')}
                disabled={featsDisabled}
              />
              <ToggleRow
                label="Share to Social Media"
                description="Allow your child to share game screenshots or achievements to social platforms."
                value={controls.master_enabled ? controls.allow_social_share : false}
                onChange={set('allow_social_share')}
                disabled={featsDisabled}
              />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pt-5 pb-2">
                Player Communication
              </p>
              <ToggleRow
                label="Friend Requests"
                description="Allow your child to send and accept friend requests from other players."
                value={controls.master_enabled ? controls.allow_friend_requests : false}
                onChange={set('allow_friend_requests')}
                disabled={featsDisabled}
              />
              <ToggleRow
                label="Player Chat"
                description="Allow your child to use the direct player-to-player chat system."
                value={controls.master_enabled ? controls.allow_player_chat : false}
                onChange={set('allow_player_chat')}
                disabled={featsDisabled}
              />
            </div>

            {saveError && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 mb-4">
                {saveError}
              </p>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base"
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Changes take effect immediately the next time your child opens the app.
            </p>
          </div>
        )}

        {/* ── SAVED CONFIRMATION ── */}
        {view === 'saved' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-900/40 border-2 border-green-600 flex items-center justify-center text-3xl mx-auto mb-6">
              ✓
            </div>
            <h1 className="text-2xl font-bold mb-3">Settings Saved</h1>
            <p className="text-gray-400 mb-8">
              Your changes for <span className="text-purple-400 font-semibold">{playerName}</span>{' '}
              have been saved and will apply the next time they open the app.
            </p>
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="bg-[#111827] border border-gray-700 hover:border-purple-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Back to Settings
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-700">
            OMNIVERSE: Ascension is published by 1775 Gaming LLC.<br />
            For support, contact{' '}
            <a href="mailto:support@1775gaming.com" className="text-gray-500 hover:text-gray-400">
              support@1775gaming.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
