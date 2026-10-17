"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { LINKS } from "./Hero";
import { HOURS } from "./Dove";

const SOCIAL = [
  { n: "Instagram", h: "https://instagram.com" },
  { n: "TikTok", h: "https://tiktok.com" },
];

/** column heading: small spaced label over a hairline, same rhythm in every column */
const Col = ({ t, children, className = "" }: { t: string; children: React.ReactNode; className?: string }) => (
  <div className={`border-t border-cream/15 pt-4 md:pt-5 ${className}`}>
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-cream/40 md:mb-4">{t}</p>
    {children}
  </div>
);
const link = "sb-tline font-tanker text-[1.45rem] uppercase leading-none transition-colors hover:text-lime md:text-[1.65rem]";

/**
 * Footer, top to bottom: brand + Ordina CTA, four even columns (Naviga, Dove, Orari, Seguici),
 * the mega claim sized on the footer width, legal line. 2 columns on mobile, 4 from lg.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const { setOpen } = useCart();
  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".ft-cl", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".ft-claim", start: "top 92%" } });
    gsap.to(".ft-mascot", { rotate: 8, y: -6, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }, { scope: root });

  return (
    <footer ref={root} className="p-2 md:p-3">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pb-6 pt-7 [container-type:inline-size] text-cream md:rounded-[40px] md:px-10 md:pb-8 md:pt-12 xl:px-14">
        {/* 1. brand + CTA */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative aspect-[1550/1015] w-28 shrink-0 rounded-[18px] bg-lime md:w-44 md:rounded-[22px]">
              <Image src="/assets/brand/logo-mascot.webp" alt="SBRANO" fill sizes="(min-width:768px) 176px, 112px" className="object-contain p-2 md:p-2.5" />
            </div>
            <p className="font-display text-lg uppercase leading-[0.95] md:text-2xl">Smash burger<br />e patatine.<br /><span className="text-lime">Vanchiglia, Torino.</span></p>
          </div>
          <div className="flex items-center gap-5 md:gap-7">
            <button type="button" onClick={() => setOpen(true)} aria-label="Ordina ora, apri il carrello"
              className="sb-ell group relative inline-flex h-14 items-center justify-center whitespace-nowrap px-7 font-tanker text-[1.9rem] uppercase leading-none text-lime md:h-20 md:px-12 md:text-[clamp(2.4rem,1.6rem+2vw,3.4rem)]">
              <span className="sb-ell-t relative z-10 pt-[0.08em]">Ordina ora →</span>
              <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-[8%] -inset-y-[22%] h-[144%] w-[116%] overflow-visible">
                <path pathLength={1} d="M30 56 C 4 40, 30 10, 100 8 C 170 6, 198 26, 192 44 C 186 64, 140 74, 92 73 C 44 72, 8 60, 12 40 C 15 26, 40 16, 62 13" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </button>
            <p className="hidden rotate-[-4deg] whitespace-nowrap font-marker text-[1.4rem] leading-none text-cream sm:block">Ritiro in 15 min.</p>
            <span className="ft-mascot relative ml-auto h-16 w-16 shrink-0 rounded-full border-[3px] border-ink bg-cream md:ml-0 md:h-24 md:w-24">
              <Image src="/assets/mascot/waving.webp" alt="" fill sizes="96px" className="object-contain p-1.5" />
            </span>
          </div>
        </div>

        {/* 2. columns */}
        <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-8 md:mt-12 lg:grid-cols-4 lg:gap-x-10">
          <Col t="Naviga">
            <ul className="space-y-2.5">{LINKS.map((l) => <li key={l.href}><a href={l.href} className={link}>{l.label}</a></li>)}</ul>
          </Col>
          <Col t="Seguici" className="lg:order-last">
            <ul className="space-y-2.5">
              {SOCIAL.map((s) => <li key={s.n}><a href={s.h} target="_blank" rel="noreferrer" className={link}>{s.n} ↗</a></li>)}
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className={`${link} text-lime`}>Sgobba con noi ↗</a></li>
            </ul>
            <p className="mt-4 text-sm text-cream/60">@sbrano.burger</p>
          </Col>
          <Col t="Dove">
            <p className="text-[15px] leading-snug">Piazza Santa Giulia<br />10124 Torino<br /><span className="text-cream/60">Vanchiglia</span></p>
            <a href="#dove" className="sb-uline mt-3 text-sm font-bold text-lime">Come arrivare →</a>
          </Col>
          <Col t="Orari">
            <ul className="space-y-2 text-[14px] leading-snug">
              {HOURS.map(([d, h]) => <li key={d}><span className="block font-bold uppercase tracking-wider">{d}</span>{h.split(" • ").map((x) => <span key={x} className="block whitespace-nowrap text-cream/60">{x}</span>)}</li>)}
            </ul>
          </Col>
        </div>

        {/* 3. mega claim: full width, sized on the footer width (container units) */}
        <p className="ft-claim mt-12 font-display uppercase leading-[0.82] text-lime md:mt-16" style={{ fontSize: "17.4cqw" }}>
          <span className="sr-only">Fame brutta. Prezzi giusti.</span>
          <span aria-hidden className="block overflow-hidden pb-[0.04em]"><span className="ft-cl block whitespace-nowrap">Fame brutta.</span></span>
          <span aria-hidden className="block overflow-hidden pb-[0.04em]"><span className="ft-cl block whitespace-nowrap text-cream">Prezzi giusti.</span></span>
        </p>

        {/* 4. legal */}
        <div className="mt-5 flex flex-col gap-1 border-t border-cream/10 pt-4 text-[11px] text-cream/50 md:mt-6 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-5 md:text-xs">
          <p>SBRANO è un brand di fantasia. Il sito è un concept demo ambientato in Piazza Santa Giulia, Torino.</p>
          <p>Concept demo di <a href="https://michelbranche.it" className="sb-uline font-bold text-lime">Michel Branche, michelbranche.it</a></p>
        </div>
      </div>
    </footer>
  );
}
