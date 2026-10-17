"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import PillButton from "../ui/PillButton";
import CartButton from "../cart/CartButton";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";
import { onSiteReady } from "../Preloader";
import { MENU, euro } from "@/lib/data";

export const LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#builder", label: "Builder" },
  { href: "#filiera", label: "Filiera" },
  { href: "#locale", label: "Il locale" },
  { href: "#dove", label: "Dove siamo" },
];
/** links shown inside the top notch (wireframe: 4 pills); Builder stays in the mobile menu and compact bar */
const NOTCH = LINKS.filter((l) => l.href !== "#builder");

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { add } = useCart();
  const mini = useRef<HTMLDivElement>(null);
  const star = MENU[0];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // intro waits for the preloader (fonts + hero image ready) so nothing pops in half-loaded
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(".h-nav > *", { y: -30, opacity: 0, duration: 0.8, stagger: 0.06 })
        .from(".h-line", { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.12 }, 0.1)
        .from(".h-blob", { scale: 0.6, rotate: -10, opacity: 0, duration: 1.3, ease: "back.out(1.4)" }, 0.2)
        .from(".h-burger", { yPercent: 40, xPercent: 20, rotate: 18, scale: 0.5, opacity: 0, duration: 1.4, ease: "elastic.out(1, 0.6)" }, 0.3)
        .from(".h-shadow", { scaleX: 0.2, opacity: 0, duration: 1.2 }, 0.45)
        .from(".h-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.5)
        .from(".h-badge", { scale: 0, rotate: -180, duration: 1.1, ease: "back.out(1.6)" }, 0.8)
        .from(".h-mini", { y: 60, opacity: 0, duration: 0.8 }, 1.1);
      const off = onSiteReady(() => tl.play());
      // breathing
      gsap.to(".h-burger-breath", { scale: 1.035, y: -10, rotate: -1.2, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".h-shadow-breath", { scaleX: 0.92, opacity: 0.55, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      // scroll parallax
      // Parallax lives on its OWN wrapper (.h-burger-par / .h-title-par). Before, it targeted .h-burger,
      // the same element the intro animates with from(yPercent:40): the scrub tween recorded the intro's
      // start value (yPercent 40) and on the first scroll pixel snapped the burger ~100px down.
      gsap.fromTo(".h-burger-par", { yPercent: 0, rotate: 0 }, { yPercent: 18, rotate: 6, ease: "none", immediateRender: false, scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.4 } });
      gsap.fromTo(".h-title-par", { yPercent: 0 }, { yPercent: -20, ease: "none", immediateRender: false, scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.4 } });
      // mouse tilt
      const qx = gsap.quickTo(".h-burger-tilt", "x", { duration: 0.8, ease: "power3" });
      const qy = gsap.quickTo(".h-burger-tilt", "y", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => { qx((e.clientX / innerWidth - 0.5) * 30); qy((e.clientY / innerHeight - 0.5) * 20); };
      // pointer tilt only on real mouse devices
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (fine) window.addEventListener("pointermove", move, { passive: true });
      return () => { off(); window.removeEventListener("pointermove", move); };
    });
    gsap.set(".float-bar", { yPercent: -160 });
    // floating bar shows after hero
    ScrollTrigger.create({
      trigger: root.current, start: "bottom 80px",
      onEnter: () => gsap.to(".float-bar", { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }),
      onLeaveBack: () => gsap.to(".float-bar", { yPercent: -160, autoAlpha: 0, duration: 0.4, ease: "power2.in" }),
    });
  }, { scope: root });

  const addStar = () => flyToCart(mini.current, star.img, () => add({ id: star.id, name: star.name, price: star.price, img: star.img }));

  return (
    <header ref={root} className="relative p-2 md:p-3">
      {/* floating bar (fixed) */}
      <div data-cart-wrap className="float-bar invisible fixed left-1/2 top-3 z-50 flex w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-full bg-ink p-1.5 pl-3 opacity-0 shadow-2xl ring-1 ring-cream/15">
        <a href="#top" className="relative flex h-11 items-center rounded-full bg-lime px-4 md:h-12 md:px-5" aria-label="SBRANO, torna su">
          {/* compact state: bold plain wordmark (no tagline / mascot) so it stays legible at pill height */}
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="140px" className="h-7 w-auto md:h-8" />
        </a>
        <nav className="hidden gap-1 md:flex">{LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-cream/80 transition-colors hover:bg-cream/10 hover:text-lime">{l.label}</a>)}</nav>
        <CartButton />
      </div>

      {/* 01 FRAME: rounded lime frame, nav sits in a diagonal notch cut into the top edge */}
      <div id="top" className="grain relative overflow-hidden rounded-[28px] bg-lime md:rounded-[40px]">
        <svg className="pointer-events-none absolute left-1/2 top-0 z-10 hidden h-[64px] w-[600px] -translate-x-1/2 lg:block" viewBox="0 0 600 64" aria-hidden>
          <path d="M0 0 H600 C584 0 574 4 566 14 L536 52 C529 60 520 64 506 64 H94 C80 64 71 60 64 52 L34 14 C26 4 16 0 0 0 Z" fill="#F6EBD7" />
        </svg>
        <nav className="h-nav relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-3 pt-3 md:px-4 lg:pt-[10px]" aria-label="Principale">
          <a href="#top" className="relative flex h-12 items-center rounded-full bg-cream px-4 md:h-[52px] md:px-5" aria-label="SBRANO home">
            {/* bold wordmark (no mascot), same as the compact bar, sized to fill the pill */}
            <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} priority sizes="160px" className="h-8 w-auto md:h-9" />
          </a>
          <ul className="absolute left-1/2 top-[14px] hidden -translate-x-1/2 gap-2 lg:flex">
            {NOTCH.map((l) => (
              <li key={l.href}><a href={l.href} className="flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-bold uppercase tracking-wider text-cream transition-colors hover:bg-lime hover:text-ink hover:ring-2 hover:ring-ink">{l.label}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <CartButton variant="dark" />
            <a href="#menu" className="group hidden items-center gap-1 lg:inline-flex" aria-label="Ordina">
              <span className="flex h-12 items-center rounded-full bg-ink px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-lime">Ordina</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-lg font-bold text-lime transition-transform duration-500 ease-[cubic-bezier(.2,1.6,.4,1)] group-hover:rotate-45">↗</span>
            </a>
            <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-ink lg:hidden">
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        <div className={`relative z-20 grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="min-h-0 space-y-1 px-4">
            {LINKS.map((l) => <li key={l.href}><a onClick={() => setMenuOpen(false)} href={l.href} className="block py-2 font-display text-4xl uppercase text-ink">{l.label}</a></li>)}
            <li className="h-3" />
          </ul>
        </div>

        {/* 02 HERO */}
        <section className="relative" aria-label="SBRANO">
          <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 px-5 pb-24 pt-8 md:px-10 md:pb-28 md:pt-12 lg:min-h-[min(820px,calc(100svh-96px))] lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-6 xl:gap-16 2xl:px-16">
            <div className="h-title h-title-par relative z-10 flex flex-col">
              <h1 className="font-display uppercase leading-[0.84] text-ink">
                {/* L1: solid filled pill */}
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="h-line inline-block whitespace-nowrap rounded-full bg-ink px-[0.32em] pb-[0.04em] pt-[0.14em] text-[10.4vw] text-lime md:text-[clamp(56px,7vw,112px)] lg:text-[clamp(56px,6.1vw,104px)]">Fame brutta.</span>
                </span>
                {/* L2: offset right, dashed outline pill ending with an arrow */}
                <span className="mt-2 block overflow-visible pb-[0.06em] pl-[9%] md:mt-3 md:pl-[14%]">
                  <span className="h-line inline-flex items-center gap-[0.22em] whitespace-nowrap rounded-full border-[3px] border-dashed border-ink px-[0.32em] pb-[0.04em] pt-[0.14em] text-[9.2vw] md:border-4 md:text-[clamp(48px,6vw,96px)] lg:text-[clamp(48px,5.3vw,90px)]">
                    Prezzi giusti
                    <svg viewBox="0 0 60 40" className="h-[0.62em] w-[0.9em] shrink-0" aria-hidden><path d="M4 20 H50 M34 5 L52 20 L34 35" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              </h1>
              {/* sub / payoff: 2 lines */}
              <p className="h-fade mt-8 max-w-[36rem] text-lg font-medium leading-snug md:text-[19px] lg:max-w-[clamp(34rem,38vw,42rem)] lg:text-[clamp(18px,1.25vw,22px)]">
                Smash burger, pollo che scrocchia e patatine tagliate a mano.<br className="hidden md:block" /> In Piazza Santa Giulia, Vanchiglia. Zero fronzoli, tanto gusto.
              </p>
              <div className="h-fade mt-8 flex flex-wrap items-center gap-3">
                <PillButton href="#menu" variant="dark">Ordina ora</PillButton>
                <a href="#menu" className="flex h-12 items-center rounded-full border-2 border-ink px-6 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-ink hover:text-lime md:h-14 md:px-7">Vedi menu</a>
              </div>
              <ul className="h-fade mt-6 flex flex-wrap gap-2" aria-label="In breve">
                {["Torino", "Smash", "Take away"].map((t) => <li key={t} className="rounded-full bg-ink/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">{t}</li>)}
              </ul>
            </div>

            {/* burger side: everything is positioned relative to the BLOB, which keeps a fixed (near round) aspect
                and a clamp-based size, so wide screens can't stretch it into an oval or scatter badge/card */}
            <div className="relative mt-10 flex items-center justify-center pb-10 md:pb-12 lg:mt-0 lg:pb-0">
              <div className="relative aspect-[500/520] w-[min(84vw,440px)] lg:w-[min(clamp(400px,34vw,600px),calc((100svh-230px)*0.96))]">
                <div className="h-shadow absolute bottom-[-4%] left-1/2 h-[7%] w-[70%] -translate-x-1/2">
                  <div className="h-shadow-breath h-full w-full rounded-[50%] bg-ink/35 blur-md" />
                </div>
                <svg className="h-blob absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 500 520" aria-hidden>
                  <path d="M252 14 C372 8 474 76 482 204 C490 330 444 448 330 494 C236 530 112 510 56 428 C2 350 12 214 50 136 C88 58 160 20 252 14 Z" fill="#F6EBD7" />
                  <path d="M252 14 C372 8 474 76 482 204 C490 330 444 448 330 494 C236 530 112 510 56 428 C2 350 12 214 50 136 C88 58 160 20 252 14 Z" fill="none" stroke="#111" strokeWidth="3" strokeDasharray="12 10" vectorEffect="non-scaling-stroke" transform="translate(250 262) scale(1.04) translate(-250 -262)" />
                </svg>
                <div className="h-burger absolute inset-x-[-14%] bottom-[12%] top-[4%] will-change-transform">
                  <div className="h-burger-par h-full w-full will-change-transform"><div className="h-burger-tilt h-full w-full">
                    <div className="h-burger-breath relative h-full w-full will-change-transform">
                      <Image src="/assets/menu/sbranatore.webp" alt="Sbranatore: doppio smash con cheddar, bacon, cetrioli e cipolla rossa" fill priority sizes="(min-width:1024px) min(780px, 46vw), 100vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]" />
                    </div></div>
                  </div>
                </div>
                {/* rotating badge, overlapping the blob bottom-left (size in % of the blob) */}
                <div className="h-badge absolute bottom-[4%] left-[-8%] z-10 aspect-square w-[27%]">
                  <div className="relative h-full w-full rounded-full bg-ink">
                    <svg viewBox="0 0 200 200" className="animate-spin-slow absolute inset-0 h-full w-full" aria-hidden>
                      <defs><path id="badgeCircle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
                      <text className="font-display" fontSize="23" letterSpacing="3" fill="#D6FF4D"><textPath href="#badgeCircle">SMASH • TORINO • VANCHIGLIA • </textPath></text>
                    </svg>
                    <span className="absolute inset-0 m-auto flex h-[36%] w-[36%] items-center justify-center rounded-full bg-lime text-[clamp(16px,1.4vw,26px)]">★</span>
                  </div>
                </div>
                {/* mini product card, anchored to the blob bottom-right */}
                <div ref={mini} className="h-mini absolute bottom-[-9%] right-[-6%] z-10 flex w-[252px] items-center gap-2.5 rounded-[22px] bg-ink p-2.5 text-cream shadow-xl md:w-[290px] md:gap-3 md:rounded-[24px] md:p-3 lg:bottom-[0%] lg:right-[-14%]">
                  <div className="relative h-14 w-16 shrink-0 rounded-2xl bg-lime md:h-16 md:w-20">
                    <Image src={star.img} alt="" fill sizes="80px" className="object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-cream/60">Il più sbranato</p>
                    <p className="truncate font-bold">{star.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-lime px-2.5 py-0.5 text-sm font-bold tabular-nums text-ink">{euro(star.price)}</span>
                  </div>
                  <button onClick={addStar} aria-label={`Aggiungi ${star.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-2xl text-ink transition-transform hover:rotate-90 md:h-11 md:w-11">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 03 wavy divider: the frame bottom melts into the page, then the ribbon */}
        <svg className="pointer-events-none absolute bottom-[-1px] left-0 h-[56px] w-full md:h-[80px]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <path d="M0 40 C 120 0, 240 0, 360 40 S 600 80, 720 40 S 960 0, 1080 40 S 1320 80, 1440 40 L1440 80 L0 80 Z" fill="#F6EBD7" />
        </svg>
      </div>
    </header>
  );
}
