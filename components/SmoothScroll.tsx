"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reduced } from "@/lib/gsap";

declare global { interface Window { __lenis?: Lenis; __sbReady?: boolean } }

/**
 * Lenis drives the scroll, GSAP's ticker drives Lenis (single RAF loop), ScrollTrigger
 * reads Lenis' position. Touch devices keep native scrolling (no lag / no jank on mobile).
 * ScrollTrigger is refreshed once fonts + images have settled so start/end positions
 * are measured on the final layout (prevents "late" or skipped reveals).
 */
export default function SmoothScroll() {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    // debounced refresh whenever the document height changes (lazy images, fonts, accordions)
    let t: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };
    let lastH = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 4) { lastH = h; refresh(); }
    });
    ro.observe(document.body);
    document.fonts?.ready.then(refresh);
    if (document.readyState === "complete") refresh(); else window.addEventListener("load", refresh, { once: true });

    if (reduced()) return () => { ro.disconnect(); clearTimeout(t); };

    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -20, duration: 1.1 }); }
    };
    document.addEventListener("click", onClick);
    return () => {
      gsap.ticker.remove(tick); lenis.destroy(); ro.disconnect(); clearTimeout(t);
      document.removeEventListener("click", onClick); delete window.__lenis;
    };
  }, []);
  return null;
}
