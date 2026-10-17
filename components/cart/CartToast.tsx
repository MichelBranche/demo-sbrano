"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { visibleCart } from "@/lib/fly";
import { gsap, reduced } from "@/lib/gsap";

/** Tilted brand sticker that pops out under the cart pill after an add (gsap, no extra bundle). */
export default function CartToast() {
  const { notice, announce, setOpen } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  useLayoutEffect(() => {
    if (!notice) return;
    const t = visibleCart()?.getBoundingClientRect();
    setPos(t ? { top: Math.min(innerHeight - 140, t.bottom + 12), right: Math.max(12, innerWidth - t.right - 8) } : { top: 80, right: 12 });
  }, [notice]);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !notice || !pos) return;
    if (reduced()) { gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 }); return; }
    gsap.fromTo(el, { opacity: 0, scale: 0.4, rotate: 14, y: -18 }, { opacity: 1, scale: 1, rotate: -4, y: 0, duration: 0.6, ease: "back.out(2.4)", overwrite: true });
  }, [notice, pos]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => {
      const el = ref.current;
      if (!el || reduced()) { announce(null); return; }
      gsap.to(el, { opacity: 0, scale: 0.75, rotate: 6, y: -10, duration: 0.22, ease: "power2.in", onComplete: () => announce(null) });
    }, 2800);
    return () => clearTimeout(id);
  }, [notice, announce]);
  if (!notice || !pos) return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[95]">
      <div ref={ref} key={notice.key} data-cart-toast style={{ top: pos.top, right: pos.right, transformOrigin: "85% 0%", opacity: 0 }}
        className="pointer-events-auto absolute flex w-[min(300px,calc(100vw-24px))] items-center gap-3 rounded-[22px] border-[3px] border-ink bg-lime p-2 pr-3 text-ink shadow-[5px_6px_0_#111]">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream">
          {notice.img.startsWith("data:")
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={notice.img} alt="" className="absolute inset-0 h-full w-full object-contain p-0.5" />
            : <Image src={notice.img} alt="" fill sizes="56px" className="object-contain p-1" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl uppercase leading-none">{notice.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs font-medium leading-tight text-ink/75">{notice.sub}</span>
        </span>
        {notice.cta !== false && <button type="button" onClick={() => { announce(null); setOpen(true); }} className="shrink-0 rounded-full bg-ink px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-lime">Apri</button>}
      </div>
    </div>
  );
}
