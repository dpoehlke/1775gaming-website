/*!
 * 1775 Gaming Account SDK v1 — https://www.1775gaming.com/sdk/v1/1775-account.js
 *
 * One login for every 1775 Gaming game and app (Google, Apple, or email/password),
 * plus the checks every game must pass at sign-in: app version, access
 * (free / purchase / membership / subscription), bans & suspensions, maintenance.
 *
 * Usage (web games):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js"></script>
 *   <script src="https://www.1775gaming.com/sdk/v1/1775-account.js"></script>
 *   <script>
 *     Account1775.gate({ game: 'gravity-flip', name: 'Gravity Flip', version: '1.0.0' })
 *       .then(({ user, check }) => { ... optional: game can read user / check ... });
 *   </script>
 *
 * The gate covers the page until the player is signed in AND allowed. It also blocks
 * keyboard input from reaching the game while it is showing.
 * NOTE: a web page can always be tampered with. Anything valuable (purchases, rewards,
 * leaderboards) must ALSO be checked on a server with account_check / account_check_for.
 */
(function () {
  'use strict';

  var PLATFORM_URL = 'https://ksizqvecclwvevfzdjnb.supabase.co';
  var PLATFORM_KEY = 'sb_publishable_ZIBA2VcS1-RgkLMAgvDppA_So4_UJ9l'; // public, safe to ship
  var SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js';
  var SITE = 'https://www.1775gaming.com';

  var state = { client: null, opts: null, root: null, session: null, check: null, resolve: null, open: false, providers: null };

  // Which sign-in methods are switched on in the platform (so we never show a button that
  // leads to "provider is not enabled"). If this can't be fetched, we show the defaults.
  function loadProviders() {
    return fetch((state.opts.url || PLATFORM_URL) + '/auth/v1/settings', { headers: { apikey: state.opts.key || PLATFORM_KEY } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { state.providers = j && j.external ? j.external : null; })
      .catch(function () { state.providers = null; });
  }
  function providerOn(name) { return !state.providers || state.providers[name] === true; }

  // ---------- helpers ----------
  function loadSupabase() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SUPABASE_JS;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Could not load the sign-in library. Check your internet connection.')); };
      document.head.appendChild(s);
    });
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'on') Object.keys(attrs.on).forEach(function (ev) { e.addEventListener(ev, attrs.on[ev]); });
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  var CSS =
    '#a1775{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(6,9,20,.92);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#eef1ff;padding:16px;overflow:auto}' +
    '#a1775 .card{width:100%;max-width:380px;background:#121933;border:1px solid #2a3561;border-radius:18px;padding:22px;box-shadow:0 20px 60px #000a}' +
    '#a1775 .brand{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#ffd166;font-weight:800;margin:0 0 6px}' +
    '#a1775 h2{font-size:21px;margin:0 0 4px;line-height:1.25}' +
    '#a1775 p{margin:0 0 12px;color:#b9c2e6;font-size:14px;line-height:1.45}' +
    '#a1775 button,#a1775 input{font:inherit;width:100%;min-height:46px;border-radius:12px;font-size:16px}' +
    '#a1775 button{cursor:pointer;border:0;font-weight:700;margin-top:8px}' +
    '#a1775 .google{background:#fff;color:#1f1f1f;border:1px solid #747775}' +
    '#a1775 .apple{background:#000;color:#fff;border:1px solid #444}' +
    '#a1775 .primary{background:#ffd166;color:#111}' +
    '#a1775 .ghost{background:transparent;color:#eef1ff;border:1px solid #3a4677}' +
    '#a1775 .link{background:none;color:#cfd6ff;text-decoration:underline;font-weight:500;min-height:36px;width:auto;margin:4px 0 0;padding:0}' +
    '#a1775 .or{text-align:center;color:#8590bd;font-size:13px;margin:12px 0 4px}' +
    '#a1775 label{display:block;font-size:13px;color:#b9c2e6;margin-top:8px}' +
    '#a1775 input{background:#0b1020;color:#eef1ff;border:1px solid #3a4677;padding:0 12px;margin-top:4px}' +
    '#a1775 .row{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
    '#a1775 .msg{min-height:18px;font-size:14px;margin-top:10px;color:#ff8fa3}' +
    '#a1775 .msg.ok{color:#9ff0c9}' +
    '#a1775 .fine{font-size:12px;color:#8590bd;margin-top:12px}' +
    '#a1775 .fine a{color:inherit}' +
    '#a1775chip{position:fixed;left:8px;bottom:8px;z-index:2147483646;font:12px system-ui,sans-serif;background:rgba(18,25,51,.85);' +
    'color:#cfd6ff;border:1px solid #2a3561;border-radius:999px;padding:6px 10px;cursor:pointer}';

  function mount() {
    if (state.root) return state.root;
    if (!document.getElementById('a1775css')) {
      document.head.appendChild(el('style', { id: 'a1775css', text: CSS }));
    }
    var root = el('div', { id: 'a1775', role: 'dialog', 'aria-modal': 'true', 'aria-label': '1775 Gaming sign-in' });
    // Keep keys/clicks inside the gate from reaching the game underneath.
    ['keydown', 'keyup', 'keypress', 'pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function (ev) {
      root.addEventListener(ev, function (e) { e.stopPropagation(); });
    });
    state.root = root;
    return root;
  }

  // Block keyboard events aimed at the page (not the gate) while it is open.
  window.addEventListener('keydown', function (e) {
    if (state.open && state.root && !state.root.contains(e.target)) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);

  function show(card) {
    var root = mount();
    root.innerHTML = '';
    root.appendChild(card);
    if (!root.parentNode) document.body.appendChild(root);
    state.open = true;
    // Focus the email box (not a button): a habitual Space press must not trigger Google sign-in.
    var first = root.querySelector('input') || root.querySelector('button.primary');
    if (first) try { first.focus(); } catch (e) {}
  }

  function hide() {
    state.open = false;
    if (state.root && state.root.parentNode) state.root.parentNode.removeChild(state.root);
  }

  function header(title, text) {
    return [
      el('div', { class: 'brand', text: '1775 Gaming' }),
      el('h2', { text: title }),
      text ? el('p', { text: text }) : null,
    ];
  }

  // ---------- screens ----------
  function signInScreen(mode, note) {
    var creating = mode === 'create';
    var msg = el('div', { class: 'msg', role: 'alert' });
    function say(t, ok) { msg.textContent = t || ''; msg.className = ok ? 'msg ok' : 'msg'; }
    if (note) say(note.text, note.ok);

    var email = el('input', { type: 'email', autocomplete: 'email', required: 'required', placeholder: 'you@example.com' });
    var pass = el('input', { type: 'password', autocomplete: creating ? 'new-password' : 'current-password', minlength: '8', required: 'required' });
    var name = el('input', { type: 'text', autocomplete: 'nickname', maxlength: '40' });

    function oauth(provider) {
      return function () {
        say('');
        state.client.auth.signInWithOAuth({ provider: provider, options: { redirectTo: location.href.split('#')[0] } })
          .then(function (r) { if (r.error) say(r.error.message); });
      };
    }

    var submit = el('button', { class: 'primary', type: 'submit', text: creating ? 'Create account' : 'Sign in' });
    var form = el('form', {
      on: {
        submit: function (e) {
          e.preventDefault();
          var em = email.value.trim().toLowerCase();
          if (!em || pass.value.length < 8) { say('Enter your email and a password of at least 8 characters.'); return; }
          submit.disabled = true; say('');
          var p = creating
            ? state.client.auth.signUp({ email: em, password: pass.value, options: { data: { display_name: name.value.trim() || em.split('@')[0] }, emailRedirectTo: location.href.split('#')[0] } })
            : state.client.auth.signInWithPassword({ email: em, password: pass.value });
          p.then(function (r) {
            submit.disabled = false;
            if (r.error) { say(r.error.message); return; }
            if (creating && !r.data.session) say('Check your email to confirm your account, then sign in.', true);
          });
        },
      },
    }, [
      el('label', { text: 'Email' }, [email]),
      el('label', { text: 'Password' }, [pass]),
      creating ? el('label', { text: 'Display name' }, [name]) : null,
      submit,
    ]);

    var o = state.opts;
    // Google refuses sign-in inside app WebViews (Capacitor etc.), so offer email only there.
    var embedded = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    var showGoogle = o.google !== false && !embedded && providerOn('google');
    var showApple = o.apple !== false && !embedded && providerOn('apple');
    var card = el('div', { class: 'card' }, header(
      o.title || ('Sign in to play ' + (o.name || '')),
      'One 1775 Gaming account for every game and app.'
    ).concat([
      showGoogle ? el('button', { class: 'google', type: 'button', text: 'Continue with Google', on: { click: oauth('google') } }) : null,
      showApple ? el('button', { class: 'apple', type: 'button', text: ' Continue with Apple', on: { click: oauth('apple') } }) : null,
      (showGoogle || showApple) ? el('div', { class: 'or', text: 'or use email' }) : el('p', { text: 'Sign in with the email and password of your 1775 Gaming account.' }),
      form,
      el('div', { class: 'row' }, [
        el('button', { class: 'link', type: 'button', text: creating ? 'Have an account? Sign in' : 'New here? Create an account', on: { click: function () { show(signInScreen(creating ? 'signin' : 'create')); } } }),
        el('button', { class: 'link', type: 'button', text: 'Forgot password?', on: {
          click: function () {
            var em = email.value.trim();
            if (!em) { say('Type your email above first.'); return; }
            // Implicit flow so the emailed link works on any device, not just this browser.
            var resetClient = window.supabase.createClient((state.opts && state.opts.url) || PLATFORM_URL, (state.opts && state.opts.key) || PLATFORM_KEY, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
            var back = location.href.split('#')[0];
            resetClient.auth.resetPasswordForEmail(em, { redirectTo: SITE + '/account/reset-password?return=' + encodeURIComponent(back) }).then(function (r) {
              say(r.error ? r.error.message : 'If that email has an account, a reset link is on its way. Open it on any device, choose a new password, then sign in here.', !r.error);
            });
          },
        } }),
      ]),
      msg,
      el('p', { class: 'fine' }, [
        document.createTextNode('By continuing you agree to the '),
        el('a', { href: SITE + '/terms', target: '_blank', rel: 'noopener', text: 'Terms' }),
        document.createTextNode(' and '),
        el('a', { href: SITE + '/privacy-policy', target: '_blank', rel: 'noopener', text: 'Privacy Policy' }),
        document.createTextNode('.'),
      ]),
    ]));
    return card;
  }

  function blockedScreen(check) {
    var o = state.opts;
    var code = check.code;
    var titles = {
      banned: 'Account banned', suspended: 'Account suspended', update_required: 'Update required',
      maintenance: 'Down for maintenance', no_access: 'You don\'t have access yet', not_released: 'Coming soon',
      unknown_game: 'Game not registered', error: 'Something went wrong',
      not_provisioned: 'Not set up yet',
    };
    var buttons = [];
    if (code === 'update_required') {
      buttons.push(el('button', { class: 'primary', type: 'button', text: 'Update now', on: { click: function () {
        var url = check.update && check.update.url;
        if (url && url !== location.href) location.href = url; else location.reload(true);
      } } }));
    }
    if (code === 'no_access') {
      buttons.push(el('button', { class: 'primary', type: 'button', text: 'See membership options', on: { click: function () { window.open(SITE + '/games', '_blank', 'noopener'); } } }));
    }
    if (code === 'maintenance' || code === 'error') {
      buttons.push(el('button', { class: 'primary', type: 'button', text: 'Try again', on: { click: run } }));
    }
    if (code === 'banned' || code === 'suspended') {
      buttons.push(el('p', { class: 'fine', text: 'If you think this is a mistake, email support@1775gaming.com.' }));
    }
    buttons.push(el('button', { class: 'ghost', type: 'button', text: 'Sign out', on: { click: signOut } }));
    return el('div', { class: 'card' }, header(titles[code] || 'Can\'t continue', check.message).concat(buttons));
  }

  function warningScreen(warnings, done) {
    var text = warnings.map(function (w) { return '• ' + w.reason; }).join('\n');
    var p = el('p', { text: text });
    p.style.whiteSpace = 'pre-line';
    return el('div', { class: 'card' }, header('Account warning', 'A moderator has warned your account:').concat([
      p,
      el('p', { text: 'Further problems can lead to a suspension or ban across all 1775 Gaming games.' }),
      el('button', { class: 'primary', type: 'button', text: 'I understand', on: { click: done } }),
    ]));
  }

  function chip(user) {
    var old = document.getElementById('a1775chip');
    if (old) old.remove();
    if (state.opts.chip === false) return;
    var c = el('button', { id: 'a1775chip', type: 'button', title: 'Signed in as ' + (user.email || 'your account') + ' — tap to sign out',
      text: '1775 · ' + ((user.user_metadata && user.user_metadata.display_name) || (user.email || 'account').split('@')[0]),
      on: { click: function (e) { e.stopPropagation(); if (confirm('Sign out of your 1775 Gaming account?')) signOut(); } } });
    document.body.appendChild(c);
  }

  // ---------- core ----------
  function runCheck() {
    var o = state.opts;
    return state.client.rpc('account_check', { p_game: o.game, p_version: o.version || null, p_platform: o.platform || 'web' })
      .then(function (r) {
        if (r.error) return { allowed: false, code: 'error', message: r.error.message };
        return r.data;
      });
  }

  function run() {
    return state.client.auth.getSession().then(function (r) {
      var session = r.data.session;
      state.session = session;
      if (!session) {
        var old = document.getElementById('a1775chip'); if (old) old.remove();
        show(signInScreen('signin'));
        return;
      }
      return runCheck().then(function (check) {
        state.check = check;
        if (!check.allowed) { show(blockedScreen(check)); return; }
        var finish = function () {
          hide();
          chip(session.user);
          if (state.resolve) { state.resolve({ user: session.user, session: session, check: check }); state.resolve = null; }
        };
        var key = 'a1775_warned_' + session.user.id;
        var seen = 0;
        try { seen = +(localStorage.getItem(key) || 0); } catch (e) {}
        var fresh = (check.warnings || []).filter(function (w) { return Date.parse(w.at) > seen; });
        if (fresh.length) {
          show(warningScreen(fresh, function () { try { localStorage.setItem(key, String(Date.now())); } catch (e) {} finish(); }));
        } else {
          finish();
        }
      });
    }).catch(function (err) {
      show(blockedScreen({ code: 'error', message: err.message || String(err) }));
    });
  }

  function signOut() {
    var old = document.getElementById('a1775chip'); if (old) old.remove();
    return state.client.auth.signOut().then(function () { location.reload(); });
  }

  function gate(opts) {
    if (!opts || !opts.game) throw new Error('Account1775.gate needs { game: "<slug>" }');
    state.opts = opts;
    if (window.__A1775_NATIVE__) {
      // A native app (e.g. an Expo shell) already signed the player in and ran account_check.
      return Promise.resolve({ user: window.__A1775_NATIVE__.user || null, session: null, check: window.__A1775_NATIVE__.check || null, native: true });
    }
    var promise = new Promise(function (resolve) { state.resolve = resolve; });
    var start = function () {
      // Show a placeholder immediately so the game can't be played while we load.
      show(el('div', { class: 'card' }, header('Signing in…', 'Checking your 1775 Gaming account.')));
      loadSupabase().then(function () {
        state.client = window.supabase.createClient(opts.url || PLATFORM_URL, opts.key || PLATFORM_KEY, {
          auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'a1775-auth' },
        });
        state.client.auth.onAuthStateChange(function (event) {
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setTimeout(run, 0);
        });
        return loadProviders().then(run);
      }).catch(function (err) {
        show(blockedScreen({ code: 'error', message: err.message || String(err) }));
      });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
    return promise;
  }

  window.Account1775 = {
    gate: gate,
    signOut: signOut,
    recheck: run,
    get client() { return state.client; },
    get user() { return state.session ? state.session.user : null; },
    get check() { return state.check; },
  };
})();
