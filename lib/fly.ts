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
 * Fly one or more images along a curve into the visible cart pill.
 * The first image is the hero of the throw; extras (menu fries / drink) follow with a delay.
 */
export function flyToCart(source: HTMLElement | null, src: string | string[], done?: () => void, opts: { big?: boolean } = {}) {
  const target = visibleCart();
  const srcs = Array.isArray(src) ? src : [src];
  if (!source || !target || reduced()) { done?.(); return; }
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const base = opts.big ? Math.min(240, Math.max(120, s.width * 0.8)) : Math.min(160, Math.max(80, s.width * 0.6));
  let landed = 0;
  srcs.forEach((u, k) => {
    const size = k ? base * 0.55 : base;
    const img = make(u, size);
    const x0 = s.left + s.width / 2 - size / 2 + (k ? (k === 1 ? -1 : 1) * s.width * 0.32 : 0);
    const y0 = s.top + s.height / 2 - size / 2 + (k ? s.height * 0.18 : 0);
    const x1 = t.left + t.width / 2 - size / 2, y1 = t.top + t.height / 2 - size / 2;
    // quadratic bezier with the control point high above the midpoint
    const cx = (x0 + x1) / 2 + (x1 > x0 ? -60 : 60), cy = Math.min(y0, y1) - (opts.big ? 260 : 170);
    const p = { t: 0 };
    const setX = gsap.quickSetter(img, "x", "px"), setY = gsap.quickSetter(img, "y", "px");
    const place = () => { const q = p.t, a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, c = q * q; setX(a * x0 + b * cx + c * x1); setY(a * y0 + b * cy + c * y1); };
    place();
    const tl = gsap.timeline({ delay: k * 0.09, onComplete: () => {
      img.remove();
      if (++landed === srcs.length) { burst(t.left + t.width / 2, t.top + t.height / 2, opts.big ? 14 : 9); done?.(); }
    } });
    if (opts.big && !k) tl.fromTo(img, { scale: 1 }, { scale: 0.86, scaleY: 0.78, duration: 0.12, ease: "power2.in" }).to(img, { scale: 1.12, scaleY: 1.12, duration: 0.16, ease: "back.out(3)" });
    const t0 = opts.big && !k ? 0.28 : 0;
    tl.to(p, { t: 1, duration: opts.big ? 0.95 : 0.8, ease: "power1.inOut", onUpdate: place }, t0)
      .to(img, { scale: 0.16, rotate: opts.big ? 380 : 300, duration: opts.big ? 0.95 : 0.8, ease: "power2.in" }, "<");
    // trail of fading crumbs behind the hero image
    if (!k && opts.big) {
      for (let i = 1; i < 7; i++) {
        tl.call(() => {
          const d = document.createElement("span"); const r = img.getBoundingClientRect();
          Object.assign(d.style, { position: "fixed", left: r.left + r.width / 2 - 5 + "px", top: r.top + r.height / 2 - 5 + "px", width: "10px", height: "10px", borderRadius: "999px", background: "#d6ff4d", border: "2px solid #111", zIndex: "9998", pointerEvents: "none" } as CSSStyleDeclaration);
          document.body.appendChild(d);
          gsap.to(d, { scale: 0, opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => d.remove() });
        }, [], t0 + i * 0.12);
      }
    }
  });
}
