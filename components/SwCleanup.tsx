"use client";

import { useEffect } from "react";

/** Desregistra quaisquer Service Workers residuais de versões anteriores do app. */
export function SwCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }, []);

  return null;
}
