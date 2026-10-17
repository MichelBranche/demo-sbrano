"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import SectionHead from "../ui/SectionHead";
import { BLUR } from "@/lib/blur";

const CARDS = [
  { n: "01", t: "Carne", h: "Piemontese, macinata ogni mattina", d: "Dal macellaio di fiducia, a mezz'ora da qui. Pressata sulla piastra rovente, mai surgelata.", img: "/assets/filiera/carne.webp", alt: "Mani con guanti che formano polpette di manzo", tone: "bg-white text-ink" },
  { n: "02", t: "Pane", h: "Brioche sfornata ogni alba", d: "Un forno di quartiere ce la porta calda alle 7. Burro vero, sesamo tostato, zero scuse.", img: "/assets/filiera/pane.webp", alt: "Panini brioche al sesamo appena sfornati", tone: "bg-ink text-cream" },
  { n: "03", t: "Patate", h: "Di montagna, tagliate a mano", d: "Patate piemontesi, buccia lasciata dove serve, doppia frittura. Croccanti fuori, morbide dentro.", img: "/assets/filiera/patate.webp", alt: "Patate e patatine tagliate a mano su tagliere", tone: "bg-lime text-ink" },
];
const INTRO = "Niente magie da laboratorio. Pochi ingredienti, scelti bene, da gente che conosciamo per nome. Il resto lo fa la piastra.";

export default function Filiera() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    // scroll-coloured text reveal
    gsap.fromTo(".f-word", { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".f-intro", start: "top 80%", end: "bottom 45%", scrub: true } });
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.utils.toArray<HTMLElement>(".f-card").forEach((c, i) => {
        gsap.from(c, { x: -260 + i * 60, y: 260, rotate: -14 + i * 6, opacity: 0, ease: "power3.out", scrollTrigger: { trigger: ".f-cascade", start: `top+=${i * 180} 85%`, end: `top+=${i * 180 + 380} 55%`, scrub: 0.8 } });
        gsap.to(c.querySelector(".f-img"), { yPercent: -12, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray<HTMLElement>(".f-card").forEach((c, i) => {
        gsap.from(c, { y: 120, rotate: i % 2 ? 6 : -6, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 90%" } });
      });
    });
  }, { scope: root });
  return (
    <section ref={root} id="filiera" className="relative overflow-hidden px-4 pb-24 pt-10 md:px-10 md:pt-24">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <SectionHead label="Filiera corta" l1="Roba buona," l2="gente vera" align="left" />
          <p className="f-intro font-display text-2xl uppercase leading-[1.05] md:text-[34px]">
            {INTRO.split(" ").map((w, i) => <span key={i} className="f-word">{w} </span>)}
          </p>
        </div>
        <div className="f-cascade relative mt-14 flex flex-col gap-6 lg:block lg:h-[1040px]">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1360 1040" fill="none" aria-hidden>
            <path d="M160 120 C 500 160, 420 420, 700 460 S 1100 700, 1200 900" stroke="#111" strokeOpacity=".25" strokeWidth="3" strokeDasharray="10 12" />
          </svg>
          {CARDS.map((c, i) => (
            <article key={c.n} className={`f-card relative flex flex-col gap-4 overflow-hidden rounded-[32px] p-5 shadow-[-18px_18px_0_#F6EBD7] md:p-7 lg:absolute lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[480px] lg:rotate-[var(--r)] ${c.tone}`}
              style={{ zIndex: i + 1, ["--l" as string]: ["0%", "32%", "64%"][i], ["--t" as string]: ["0px", "250px", "500px"][i], ["--r" as string]: ["-3deg", "2deg", "-2deg"][i] } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <span className="font-display text-7xl leading-none md:text-8xl">{c.n}</span>
                <span className={`pill-label ${i === 1 ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{c.t}</span>
              </div>
              <h3 className="font-display text-3xl uppercase leading-none">{c.h}</h3>
              <p className="text-sm opacity-75 md:text-base">{c.d}</p>
              <div className="relative aspect-square overflow-hidden rounded-[22px]">
                <div className="f-img absolute inset-x-0 -bottom-[12%] top-0"><Image src={c.img} alt={c.alt} fill placeholder="blur" blurDataURL={BLUR[c.img]} sizes="(min-width:1024px) 480px, (min-width:768px) 90vw, 100vw" className="object-cover" /></div>
              </div>
            </article>
          ))}
          <p className="right-0 top-10 hidden max-w-[260px] rotate-[4deg] font-display text-2xl uppercase leading-none lg:absolute lg:block">Tre fornitori.<br />Zero intermediari.<br /><span className="rounded-full bg-ink px-2 text-lime">Fame onesta.</span></p>
        </div>
      </div>
    </section>
  );
}
