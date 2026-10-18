"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import Sticker from "../ui/Sticker";
import SectionHead from "../ui/SectionHead";
import Ribbon from "./Ribbon";
import { BLUR } from "@/lib/blur";
import { HOURS, isOpenNow } from "@/lib/hours";
import { useDragStickers } from "@/lib/drag";

/** the ribbon carries the real opening hours */
const RIBBON = HOURS.flatMap(([d, h]) => [h.startsWith("Chiuso") ? `${d} chiuso` : `${d} ${h}`, "✶"]);

const PICS = [
  { src: "/assets/locale/locale-night.webp", alt: "Il locale SBRANO di notte: insegna al neon, gente fuori e il bancone acceso", cls: "lg:col-span-7 lg:row-span-2 aspect-[3/2] lg:aspect-auto" },
  { src: "/assets/locale/interno.webp", alt: "Interno con il murale della mascotte e il bancone", cls: "lg:col-span-5 aspect-[16/9] lg:aspect-auto lg:translate-y-16" },
  { src: "/assets/locale/tavolo.webp", alt: "Amici che condividono burger e patatine visti dall'alto", cls: "lg:col-span-5 aspect-[3/2] lg:aspect-auto lg:translate-y-16" },
];

export default function Locale() {
  const root = useRef<HTMLElement>(null);
  // computed after mount (Europe/Rome clock) so server and client HTML always match
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => { const f = () => setOpen(isOpenNow()); f(); const t = setInterval(f, 60_000); return () => clearInterval(t); }, []);
  const dragInit = useDragStickers(root);
  useEffect(() => dragInit(), [dragInit]);
  useGSAP(() => {
    if (reduced()) return;
    gsap.utils.toArray<HTMLElement>(".l-pic").forEach((p, i) => {
      gsap.from(p, { clipPath: "inset(30% 30% 30% 30% round 40px)", scale: 0.9, duration: 1.4, ease: "expo.out", delay: i * 0.1, scrollTrigger: { trigger: p, start: "top 85%" } });
      gsap.fromTo(p.querySelector(".l-img"), { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // 3D tilt on hover
    gsap.utils.toArray<HTMLElement>(".l-pic").forEach((p) => {
      const rx = gsap.quickTo(p, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(p, "rotationY", { duration: 0.6, ease: "power3" });
      p.addEventListener("pointermove", (e) => { const r = p.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 8); rx(-((e.clientY - r.top) / r.height - 0.5) * 8); });
      p.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }, { scope: root });
  return (
    <section ref={root} id="locale" className="relative bg-ink pb-32 pt-20 md:pb-36 lg:pb-28 text-cream md:pt-28">
      <div className="px-4 md:px-10">
        <SectionHead dark label="Il locale" icon="mascot" tilt={-3} l1="Un posto" l2="a Vanchiglia" note="Piazza Santa Giulia, nel cuore di Vanchiglia." />
        {/* open/closed sticker: space is reserved (same height either way), text appears once the clock is read */}
        <div className="mt-6 flex justify-center">
          <div data-drag className="relative z-30">
            <a href="#dove" data-open={open === null ? "" : open ? "1" : "0"} aria-label={open === null ? "Orari" : open ? "Aperti adesso. Vedi orari e indirizzo" : "Chiusi adesso. Vedi gli orari"}
              className={`sb-stk sb-tag gap-2.5 font-tanker text-[clamp(1.35rem,1.1rem+1vw,2.1rem)] uppercase transition-opacity duration-300 ${open ? "bg-lime text-ink" : "bg-cream text-ink"} ${open === null ? "opacity-0" : "opacity-100"}`}
              style={{ ["--r" as string]: open ? "-4deg" : "3deg" } as React.CSSProperties}
              onClick={(e) => { const d = (e.currentTarget.parentElement as HTMLElement).dataset; if (d.dragged) { delete d.dragged; e.preventDefault(); } }}>
              <span aria-hidden className={`relative flex h-3.5 w-3.5 shrink-0 rounded-full ${open ? "bg-[#18a34a]" : "bg-[#e0352b]"}`}>{open && <span className="absolute inset-0 animate-ping rounded-full bg-[#18a34a] opacity-60" />}</span>
              <span className="pt-[0.1em]">{open === null ? "Aperti. Corri." : open ? "Aperti. Corri." : "Chiusi. Sogna il burger."}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="relative mt-14">
      <div className="relative mx-auto mt-14 max-w-[1440px] px-4 md:px-10" style={{ perspective: "1200px" }}>
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[300px_300px] lg:gap-6">
          {PICS.map((p) => (
            <figure key={p.src} className={`l-pic group relative overflow-hidden rounded-[28px] ${p.cls}`} style={{ transformStyle: "preserve-3d" }}>
              <div className="l-img absolute inset-x-0 -inset-y-[10%]"><Image src={p.src} alt={p.alt} fill placeholder="blur" blurDataURL={BLUR[p.src]} sizes={p.cls.includes("col-span-7") ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 42vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
            </figure>
          ))}
        </div>
      </div>
      {/* like the hero ribbon: full-bleed (section width = viewport, no container padding), same curve, layered above the photos */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2"><Ribbon id="loc-rb" tone="lime" text={["Orari di apertura", "✶", ...RIBBON]} /></div>
      </div>
      <Sticker name="corona" tilt={-12} parallax={24} className="absolute bottom-4 right-6 w-20 md:bottom-6 md:right-[6%] md:w-28 lg:bottom-auto lg:right-[8%] lg:top-28" sizes="(min-width:768px) 112px, 80px" />
    </section>
  );
}
