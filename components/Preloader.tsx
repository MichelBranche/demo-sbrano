"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Sticker-pile intro (first visit of the session only, never with reduced motion: the inline head
 * script adds html.sb-nopre). It lasts ~1.15s max, is skippable (tap, click, Esc/Enter/Space), and
 * the page reveal never waits longer than that. On later visits the site is revealed as soon as
 * fonts are in (short cap), with no overlay at all.
 */
export default function Preloader() {
  useEffect(() => {
    const el = document.getElementById("sb-preloader");
    const skip = document.documentElement.classList.contains("sb-nopre");
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    // timed from navigation start (the CSS sequence starts at first paint), never more than ~1.2s
    const t0 = performance.now();
    const minShow = new Promise<void>((r) => setTimeout(r, skip ? 0 : Math.max(0, 1120 - t0)));
    const cap = new Promise<void>((r) => setTimeout(r, skip ? 350 : Math.max(0, 1220 - t0)));
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
        setTimeout(() => el?.remove(), 300);
      });
    };
    const onKey = (e: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(e.key)) finish(); };
    if (el && !skip) { el.addEventListener("pointerdown", finish, { once: true }); addEventListener("keydown", onKey); }
    Promise.race([Promise.all([fontsReady, minShow]), cap]).then(finish);
    return () => removeEventListener("keydown", onKey);
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
