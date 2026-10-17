"use client";
import { gsap, reduced } from "./gsap";

/** Clone an image and fly it in an arc to the visible cart button. */
export function flyToCart(source: HTMLElement | null, src: string, done?: () => void) {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  const target = targets.find((t) => {
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(t).visibility !== "hidden" && Number(getComputedStyle(t.closest("[data-cart-wrap]") ?? t).opacity) > 0.5;
  });
  if (!source || !target || reduced()) { done?.(); return; }
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const size = Math.min(160, Math.max(80, s.width * 0.6));
  const img = document.createElement("img");
  img.src = src; img.alt = "";
  Object.assign(img.style, {
    position: "fixed", left: "0px", top: "0px", width: size + "px", height: size + "px",
    objectFit: "contain", zIndex: "9999", pointerEvents: "none", willChange: "transform",
    filter: "drop-shadow(0 12px 18px rgba(0,0,0,.35))",
  } as CSSStyleDeclaration);
  document.body.appendChild(img);
  const x0 = s.left + s.width / 2 - size / 2, y0 = s.top + s.height / 2 - size / 2;
  const x1 = t.left + t.width / 2 - size / 2, y1 = t.top + t.height / 2 - size / 2;
  const tl = gsap.timeline({ onComplete: () => { img.remove(); done?.(); } });
  gsap.set(img, { x: x0, y: y0, scale: 1, rotate: 0 });
  tl.to(img, { x: x1, duration: 0.85, ease: "power1.inOut" }, 0)
    .to(img, { y: Math.min(y0, y1) - 160, duration: 0.38, ease: "power2.out" }, 0)
    .to(img, { y: y1, duration: 0.47, ease: "power2.in" }, 0.38)
    .to(img, { scale: 0.18, rotate: 300, duration: 0.85, ease: "power1.in" }, 0);
}
