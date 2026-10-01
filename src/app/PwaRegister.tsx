"use client";

import { useEffect } from "react";
import InstallHint from "./InstallHint";

/**
 * Registers the service worker relative to the current page so it works both
 * on localhost and under the GitHub Pages /compound-interest-calculator/ base.
 * Also shows a closable iOS Add-to-Home-Screen hint when relevant.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      const swUrl = new URL("sw.js", window.location.href);
      const scope = new URL(".", window.location.href).pathname;

      navigator.serviceWorker.register(swUrl.href, { scope }).catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return <InstallHint />;
}
