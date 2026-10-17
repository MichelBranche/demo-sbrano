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
    gsap.fromTo(ref.current, { scale: 1 }, { scale: 1.18, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", delay: 0.8 });
    gsap.fromTo(badge.current, { y: 0, scale: 1 }, { keyframes: [{ y: -14, scale: 1.4, duration: 0.18, ease: "power2.out" }, { y: 0, scale: 1, duration: 0.5, ease: "bounce.out" }], delay: 0.82 });
  }, [bump]);
  const c = variant === "lime" ? "bg-lime text-ink" : "bg-ink text-lime";
  return (
    <button ref={ref} data-cart-target onClick={() => setOpen(true)} aria-label={`Carrello, ${count} articoli`}
      className={`relative flex h-11 items-center gap-2 rounded-full pl-4 pr-1.5 font-bold uppercase tracking-wider text-xs md:h-12 ${c}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 8h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span className="hidden sm:inline">Carrello</span>
      <span ref={badge} className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm tabular-nums ${variant === "lime" ? "bg-ink text-lime" : "bg-lime text-ink"}`}>{count}</span>
    </button>
  );
}
