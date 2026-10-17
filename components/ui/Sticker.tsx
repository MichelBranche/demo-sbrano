"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { STICKERS, type StickerName } from "@/lib/stickers";

/**
 * Sparse decorative brand sticker. Purely visual (aria-hidden), tilted, with a light scroll
 * parallax and a wiggle on hover. Position it with `className` (absolute + offsets) in empty
 * space only; it must never sit on top of text or controls.
 */
export default function Sticker({ name, className = "", tilt = -8, parallax = 40, spin = false, sizes = "160px" }: {
  name: StickerName; className?: string; tilt?: number; parallax?: number; /** slow continuous rotation (accents like the asterisk) */ spin?: boolean; sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const s = STICKERS[name];
  useGSAP(() => {
    if (!ref.current || reduced() || !parallax) return;
    gsap.fromTo(ref.current, { y: parallax }, { y: -parallax, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  }, { scope: ref });
  return (
    <div ref={ref} aria-hidden className={`sb-sticker pointer-events-none select-none ${className}`}>
      <div className="sb-sticker-in pointer-events-auto" style={{ ["--tilt" as string]: `${tilt}deg` } as React.CSSProperties}>
        <Image src={s.src} alt="" width={s.w} height={s.h} sizes={sizes} loading="lazy" draggable={false}
          className={`h-auto w-full ${spin ? "sb-sticker-spin" : ""} drop-shadow-[4px_6px_0_rgba(0,0,0,.18)]`} />
      </div>
    </div>
  );
}
