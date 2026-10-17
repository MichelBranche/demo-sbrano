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
  { n: "Glovo", h: "https://glovoapp.com" },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const { setOpen } = useCart();
  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".ft-char", { yPercent: 110, rotate: 8, stagger: 0.04, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ft-giant", start: "top 90%" } });
    gsap.from(".ft-sticker", { rotate: -20, scale: 0.6, opacity: 0, duration: 1.2, ease: "elastic.out(1,0.5)", scrollTrigger: { trigger: ".ft-sticker", start: "top 85%" } });
    gsap.to(".ft-mascot", { rotate: 8, y: -8, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }, { scope: root });
  return (
    <footer ref={root} className="p-2 md:p-3">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pb-6 pt-8 text-cream md:rounded-[40px] md:px-10 md:pt-16">
        {/* mobile: flex column with explicit order; md+: original grid + giant CTA below */}
        <div className="flex flex-col gap-4 md:block">
          <div className="contents md:grid md:gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_0.6fr_1fr]">
            {/* 1. logo + claim */}
            <div className="order-1 md:order-none flex items-center gap-4 md:block">
              <div className="relative aspect-[1550/1015] w-32 shrink-0 rounded-[18px] bg-lime md:w-56 md:rounded-[22px]"><Image src="/assets/brand/logo-mascot.webp" alt="SBRANO" fill sizes="(min-width:768px) 224px, 128px" className="object-contain p-2 md:p-3" /></div>
              <p className="max-w-xs font-display text-xl uppercase leading-none md:mt-4 md:text-2xl">Fame brutta.<br /><span className="text-lime">Prezzi giusti.</span></p>
            </div>
            {/* 5. links */}
            <div className="order-5 md:order-none rounded-[22px] bg-cream/5 p-4 md:rounded-none md:bg-transparent md:p-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Naviga</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:block md:space-y-1.5">{LINKS.map((l) => <li key={l.href}><a href={l.href} className="hover:text-lime">{l.label}</a></li>)}</ul>
            </div>
            {/* 4. social */}
            <div className="order-4 md:order-none rounded-[22px] bg-cream/5 p-4 md:rounded-none md:bg-transparent md:p-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Social</p>
              <ul className="flex flex-wrap gap-2 md:block md:space-y-1.5">{SOCIAL.map((s) => <li key={s.n}><a href={s.h} target="_blank" rel="noreferrer" className="inline-block rounded-full border border-cream/20 px-3 py-1.5 text-sm hover:text-lime md:rounded-none md:border-0 md:p-0 md:text-base">{s.n} ↗</a></li>)}</ul>
              <p className="mt-3 text-sm text-cream/60 md:mt-4">@sbrano.burger</p>
            </div>
            {/* 6. sticker */}
            <div className="relative order-6 md:order-none rounded-[22px] bg-cream/5 p-4 md:rounded-none md:bg-transparent md:p-0">
              <div className="ft-sticker relative mx-auto aspect-[2/1] w-full max-w-[360px] rotate-[-4deg] rounded-[22px] bg-cream p-2 md:max-w-none">
                <Image src="/assets/packaging/sticker-kit.webp" alt="Kit di sticker e packaging SBRANO" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-contain p-2" />
              </div>
              <p className="mt-3 text-sm text-cream/60">Ordina 3 volte, lo sticker kit è tuo. Attaccalo dove vuoi, tranne sulla Mole.</p>
            </div>
          </div>

          {/* 3. mobile-only info: orari + indirizzo + contatti (desktop has them in "Dove siamo") */}
          <div className="order-3 md:order-none grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:hidden">
            <div className="rounded-[22px] bg-cream/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Orari</p>
              <ul className="space-y-1.5 text-sm">{HOURS.map(([d, h]) => <li key={d} className="flex flex-col"><span className="font-bold uppercase tracking-wider text-cream">{d}</span><span className="text-cream/60">{h}</span></li>)}</ul>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-[22px] bg-cream/5 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Indirizzo</p>
                <p className="text-sm">Piazza Santa Giulia<br />10124 Torino, Vanchiglia</p>
                <a href="#dove" className="mt-2 inline-block text-sm font-bold text-lime">Come arrivare →</a>
              </div>
              <div className="rounded-[22px] bg-cream/5 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Contatti</p>
                <p className="text-sm">Scrivici su Instagram<br /><span className="text-lime">@sbrano.burger</span></p>
              </div>
            </div>
          </div>

          {/* 2. big CTA */}
          <button onClick={() => setOpen(true)} className="ft-giant group relative order-2 block w-full overflow-hidden rounded-[24px] bg-lime py-5 pl-5 pr-20 text-left md:mt-14 md:overflow-visible md:rounded-none md:bg-transparent md:p-0" aria-label="Ordina ora, apri il carrello">
            <span className="block overflow-hidden whitespace-nowrap font-display text-[12.5vw] uppercase leading-[0.8] text-ink transition-colors md:text-[16.5vw] md:text-lime md:group-hover:text-cream xl:text-[min(16.5vw,250px)]">
              {"ORDINA ORA".split("").map((c, i) => <span key={i} className="ft-char inline-block">{c === " " ? "\u00A0" : c}</span>)}
            </span>
            <span className="mt-2 block text-xs font-bold uppercase tracking-[0.2em] text-ink/60 md:hidden">Ritiro in 15 min ↗</span>
            <span className="ft-mascot absolute right-3 top-[calc(50%-28px)] h-14 w-14 rounded-full border-[3px] border-ink bg-cream md:-top-16 md:right-[4%] md:h-36 md:w-36">
              <Image src="/assets/mascot/waving.webp" alt="" fill sizes="(min-width:768px) 144px, 64px" className="object-contain p-1.5 md:p-2" />
            </span>
          </button>

          {/* 7. legal */}
          <div className="order-7 md:order-none flex flex-col gap-1 border-t border-cream/10 pt-4 text-[11px] text-cream/50 md:mt-6 md:flex-row md:items-center md:justify-between md:gap-2 md:pt-5 md:text-xs">
            <p>SBRANO è un brand di fantasia. Piazza Santa Giulia, Torino.</p>
            <p>Demo concept di <a href="https://michelbranche.it" className="font-bold text-lime hover:underline">Michel Branche, michelbranche.it</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
