"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import SectionHead from "../ui/SectionHead";
import Ribbon from "./Ribbon";
import { BLUR } from "@/lib/blur";

const PICS = [
  { src: "/assets/locale/esterno-piazza-logo.webp", alt: "L'insegna SBRANO di notte in Piazza Santa Giulia", cap: "La piazza, di notte", cls: "lg:col-span-7 lg:row-span-2 aspect-[3/2] lg:aspect-auto" },
  { src: "/assets/locale/interno.webp", alt: "Interno con il murale della mascotte e il bancone", cap: "Il bancone", cls: "lg:col-span-5 aspect-[16/9] lg:aspect-auto lg:translate-y-16" },
  { src: "/assets/locale/tavolo.webp", alt: "Amici che condividono burger e patatine visti dall'alto", cap: "Si divide. Forse.", cls: "lg:col-span-5 aspect-[3/2] lg:aspect-auto lg:translate-y-16" },
];

export default function Locale() {
  const root = useRef<HTMLElement>(null);
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
    <section ref={root} id="locale" className="relative bg-ink pb-10 pt-20 text-cream md:pt-28">
      <div className="px-4 md:px-10">
        <SectionHead dark label="La tana" icon="mascot" tilt={-3} l1="Vieni a" l2="sporcarti" note="Piazza Santa Giulia, cuore di Vanchiglia. Tavoli fuori, musica dentro, mani unte ovunque." />
      </div>
      <div className="relative mx-auto mt-14 max-w-[1440px] px-4 md:px-10" style={{ perspective: "1200px" }}>
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[300px_300px] lg:gap-6">
          {PICS.map((p) => (
            <figure key={p.src} className={`l-pic group relative overflow-hidden rounded-[28px] ${p.cls}`} style={{ transformStyle: "preserve-3d" }}>
              <div className="l-img absolute inset-x-0 -inset-y-[10%]"><Image src={p.src} alt={p.alt} fill placeholder="blur" blurDataURL={BLUR[p.src]} sizes={p.cls.includes("col-span-7") ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 42vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink">{p.cap}</figcaption>
            </figure>
          ))}
        </div>
        <Ribbon id="loc-rb" tone="lime" className="absolute left-0 right-0 top-[42%] z-10" text={["Vanchiglia", "✶", "Good mood", "✶", "Mani unte", "✶", "Aperti fino a tardi", "✶"]} path="M-100 180 C 300 60, 600 60, 800 130 S 1200 230, 1540 60" />
      </div>
      <div className="mx-auto mt-24 flex max-w-[1440px] flex-wrap gap-3 px-4 md:px-10">
        {["Tavoli in piazza", "Pet friendly", "Musica hip hop", "Asporto in 10 min"].map((t) => <span key={t} className="pill-label border-2 border-cream/30">{t}</span>)}
      </div>
    </section>
  );
}
