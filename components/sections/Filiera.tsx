"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import Sticker from "../ui/Sticker";
import { BLUR } from "@/lib/blur";

const CARDS = [
  { n: "01", t: "Carne", h: "Manzo piemontese", d: "Manzo piemontese, macinato ogni mattina. Niente congelatore, niente storie.", stamp: "Macinato oggi", img: "/assets/filiera/carne.webp", alt: "Mani con guanti che formano polpette di manzo", tone: "bg-white text-ink" },
  { n: "02", t: "Pane", h: "Brioche al sesamo", d: "Brioche dal forno del quartiere. Arriva calda, finisce subito.", stamp: "Forno di quartiere", img: "/assets/filiera/pane.webp", alt: "Panini brioche al sesamo appena sfornati", tone: "bg-ink text-cream" },
  { n: "03", t: "Patate", h: "Patate tagliate a mano", d: "Patate tagliate a mano, fritte due volte. La seconda è per rispetto.", stamp: "Fritte 2 volte", img: "/assets/filiera/patate.webp", alt: "Patate e patatine tagliate a mano su tagliere", tone: "bg-lime text-ink" },
];
const INTRO = "Ingredienti selezionati e cottura alla piastra. Scopri cosa sta dietro ogni burger.";

export default function Filiera() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    // scroll-coloured text reveal
    gsap.fromTo(".f-word", { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".f-intro", start: "top 80%", end: "bottom 45%", scrub: true } });
    // stamps slap on when their card reaches 70% of the viewport: scale 1.4 -> 1 in 0.3s, then a tiny shake
    gsap.utils.toArray<HTMLElement>(".f-stamp").forEach((st) => {
      gsap.fromTo(st, { scale: 1.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.3, ease: "power4.in",
        scrollTrigger: { trigger: st.closest(".f-card"), start: "top 70%" },
        onComplete: () => { gsap.fromTo(st, { x: -3 }, { x: 0, duration: 0.25, ease: "elastic.out(1.2, 0.2)" }); },
      });
    });
    gsap.from(".f-tline", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".f-title", start: "top 90%" } });
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
          <h2 className="f-title font-tanker text-[clamp(4.25rem,1.6rem+9vw,10.5rem)] uppercase leading-[0.82] text-ink">
            <span className="block overflow-hidden pb-[0.04em]"><span className="f-tline block">Pochi ingredienti.</span></span>
            <span className="block overflow-hidden pb-[0.04em]"><span className="f-tline block pl-[0.6em] text-ink/90">Quelli <span className="relative inline-block">giusti.<svg aria-hidden viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-[0.02em] left-0 h-[0.12em] w-full text-lime"><path d="M3 14 C 50 4, 120 18, 197 6" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" /></svg></span></span></span>
          </h2>
          <p className="f-intro font-display text-2xl uppercase leading-[1.05] md:text-[34px]">
            {INTRO.split(" ").map((w, i) => <span key={i} className="f-word">{w} </span>)}
          </p>
        </div>
        <div className="f-cascade relative mt-14 flex flex-col gap-6 lg:block lg:h-[1040px]">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1360 1040" fill="none" aria-hidden>
            <path d="M160 120 C 500 160, 420 420, 700 460 S 1100 700, 1200 900" stroke="#111" strokeOpacity=".25" strokeWidth="3" strokeDasharray="10 12" />
          </svg>
          {CARDS.map((c, i) => (
            <article key={c.n} data-tilt className={`f-card relative flex flex-col gap-4 overflow-hidden rounded-[32px] p-5 shadow-[-18px_18px_0_#F6EBD7] md:p-7 lg:absolute lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[480px] lg:rotate-[var(--r)] ${c.tone}`}
              style={{ zIndex: i + 1, ["--l" as string]: ["0%", "32%", "64%"][i], ["--t" as string]: ["0px", "250px", "500px"][i], ["--r" as string]: ["-3deg", "2deg", "-2deg"][i] } as React.CSSProperties}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-7xl leading-none md:text-8xl">{c.n}</span>
                <span className={`f-stamp sb-stamp mt-2 rotate-[-7deg] font-tanker text-[clamp(1.1rem,0.95rem+0.6vw,1.6rem)] uppercase leading-none ${i === 1 ? "text-lime [--stamp-bg:#111]" : i === 2 ? "text-ink [--stamp-bg:#d6ff4d]" : "text-ink [--stamp-bg:#fff]"}`}>{c.stamp}</span>
              </div>
              <h3 className="font-display text-3xl uppercase leading-none">{c.h}</h3>
              <p className="text-sm opacity-75 md:text-base">{c.d}</p>
              <div className="relative aspect-square overflow-hidden rounded-[22px]">
                <div className="f-img absolute inset-x-0 -bottom-[12%] top-0"><Image src={c.img} alt={c.alt} fill placeholder="blur" blurDataURL={BLUR[c.img]} sizes="(min-width:1024px) 480px, (min-width:768px) 90vw, 100vw" className="object-cover" /></div>
              </div>
            </article>
          ))}
          <Sticker name="corona" tilt={10} className="absolute right-[3%] top-16 z-0 hidden w-[170px] lg:block" />
        </div>
      </div>
    </section>
  );
}
