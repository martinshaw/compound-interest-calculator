"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "cic-ios-install-hint-dismissed";

function shouldShowIosInstallHint(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return false;
  } catch {
    /* ignore */
  }

  const ua = window.navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari legacy
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  // Chrome/Firefox/Edge on iOS include CriOS/FxiOS/EdgiOS — skip those
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

  return isIOS && isSafari && !isStandalone;
}

/**
 * Closable “Add to Home Screen” hint for iOS Safari (no beforeinstallprompt there).
 */
export default function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowIosInstallHint());
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="install-hint" role="status" aria-live="polite">
      <div className="install-hint-card">
        <div className="flex-1">
          <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">
            Install this calculator
          </div>
          <p>
            On iPhone/iPad: tap the <span className="font-semibold">Share</span> button, then{" "}
            <span className="font-semibold">Add to Home Screen</span> for a full-screen app —
            including offline use.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss install hint"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200
            focus:outline-none focus:ring-2 focus:ring-slate-400/60"
        >
          ×
        </button>
      </div>
    </div>
  );
}
