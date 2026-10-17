"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, reduced } from "@/lib/gsap";

/** Number that ticks to its new value (writes textContent directly: no React re-render per frame). */
export default function Tick({ value, format = (n) => String(Math.round(n)), className = "" }: { value: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cur = useRef(value);
  const [first] = useState(() => format(value));
  const fmt = useRef(format); fmt.current = format;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduced() || cur.current === value) { el.textContent = fmt.current(value); cur.current = value; return; }
    const o = { v: cur.current };
    const tw = gsap.to(o, { v: value, duration: 0.55, ease: "power2.out", onUpdate: () => { el.textContent = fmt.current(o.v); }, onComplete: () => { cur.current = value; } });
    gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    return () => { tw.kill(); cur.current = o.v; };
  }, [value]);
  return <span ref={ref} className={`inline-block tabular-nums ${className}`}>{first}</span>;
}
