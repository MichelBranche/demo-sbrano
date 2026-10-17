"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, reduced } from "@/lib/gsap";

const WORDS = ["Smash burger", "✶", "A Torino, Vanchiglia", "✶", "Burger • Fries • Drinks", "✶", "Burger • Fries • Good mood", "✶"];

/** Curved scrolling text ribbon; speed and direction react to scroll velocity. */
export default function Ribbon({ id = "rb", text = WORDS, tone = "dark", className = "", path }: {
  id?: string; text?: string[]; tone?: "dark" | "lime"; className?: string; path?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const base = path ?? "M-100 140 C 200 40, 420 40, 720 120 S 1240 220, 1540 90";
  // Keep 1 viewBox unit = same vertical scale at any width: the viewBox width follows the element's aspect and the
  // curve is stretched horizontally only. Text size stays constant and the band always reaches both screen edges
  // (before, "slice" cropped the band top/bottom on wide screens).
  const [vw, setVw] = useState(1440);
  useLayoutEffect(() => {
    const svg = root.current?.querySelector("svg"); if (!svg) return;
    const fit = () => { const r = svg.getBoundingClientRect(); if (r.height) setVw(Math.max(600, Math.round((r.width / r.height) * 240))); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(svg); return () => ro.disconnect();
  }, []);
  const k = vw / 1440;
  let i = 0;
  const d = base.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? (Number(n) * k).toFixed(1) : n));
  const str = Array(6).fill(text.join("  ")).join("  ");
  useGSAP(() => {
    if (reduced()) return;
    const tps = root.current!.querySelectorAll<SVGTextPathElement>("textPath");
    const st = { off: 0, boost: 0 };
    let dir = 1;
    const textEl = root.current!.querySelector("text")!;
    const cycle = Math.max(600, textEl.getComputedTextLength() / 6);
    let visible = false;
    const tick = () => {
      if (!visible) return; // offscreen ribbons cost nothing
      st.boost *= 0.92;
      st.off -= (0.6 + st.boost) * dir;
      // keep offset within one repeat cycle
      if (st.off < -cycle) st.off += cycle;
      if (st.off > 0) st.off -= cycle;
      const v = st.off.toFixed(1);
      tps.forEach((t) => t.setAttribute("startOffset", v));
    };
    const trig = ScrollTrigger.create({
      trigger: root.current, start: "top bottom", end: "bottom top",
      onToggle: (self) => { visible = self.isActive; },
      onUpdate: (self) => {
        const v = self.getVelocity();
        dir = v < 0 ? -1 : 1;
        st.boost = Math.min(Math.abs(v) / 120, 18);
      },
    });
    visible = trig.isActive;
    gsap.ticker.add(tick);
    // no draw-in on the band: the ribbon is fully rendered from the first paint (it used to pop in while scrolling)
    return () => { gsap.ticker.remove(tick); trig.kill(); };
  }, { scope: root });
  const band = tone === "dark" ? "#111" : "#D6FF4D";
  const ink = tone === "dark" ? "#D6FF4D" : "#111";
  return (
    <div ref={root} className={`pointer-events-none relative w-full ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${vw} 240`} className="block h-[140px] w-full overflow-visible md:h-[240px]" preserveAspectRatio="none">
        <defs><path id={`${id}-p`} d={d} /></defs>
        <path className="rb-band" d={d} stroke={band} strokeWidth="78" fill="none" />
        <text className="font-display" fontSize="44" fill={ink} dy="15" letterSpacing="1">
          <textPath href={`#${id}-p`} startOffset="0">{str.toUpperCase()}</textPath>
        </text>
      </svg>
    </div>
  );
}
