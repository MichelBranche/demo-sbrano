"use client";
import { gsap, reduced } from "./gsap";

/** the cart pill currently on screen (hero nav or floating bar) */
export function visibleCart(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find((t) => {
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(t).visibility !== "hidden" && Number(getComputedStyle(t.closest("[data-cart-wrap]") ?? t).opacity) > 0.5;
  });
}

const make = (src: string, size: number) => {
  const img = document.createElement("img");
  img.src = src; img.alt = ""; img.decoding = "async";
  Object.assign(img.style, {
    position: "fixed", left: "0px", top: "0px", width: size + "px", height: size + "px", objectFit: "contain", zIndex: "9999",
    pointerEvents: "none", willChange: "transform", filter: "drop-shadow(0 14px 18px rgba(0,0,0,.35))",
  } as CSSStyleDeclaration);
  document.body.appendChild(img);
  return img;
};

/** small lime/ink confetti burst around a point (transforms + opacity only) */
export function burst(x: number, y: number, n = 10) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) {
    const d = document.createElement("span");
    const s = 5 + Math.random() * 7;
    Object.assign(d.style, {
      position: "fixed", left: x - s / 2 + "px", top: y - s / 2 + "px", width: s + "px", height: s + "px", zIndex: "9999", pointerEvents: "none",
      borderRadius: i % 3 ? "999px" : "2px", background: i % 2 ? "#d6ff4d" : "#111", border: i % 2 ? "1.5px solid #111" : "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(d);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, r = 30 + Math.random() * 34;
    gsap.fromTo(d, { x: 0, y: 0, scale: 0.4, rotate: 0 }, {
      x: Math.cos(a) * r, y: Math.sin(a) * r + 6, scale: 1, rotate: gsap.utils.random(-180, 180), duration: 0.55, ease: "power3.out",
      onComplete: () => { gsap.to(d, { opacity: 0, scale: 0.2, duration: 0.25, onComplete: () => d.remove() }); },
    });
  }
}

/**
 * Add-to-cart throw, slow enough to follow (~2s):
 * 1. the image leaves its source and grows into the CENTER of the viewport,
 * 2. a short hold with a squash-and-pop,
 * 3. it arcs into the visible cart pill, shrinking and spinning, then the pill bursts.
 * The first image is the hero; extras (menu fries / drink) flank it and follow with a small delay.
 */
export function flyToCart(source: HTMLElement | null, src: string | string[], done?: () => void, opts: { big?: boolean } = {}) {
  const target = visibleCart();
  const srcs = Array.isArray(src) ? src : [src];
  if (!source || !target || reduced()) { done?.(); return; }
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const vmin = Math.min(innerWidth, innerHeight);
  const base = Math.round(Math.min(opts.big ? 300 : 250, vmin * (opts.big ? 0.46 : 0.4)));
  const mx = innerWidth / 2, my = innerHeight / 2;
  let landed = 0;
  srcs.forEach((u, k) => {
    const size = k ? base * 0.62 : base;
    const img = make(u, size);
    // start: centred on the source element, at the source's visual size
    const sx = s.left + s.width / 2 + (k ? (k === 1 ? -1 : 1) * s.width * 0.32 : 0), sy = s.top + s.height / 2 + (k ? s.height * 0.18 : 0);
    const s0 = Math.max(0.2, Math.min(1.4, (k ? s.width * 0.3 : s.width * 0.8) / size));
    // hold position: the screen centre (extras sit left / right of the hero, slightly lower)
    const hx = mx + (k ? (k === 1 ? -1 : 1) * base * 0.62 : 0), hy = my + (k ? base * 0.2 : 0);
    const ex = t.left + t.width / 2, ey = t.top + t.height / 2;
    const cx = (hx + ex) / 2 + (ex > hx ? -80 : 80), cy = Math.min(hy, ey) - Math.min(260, innerHeight * 0.28);
    const half = size / 2;
    gsap.set(img, { x: sx - half, y: sy - half, scale: s0, rotate: k ? (k === 1 ? -14 : 14) : -6, opacity: 0.9, zIndex: k ? 9998 : 9999 });
    const p = { t: 0 };
    const setX = gsap.quickSetter(img, "x", "px"), setY = gsap.quickSetter(img, "y", "px");
    const place = () => { const q = p.t, a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, c = q * q; setX(a * hx + b * cx + c * ex - half); setY(a * hy + b * cy + c * ey - half); };
    const tl = gsap.timeline({ delay: k * 0.08, onComplete: () => {
      img.remove();
      if (++landed === srcs.length) { burst(ex, ey, opts.big ? 14 : 10); done?.(); }
    } });
    // 1. rise to the centre (0.55s)
    tl.to(img, { x: hx - half, y: hy - half, scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "power3.out" })
    // 2. hold + pop (0.44s)
      .to(img, { scaleX: 1.08, scaleY: 0.9, duration: 0.14, ease: "power2.in" })
      .to(img, { scaleX: 1.04, scaleY: 1.12, duration: 0.16, ease: "back.out(3)" })
      .to(img, { scale: 1, duration: 0.14, ease: "power2.out" })
    // 3. arc into the cart (1s)
      .to(p, { t: 1, duration: 1, ease: "power2.inOut", onUpdate: place }, ">")
      .to(img, { scale: 0.12, rotate: k ? 260 : 360, duration: 1, ease: "power2.in" }, "<");
    // trail of fading crumbs behind the hero during the arc
    if (!k) {
      const t0 = 1.0;
      for (let i = 1; i < 7; i++) {
        tl.call(() => {
          const d = document.createElement("span"); const r = img.getBoundingClientRect();
          Object.assign(d.style, { position: "fixed", left: r.left + r.width / 2 - 5 + "px", top: r.top + r.height / 2 - 5 + "px", width: "10px", height: "10px", borderRadius: "999px", background: "#d6ff4d", border: "2px solid #111", zIndex: "9997", pointerEvents: "none" } as CSSStyleDeclaration);
          document.body.appendChild(d);
          gsap.to(d, { scale: 0, opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => d.remove() });
        }, [], t0 + i * 0.12);
      }
    }
  });
}
