"use client";

import { useEffect } from "react";

/**
 * Older password-reset emails pointed at the homepage. If one of those links lands anywhere other
 * than the reset page, forward its recovery token there (hash included) instead of dropping it.
 */
export default function RecoveryForward() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (pathname.startsWith("/account/reset-password")) return;
    const h = new URLSearchParams(hash.replace(/^#/, ""));
    const q = new URLSearchParams(search);
    const recovery = h.get("type") === "recovery" || (q.get("type") === "recovery" && q.has("token_hash"));
    if (recovery) window.location.replace("/account/reset-password" + search + hash);
  }, []);
  return null;
}
