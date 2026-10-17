"use client";
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

const PRESS = "button, a, [role=tab], [role=radio], [role=button], label, [data-press]";

/**
 * Site-wide microinteractions via event delegation (no per-element listeners, no scroll work):
 * - press squish on every control (Web Animations on the `scale` property, so it never fights
 *   React inline transforms or Tailwind translate utilities)
 * - [data-mag]: magnetic pull towards the pointer (fine pointers only)
 * - [data-tilt]: subtle 3D tilt following the pointer (fine pointers only)
 * Everything is transform/opacity and fully disabled with prefers-reduced-motion.
 */
export default function Micro() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const held = new WeakMap<Element, Animation>();

    const amount = (el: HTMLElement) => {
      const r = el.getBoundingClientRect(); const m = Math.min(r.width, r.height);
      return r.width * r.height > 60000 ? 0.985 : m > 90 ? 0.96 : m > 40 ? 0.93 : 0.88;
    };
    const down = (e: PointerEvent) => {
      if (e.button) return;
      const el = (e.target as Element).closest<HTMLElement>(PRESS);
      if (!el || el.closest("[data-no-press]") || (el as HTMLButtonElement).disabled) return;
      held.get(el)?.cancel();
      const a = el.animate([{ scale: "1" }, { scale: String(amount(el)) }], { duration: 110, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" });
      held.set(el, a);
      const up = () => {
        window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
        const s = amount(el);
        el.animate([{ scale: String(s) }, { scale: String(1 + (1 - s) * 0.6) }, { scale: "1" }], { duration: 420, easing: "cubic-bezier(.2,.9,.3,1)" });
        a.cancel(); held.delete(el);
      };
      window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    };
    document.addEventListener("pointerdown", down, { passive: true });
    if (!fine) return () => document.removeEventListener("pointerdown", down);

    // magnetic + tilt (desktop)
    let mag: HTMLElement | null = null, tilt: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const t = e.target as Element;
      const m = t.closest<HTMLElement>("[data-mag]");
      if (mag && mag !== m) { gsap.to(mag, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.35)", overwrite: "auto" }); mag = null; }
      if (m) {
        mag = m; const r = m.getBoundingClientRect();
        const k = Number(m.dataset.mag) || 0.28;
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * k, y: (e.clientY - r.top - r.height / 2) * k, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      }
      const c = t.closest<HTMLElement>("[data-tilt]");
      if (tilt && tilt !== c) { gsap.to(tilt, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" }); tilt = null; }
      if (c) {
        tilt = c; const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: px * 9, rotateX: -py * 9, transformPerspective: 700, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      }
    };
    const leave = () => {
      if (mag) gsap.to(mag, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.35)", overwrite: "auto" });
      if (tilt) gsap.to(tilt, { rotateX: 0, rotateY: 0, duration: 0.5, overwrite: "auto" });
      mag = tilt = null;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return null;
}
