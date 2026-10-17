"use client";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { gsap, reduced } from "@/lib/gsap";

export default function CartButton({ variant = "lime" }: { variant?: "lime" | "dark" }) {
  const { count, setOpen, bump } = useCart();
  const ref = useRef<HTMLButtonElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!bump || reduced()) return;
    // add() runs when the flying item lands: squash, stretch, settle; the badge jumps and pops
    gsap.timeline({ overwrite: true })
      .to(ref.current, { scaleX: 1.22, scaleY: 0.8, duration: 0.1, ease: "power2.out" })
      .to(ref.current, { scaleX: 0.9, scaleY: 1.14, rotate: -6, duration: 0.12, ease: "power2.out" })
      .to(ref.current, { scaleX: 1, scaleY: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1.1,0.35)" });
    gsap.fromTo(badge.current, { y: 0, scale: 1, rotate: 0 }, { keyframes: [{ y: -16, scale: 1.7, rotate: 14, duration: 0.18, ease: "power2.out" }, { y: 0, scale: 1, rotate: 0, duration: 0.55, ease: "bounce.out" }] });
  }, [bump]);
  const c = variant === "lime" ? "bg-lime text-ink" : "bg-ink text-lime";
  return (
    <button ref={ref} data-cart-target data-mag onClick={() => setOpen(true)} aria-label={`Carrello, ${count} articoli`}
      className={`group relative flex h-11 w-14 shrink-0 items-center justify-center rounded-full md:h-12 md:w-16 ${c}`}>
      {/* icon-only cart pill; count sits in a small badge on the top-right edge */}
      <svg className="transition-transform duration-300 ease-[cubic-bezier(.3,1.8,.5,1)] group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 8h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span ref={badge} aria-hidden className={`absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ring-2 ${variant === "lime" ? "bg-ink text-lime ring-lime" : "bg-lime text-ink ring-ink"}`}><span key={count} className="sb-pop inline-block">{count}</span></span>
    </button>
  );
}
