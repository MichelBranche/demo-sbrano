"use client";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import Badge, { type BadgeIcon } from "./Badge";

/** Pill label + staggered two-line uppercase title. */
export default function SectionHead({
  label, l1, l2, dark = false, align = "center", note, icon = "bolt", tilt = -3,
}: { label: string; l1: string; l2: string; dark?: boolean; align?: "center" | "left"; note?: string; icon?: BadgeIcon; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".sh-line", {
      yPercent: 110, rotate: 3, duration: 1, ease: "expo.out", stagger: 0.12,
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
    });
    gsap.from(".sh-pill", { scale: 0, rotate: -12, duration: 0.7, ease: "back.out(2)", scrollTrigger: { trigger: ref.current, start: "top 85%" } });
  }, { scope: ref });
  const center = align === "center";
  return (
    <div ref={ref} className={`relative flex flex-col gap-4 ${center ? "items-center text-center" : "items-start"}`}>
      <Badge className="sh-pill" icon={icon} tilt={tilt} dark={dark}>{label}</Badge>
      <h2 className={`font-display uppercase leading-[0.86] ${dark ? "text-cream" : "text-ink"} ${center ? "text-[11.5vw] md:text-[clamp(56px,6.6vw,104px)]" : "text-[10.5vw] md:text-[clamp(44px,4.8vw,80px)]"}`}>
        <span className={`block overflow-hidden pb-[0.06em] ${center ? "md:-translate-x-[8%]" : ""}`}><span className="sh-line block whitespace-nowrap">{l1}</span></span>
        <span className={`block overflow-hidden pb-[0.06em] ${center ? "md:translate-x-[10%]" : "pl-[0.7em]"}`}><span className={`sh-line block whitespace-nowrap ${dark ? "text-lime" : ""}`}>{l2}</span></span>
      </h2>
      {note && <p className={`max-w-md text-base md:text-lg ${dark ? "text-cream/70" : "text-ink/70"}`}>{note}</p>}
    </div>
  );
}
