"use client";
import Image from "next/image";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { LINKS } from "./Hero";
import { HOURS } from "@/lib/hours";
import Doodle from "../ui/Doodle";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

const MAPS = "https://www.google.com/maps/search/?api=1&query=Piazza+Santa+Giulia+Torino";
const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOCIAL = [
  { n: "Instagram", h: "https://instagram.com", i: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...ico} /><circle cx="12" cy="12" r="4" {...ico} /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" /></> },
  { n: "TikTok", h: "https://tiktok.com", i: <path d="M14 3.5v11.2a3.7 3.7 0 1 1-3.7-3.7M14 3.5c.5 2.6 2.3 4.3 5 4.6" {...ico} /> },
];

const Wave = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className={`block h-[34px] w-full md:h-[64px] ${flip ? "rotate-180" : ""}`} aria-hidden>
    <path d="M0 70 L0 34 C 200 6, 380 4, 600 26 S 1000 64, 1200 30 S 1380 8, 1440 18 L1440 70 Z" fill="#111" />
  </svg>
);
const Arrow = () => <span aria-hidden className="text-lime transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>;

/** numbered column: tiny index label, Tanker title, content */
const Col = ({ n, label, title, children, className = "" }: { n: string; label: string; title: string; children: React.ReactNode; className?: string }) => (
  <div className={`min-w-0 ${className}`}>
    <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-cream/45"><span className="text-cream">{n}</span> / {label}</p>
    <p className="mt-2 font-tanker text-[1.35rem] uppercase leading-none tracking-[0.02em] md:text-[1.55rem]">{title}</p>
    <div className="mt-4">{children}</div>
  </div>
);

/**
 * Footer: black block with wavy edges on cream.
 * Brand + tilted "Ordina ora" + note and mascot, four numbered columns, torn cream note,
 * mega claim revealed line by line (SplitText mask), legal bar.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const claim = useRef<HTMLParagraphElement>(null);
  const { setOpen } = useCart();
  useGSAP(() => {
    if (reduced()) return;
    let split: SplitText | null = null, alive = true;
    document.fonts.ready.then(() => {
      if (!alive || !claim.current) return;
      split = SplitText.create(claim.current, { type: "lines", mask: "lines" });
      gsap.from(split.lines, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.14, scrollTrigger: { trigger: claim.current, start: "top 92%", once: true } });
    });
    gsap.from(".ft-dd", { scale: 0, rotate: -30, duration: 0.7, ease: "back.out(2.2)", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
    gsap.from(".ft-note", { rotate: 22, scale: 0.6, autoAlpha: 0, duration: 0.9, ease: "back.out(1.8)", scrollTrigger: { trigger: ".ft-note", start: "top 92%", once: true } });
    return () => { alive = false; split?.revert(); };
  }, { scope: root });

  return (
    <footer ref={root} className="mt-6">
      <Wave />
      <div className="-my-px relative bg-ink px-5 pb-6 pt-6 text-cream [container-type:inline-size] md:px-10 md:pb-8 md:pt-8 xl:px-16">
        <div className="mx-auto max-w-[1360px]">
          {/* 1. brand / CTA / note */}
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative flex h-[78px] w-[150px] shrink-0 items-center justify-center rounded-[18px] bg-lime md:h-[92px] md:w-[178px]">
                <Doodle name="k-crown-tall" className="absolute left-[7%] top-[4%] w-[20%] -rotate-12 text-ink" />
                <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} className="mt-2 h-auto w-[78%]" />
              </div>
              <p className="font-tanker text-[15px] uppercase leading-[1.08] tracking-[0.03em] md:text-[17px]">Smash burger<br />e patatine.<br />Santa Giulia,<br /><span className="text-lime">Torino.</span></p>
            </div>
            <div className="group/cta flex items-center gap-3 md:gap-5">
              <div className="relative">
                <Doodle name="l-rays-r" className="ft-dd absolute -left-10 -top-7 w-11 rotate-[200deg] text-lime md:-left-14 md:w-14" />
                <button type="button" onClick={() => setOpen(true)} aria-label="Ordina ora, apri il carrello"
                  className="group flex h-16 -rotate-2 items-center gap-4 whitespace-nowrap rounded-[12px] border-[3px] border-ink bg-lime px-6 font-tanker text-[2rem] uppercase leading-none text-ink shadow-[0_0_0_3px_#d6ff4d,6px_7px_0_3px_rgba(214,255,77,.25)] transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] hover:-rotate-[4deg] hover:scale-[1.04] md:h-[88px] md:px-9 md:text-[clamp(2.4rem,1.5rem+1.9vw,3.4rem)]">
                  <span className="pt-[0.1em]">Ordina ora</span><span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </button>
              </div>
              <div className="ml-auto flex items-center md:ml-2">
                <p className="hidden rotate-[-6deg] font-marker text-[1.15rem] leading-[1.05] text-cream sm:block md:text-[1.3rem]">Ritiro in<br />circa 15 min.
                  <Doodle name="l-swoosh" className="mt-1.5 w-[104px] text-lime" />
                </p>
                <span className="ft-mascot sb-thumb relative block h-[82px] w-[82px] shrink-0 md:h-[112px] md:w-[112px]"><Image src="/assets/mascot/thumbs-cream.webp" alt="" fill sizes="112px" className="object-contain" /></span>
              </div>
            </div>
          </div>

          {/* 2. columns + torn note */}
          <div className="relative mt-8 grid grid-cols-2 gap-x-5 gap-y-9 border-t border-cream/15 pt-7 md:mt-10 md:pt-8 lg:grid-cols-[1fr_1.05fr_1.15fr_1fr_200px] lg:gap-x-0">
            <Col n="01" label="Naviga" title="Esplora Sbrano" className="lg:pr-8">
              <ul className="space-y-2">{LINKS.map((l) => <li key={l.href}><a href={l.href} className="group flex items-center gap-3 text-[15px] transition-colors hover:text-lime">{l.label}<Arrow /></a></li>)}</ul>
            </Col>
            <Col n="02" label="Dove siamo" title="Torino, Santa Giulia" className="lg:border-l lg:border-cream/15 lg:px-8">
              <p className="text-[15px] leading-snug">Piazza Santa Giulia<br />10124 Torino<br /><span className="text-cream/60">Quartiere Vanchiglia</span></p>
              <a href={MAPS} target="_blank" rel="noreferrer" className="group mt-4 inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border-2 border-lime px-4 font-tanker text-[15px] uppercase leading-none text-lime transition-colors hover:bg-lime hover:text-ink">
                <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" {...ico} /><circle cx="12" cy="10" r="2.3" {...ico} /></svg>
                <span className="pt-[0.12em]">Apri indicazioni</span><span aria-hidden>↗</span>
              </a>
            </Col>
            <Col n="03" label="Orari" title="Quando hai fame" className="col-span-2 sm:col-span-1 lg:border-l lg:border-cream/15 lg:px-8">
              <table className="w-full text-[14px] leading-snug"><tbody>
                {HOURS.map(([d, h]) => (
                  <tr key={d} className="border-b border-cream/10 last:border-0">
                    <th scope="row" className="w-[42%] py-1.5 pr-3 text-left align-top font-bold">{d}</th>
                    <td className="py-1.5 text-cream/75">{h.replace(/\.$/, "").split(" • ").map((x) => <span key={x} className="block whitespace-nowrap">{x}</span>)}</td>
                  </tr>
                ))}
              </tbody></table>
            </Col>
            <Col n="04" label="Seguici" title="Fuori dal menu" className="lg:border-l lg:border-cream/15 lg:pl-8">
              <ul className="space-y-2.5 text-[15px]">
                {SOCIAL.map((s) => (
                  <li key={s.n}><a href={s.h} target="_blank" rel="noreferrer" className="group flex items-center gap-3 transition-colors hover:text-lime"><svg aria-hidden viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0">{s.i}</svg>{s.n}<Arrow /></a></li>
                ))}
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="group flex items-center gap-3 whitespace-nowrap font-bold text-lime"><svg aria-hidden viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0"><path d="M4 9h16l-1.5 11h-13ZM8.5 9V7a3.5 3.5 0 0 1 7 0v2" {...ico} /></svg>Sgobba con noi<Arrow /></a></li>
              </ul>
              <p className="mt-4 text-[13px] text-cream/50">@sbrano.burger</p>
            </Col>
            {/* torn cream note */}
            <div className="relative flex justify-end sm:col-span-1 lg:items-start lg:justify-center">
              <Doodle name="l-crown" className="ft-dd absolute right-[58%] top-[-10px] w-10 rotate-[-14deg] text-lime lg:right-auto lg:left-5 lg:top-[-16px] lg:w-12" />
              <div className="ft-note relative mt-2 aspect-[1.53] w-[170px] rotate-[7deg] drop-shadow-[0_14px_16px_rgba(0,0,0,.5)] lg:mt-8 lg:w-[196px]">
                <Image src="/assets/promo/torn-cream.webp" alt="" fill sizes="200px" className="object-contain" />
                <p className="absolute inset-x-[12%] top-[36%] font-marker text-[15px] uppercase leading-[1.02] text-ink lg:text-[17px]">Burger people<br />good mood.</p>
                <svg aria-hidden viewBox="0 0 30 30" className="absolute bottom-[9%] right-[9%] w-[15%] text-ink"><circle cx="15" cy="15" r="12" {...ico} strokeWidth={2.2} /><circle cx="11" cy="12.5" r="1.3" fill="currentColor" /><circle cx="19" cy="12.5" r="1.3" fill="currentColor" /><path d="M9.5 18c1.4 2.2 3.3 3.2 5.5 3.2s4.1-1 5.5-3.2" {...ico} strokeWidth={2.2} /></svg>
              </div>
            </div>
          </div>

          {/* 3. mega claim */}
          <div className="relative mt-10 md:mt-12">
            <p ref={claim} className="font-display uppercase leading-[0.84] text-lime" style={{ fontSize: "min(17.2cqw, 236px)" }} aria-label="Fame brutta. Prezzi giusti.">
              <span className="block whitespace-nowrap">Fame brutta.</span>
              <span className="block whitespace-nowrap text-cream">Prezzi giusti.</span>
            </p>
            <Doodle name="l-crown-burst" className="ft-dd absolute right-[1%] top-[-6%] w-[9%] rotate-[12deg] text-lime" />
            <Doodle name="l-drip" className="ft-dd absolute left-[61.5%] top-[37%] w-[2.6%] text-lime" />
          </div>

          {/* 4. legal */}
          <div className="mt-6 flex flex-col gap-1.5 border-t border-cream/12 pt-4 text-[11px] text-cream/50 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-5 md:text-xs">
            <p>SBRANO © 2026 · Smash burger, Torino. Brand di fantasia, concept demo ambientato in Piazza Santa Giulia.</p>
            <p>Concept demo di <a href="https://michelbranche.it" className="sb-uline font-bold text-lime">Michel Branche</a></p>
          </div>
        </div>
      </div>
      <Wave flip />
    </footer>
  );
}
