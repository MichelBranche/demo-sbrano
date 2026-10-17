"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Removes the server-rendered branded preloader once the critical assets are ready
 * (fonts + above-the-fold priority images), capped so it never blocks for long.
 * A pure-CSS fallback fades it out anyway if JS is slow.
 */
export default function Preloader() {
  useEffect(() => {
    const el = document.getElementById("sb-preloader");
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"]'));
    const imgReady = Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : new Promise<void>((r) => { im.addEventListener("load", () => r(), { once: true }); im.addEventListener("error", () => r(), { once: true }); }))));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise<void>((r) => setTimeout(r, 1500));
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      // measure every ScrollTrigger on the final layout BEFORE revealing the page,
      // so nothing re-computes (and jumps) on the first scroll
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        el?.classList.add("done");
        window.__sbReady = true;
        window.dispatchEvent(new Event("sbrano:ready"));
        setTimeout(() => el?.remove(), 600);
      });
    };
    Promise.race([Promise.all([imgReady, fontsReady]), cap]).then(finish);
  }, []);
  return null;
}

/** Run `fn` once the preloader is gone (immediately if it already is). */
export function onSiteReady(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  if (window.__sbReady) { fn(); return () => {}; }
  window.addEventListener("sbrano:ready", fn, { once: true });
  return () => window.removeEventListener("sbrano:ready", fn);
}
