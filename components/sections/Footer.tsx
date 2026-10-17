"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { LINKS } from "./Hero";

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
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pb-6 pt-12 text-cream md:rounded-[40px] md:px-10 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_0.6fr_1fr]">
          <div>
            <div className="relative aspect-[1550/1015] w-48 rounded-[22px] bg-lime md:w-56"><Image src="/assets/brand/logo-mascot.webp" alt="SBRANO" fill sizes="224px" className="object-contain p-3" /></div>
            <p className="mt-4 max-w-xs font-display text-2xl uppercase leading-none">Fame brutta.<br /><span className="text-lime">Prezzi giusti.</span></p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Naviga</p>
            <ul className="space-y-1.5">{LINKS.map((l) => <li key={l.href}><a href={l.href} className="hover:text-lime">{l.label}</a></li>)}</ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cream/40">Social</p>
            <ul className="space-y-1.5">{SOCIAL.map((s) => <li key={s.n}><a href={s.h} target="_blank" rel="noreferrer" className="hover:text-lime">{s.n} ↗</a></li>)}</ul>
            <p className="mt-4 text-sm text-cream/60">@sbrano.burger</p>
          </div>
          <div className="relative">
            <div className="ft-sticker relative aspect-[2/1] w-full rotate-[-4deg] rounded-[22px] bg-cream p-2">
              <Image src="/assets/packaging/sticker-kit.webp" alt="Kit di sticker e packaging SBRANO" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-contain p-2" />
            </div>
            <p className="mt-3 text-sm text-cream/60">Ordina 3 volte, lo sticker kit è tuo. Attaccalo dove vuoi, tranne sulla Mole.</p>
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="ft-giant group relative mt-14 block w-full text-left" aria-label="Ordina ora, apri il carrello">
          <span className="block overflow-hidden whitespace-nowrap font-display text-[17.5vw] uppercase leading-[0.8] text-lime transition-colors group-hover:text-cream md:text-[16.5vw] xl:text-[min(16.5vw,250px)]">
            {"ORDINA ORA".split("").map((c, i) => <span key={i} className="ft-char inline-block">{c === " " ? "\u00A0" : c}</span>)}
          </span>
          <span className="ft-mascot absolute -top-24 right-[4%] h-20 w-20 rounded-full border-[3px] border-ink bg-cream md:-top-16 md:h-36 md:w-36">
            <Image src="/assets/mascot/waving.webp" alt="" fill sizes="144px" className="object-contain p-2" />
          </span>
        </button>

        <div className="mt-6 flex flex-col gap-2 border-t border-cream/10 pt-5 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>SBRANO è un brand di fantasia. Piazza Santa Giulia, Torino.</p>
          <p>Demo concept di <a href="https://michelbranche.it" className="font-bold text-lime hover:underline">Michel Branche, michelbranche.it</a></p>
        </div>
      </div>
    </footer>
  );
}
