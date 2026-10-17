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
        .from(".h-logo", { scale: 0.6, rotate: -8, opacity: 0, duration: 1, ease: "back.out(2)" }, 0.15)
        .from(".h-burger", { yPercent: 40, xPercent: 20, rotate: 18, scale: 0.5, opacity: 0, duration: 1.4, ease: "elastic.out(1, 0.6)" }, 0.3)
        .from(".h-shadow", { scaleX: 0.2, opacity: 0, duration: 1.2 }, 0.45)
        .from(".h-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.5)
        .from(".h-badge", { scale: 0, rotate: -180, duration: 1.1, ease: "back.out(1.6)" }, 0.8)
        .fromTo(".h-arrow-path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.25 }, 1.0)
        .from(".h-note", { opacity: 0, rotate: -12, scale: 0.7, duration: 0.6, ease: "back.out(2)" }, 1.0)
        .from(".h-mini", { y: 60, opacity: 0, duration: 0.8 }, 1.1);
      const off = onSiteReady(() => tl.play());
      // breathing
      gsap.to(".h-burger-breath", { scale: 1.035, y: -10, rotate: -1.2, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".h-shadow-breath", { scaleX: 0.92, opacity: 0.55, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      // scroll parallax
      gsap.to(".h-burger", { yPercent: 18, rotate: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".h-title", { yPercent: -20, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
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
        <a href="#top" className="relative flex h-10 items-center rounded-full bg-lime px-4 md:h-11 md:px-5" aria-label="SBRANO, torna su">
          {/* compact state: bold plain wordmark (no tagline / mascot) so it stays legible at pill height */}
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="120px" className="h-6 w-auto md:h-7" />
        </a>
        <nav className="hidden gap-1 md:flex">{LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-cream/80 transition-colors hover:bg-cream/10 hover:text-lime">{l.label}</a>)}</nav>
        <CartButton />
      </div>

      <div id="top" className="relative rounded-[28px] bg-ink p-2 md:rounded-[40px] md:p-3">
        {/* NAV */}
        <nav className="h-nav relative z-20 flex h-16 items-center justify-between px-1 md:h-20 md:px-3" aria-label="Principale">
          <a href="#top" className="relative block h-12 w-32 rounded-full bg-lime md:h-14 md:w-36" aria-label="SBRANO home">
            <Image src="/assets/brand/logo-mascot.webp" alt="SBRANO" fill priority sizes="144px" className="object-contain px-3 py-0.5" />
          </a>
          <ul className="absolute left-1/2 hidden -translate-x-1/2 gap-1 rounded-full bg-ink-3 p-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href} className="block rounded-full px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider text-cream/80 transition-colors hover:bg-lime hover:text-ink">{l.label}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <CartButton />
            <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-cream lg:hidden">
              <span className={`h-0.5 w-5 bg-ink transition-transform ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-ink transition-transform ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        <div className={`grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="min-h-0 space-y-1 px-1">
            {LINKS.map((l) => <li key={l.href}><a onClick={() => setMenuOpen(false)} href={l.href} className="block py-2 font-display text-4xl uppercase text-cream hover:text-lime">{l.label}</a></li>)}
            <li className="h-3" />
          </ul>
        </div>

        {/* HERO PANEL */}
        <section className="grain relative overflow-hidden rounded-[22px] bg-lime md:rounded-[30px]" aria-label="SBRANO">
          <div className="relative grid min-h-[760px] grid-cols-1 px-5 pb-28 pt-8 md:min-h-[min(860px,calc(100svh-110px))] md:px-10 md:pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-32">
            <div className="h-title relative z-10 flex flex-col">
              <div className="h-logo relative mb-5 aspect-[1800/673] w-[220px] md:w-[300px]">
                <Image src="/assets/brand/logo.webp" alt="SBRANO, burger fries good mood" fill priority sizes="300px" className="object-contain" />
              </div>
              <h1 className="font-display uppercase leading-[0.84] text-ink">
                <span className="block overflow-hidden pb-[0.05em]"><span className="h-line block whitespace-nowrap text-[12.6vw] md:text-[clamp(60px,7.6vw,120px)] lg:text-[clamp(60px,6.9vw,118px)]">Fame brutta.</span></span>
                <span className="block overflow-hidden pb-[0.05em] pl-[7%]">
                  <span className="h-line inline-flex items-center gap-3 rounded-full bg-ink px-5 pb-1 pt-2 whitespace-nowrap text-[10vw] text-lime md:px-8 md:text-[clamp(48px,6vw,96px)] lg:text-[clamp(48px,5.4vw,92px)]">
                    Prezzi giusti.
                  </span>
                </span>
              </h1>
              <p className="h-fade mt-6 max-w-md text-lg font-medium leading-snug md:text-xl">
                Smash burger, pollo che scrocchia e patatine tagliate a mano. In Piazza Santa Giulia, Vanchiglia. Zero fronzoli, tanto gusto.
              </p>
              <p className="h-fade mt-3 text-xs font-bold uppercase tracking-[0.3em]">Burger • Fries • Good mood</p>
              <div className="h-fade mt-7 flex flex-wrap gap-3">
                <PillButton href="#menu" variant="dark">Ordina ora</PillButton>
                <PillButton href="#menu" variant="cream" icon="↓">Guarda il menu</PillButton>
              </div>
              {/* tags */}
            <div className="h-fade mt-6 hidden flex-wrap gap-2 md:flex">
              {["Torino", "Smash", "Take away", "Aperti fino all'01"].map((t) => <span key={t} className="pill-label border-2 border-ink">{t}</span>)}
            </div>
            </div>

            {/* burger side */}
            <div className="relative mt-8 h-[340px] sm:h-[440px] lg:mt-0 lg:h-auto">
              <div className="h-shadow absolute bottom-[8%] left-1/2 h-10 w-[70%] -translate-x-1/2 lg:bottom-[14%]">
                <div className="h-shadow-breath h-full w-full rounded-[50%] bg-ink/30 blur-md" />
              </div>
              <div className="h-burger absolute will-change-transform inset-x-[-6%] bottom-[10%] top-0 lg:inset-x-[-12%] lg:bottom-[16%] lg:top-[4%]">
                <div className="h-burger-tilt h-full w-full">
                  <div className="h-burger-breath relative h-full w-full will-change-transform">
                    <Image src="/assets/menu/sbranatore.webp" alt="Sbranatore: doppio smash con cheddar, bacon, cetrioli e cipolla rossa" fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]" />
                  </div>
                </div>
              </div>
              {/* hand note + arrow */}
              <div className="h-note absolute -top-2 right-0 rotate-[-6deg] font-display text-xl uppercase leading-none md:text-2xl lg:right-[2%] lg:top-[2%]">
                doppio smash,<br />zero rimpianti
              </div>
              <svg className="pointer-events-none absolute right-[16%] top-[9%] h-24 w-28 md:h-32 md:w-36 lg:right-[18%] lg:top-[11%]" viewBox="0 0 140 120" fill="none" aria-hidden>
                <path className="h-arrow-path" pathLength={1} strokeDasharray="1" d="M128 6C112 40 92 50 70 52C44 54 30 66 22 104" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                <path className="h-arrow-path" pathLength={1} strokeDasharray="1" d="M8 86C14 94 18 100 22 106C30 100 36 94 44 90" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* rotating badge */}
              <div className="h-badge absolute bottom-[4%] left-[2%] h-28 w-28 md:h-36 md:w-36 lg:bottom-[12%] lg:left-[-6%]">
                <div className="relative h-full w-full rounded-full bg-ink">
                  <svg viewBox="0 0 200 200" className="animate-spin-slow absolute inset-0 h-full w-full" aria-hidden>
                    <defs><path id="badgeCircle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
                    <text className="font-display" fontSize="23" letterSpacing="3" fill="#D6FF4D"><textPath href="#badgeCircle">SMASH • TORINO • VANCHIGLIA • </textPath></text>
                  </svg>
                  <span className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime text-xl md:h-14 md:w-14">★</span>
                </div>
              </div>
            </div>

            {/* mini product card */}
            <div ref={mini} className="h-mini absolute bottom-20 right-4 z-10 hidden w-[280px] items-center gap-3 rounded-[24px] bg-ink p-3 text-cream shadow-xl md:right-8 md:flex">
              <div className="relative h-16 w-20 shrink-0 rounded-2xl bg-lime">
                <Image src={star.img} alt="" fill sizes="80px" className="object-contain p-1" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-cream/60">Il più sbranato</p>
                <p className="font-bold">{star.name}</p>
                <p className="tabular-nums text-lime">{euro(star.price)}</p>
              </div>
              <button onClick={addStar} aria-label={`Aggiungi ${star.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-2xl text-ink transition-transform hover:rotate-90">+</button>
            </div>
          </div>
          {/* wavy bottom edge */}
          <svg className="absolute bottom-[-1px] left-0 h-[60px] w-full md:h-[80px]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
            <path d="M0 40 C 120 0, 240 0, 360 40 S 600 80, 720 40 S 960 0, 1080 40 S 1320 80, 1440 40 L1440 80 L0 80 Z" fill="#111" />
          </svg>
        </section>
      </div>
    </header>
  );
}
