"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import PillButton from "../ui/PillButton";
import CartButton from "../cart/CartButton";
import { useCart } from "../cart/CartProvider";
import { flyToCart, burst } from "@/lib/fly";
import { useDragStickers } from "@/lib/drag";
import EllipseCta from "../ui/EllipseCta";
import { onSiteReady } from "../Preloader";
import { MENU, euro } from "@/lib/data";

export const LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#builder", label: "Builder" },
  { href: "#filiera", label: "Filiera" },
  { href: "#locale", label: "Il locale" },
  { href: "#dove", label: "Dove siamo" },
];
/** fake delivery marks (demo): brand colours + simple glyphs, no third-party logos or links */
const DELIVERY = [
  { id: "deliveroo", name: "Deliveroo", bg: "#00CCBC", fg: "#fff", cls: "lowercase tracking-[-0.02em]",
    icon: <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor"><path d="M15.6 2.5 14.4 9 12 3.8 6.9 5l1.9 8.2-2.3 3.4 1.6 4.9 8.9-2 2-11.1-1.4-5.9Zm-2.2 12.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-3.3-1.3a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z" /></svg> },
  { id: "glovo", name: "Glovo", bg: "#FFC244", fg: "#00A082", cls: "tracking-[-0.01em]",
    icon: <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 4.6 5.3 11.3 6.2 12.5a1 1 0 0 0 1.6 0C13.7 20.3 19 13.6 19 9a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /></svg> },
  { id: "justeat", name: "Just Eat", bg: "#FF8000", fg: "#fff", cls: "tracking-[-0.01em]",
    icon: <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor"><path d="M12 3 2.5 11h2.7v9.5h5.3v-6h3v6h5.3V11h2.7L12 3Z" /></svg> },
];

/** day bar: rotates three burgers every 4s, each links to its spot (menu carousel or the monthly special) */
const DAY = [
  { n: "Il Diavolo di Vanchiglia", href: "#proposta", id: "" },
  { n: "Sbranatore", href: "#menu", id: "sbranatore" },
  { n: "Mordi e Fuggi", href: "#menu", id: "mordi-e-fuggi" },
];
export function goMenuItem(id: string) {
  if (id) window.dispatchEvent(new CustomEvent("sbrano:menu-goto", { detail: id }));
}

function DayBar() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1);
  useEffect(() => {
    const t = setInterval(() => { if (document.hidden) return; setI((c) => { setPrev(c); return (c + 1) % DAY.length; }); }, 4000);
    return () => clearInterval(t);
  }, []);
  const d = DAY[i];
  return (
    <a href={d.href} onClick={() => goMenuItem(d.id)} data-daybar
      className="group relative z-20 flex h-8 items-center justify-center gap-[0.35em] overflow-hidden whitespace-nowrap px-3 font-tanker text-[clamp(0.8rem,0.7rem+0.5vw,1.05rem)] uppercase leading-none text-ink md:h-9">
      <span className="pt-[0.12em]">Oggi sbrana di brutto:</span>
      <span className="sb-day-rot pt-[0.12em]" aria-live="polite">
        {DAY.map((x, k) => <span key={x.n} data-on={k === i ? "1" : k === prev ? "-1" : "0"} aria-hidden={k !== i}>{x.n}.</span>)}
      </span>
      <span className="relative ml-[0.2em] pt-[0.12em]">
        Ordinalo
        <svg aria-hidden viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute -bottom-[3px] left-0 h-[5px] w-full text-ink transition-transform duration-300 group-hover:scale-x-110"><path d="M2 6 C 30 2, 70 9, 118 4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>
      </span>
    </a>
  );
}

/** links shown inside the top notch (wireframe: 4 pills); Builder stays in the mobile menu and compact bar */
const NOTCH = LINKS.filter((l) => l.href !== "#builder");

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { add, announce } = useCart();
  const mini = useRef<HTMLDivElement>(null);
  const star = MENU[0];
  const [egg, setEgg] = useState(0);
  const dragInit = useDragStickers(root, "#top");
  useEffect(() => dragInit(), [dragInit]);
  /** a sticker that was just dragged must not also fire its click */
  const wasDragged = (e: React.MouseEvent) => {
    const el = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-drag]");
    if (el?.dataset.dragged) { delete el.dataset.dragged; e.preventDefault(); return true; }
    return false;
  };
  const poke = (e: React.MouseEvent) => {
    if (wasDragged(e)) return;
    setEgg((n) => n + 1);
    burst(e.clientX, e.clientY, 12);
  };

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
    <header ref={root} className="relative px-2 pb-2 md:px-3 md:pb-3">
      <DayBar />
      {/* floating bar (fixed) */}
      <div data-cart-wrap className="float-bar invisible fixed left-1/2 top-3 z-50 flex w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-full bg-ink p-1.5 pl-3 opacity-0 shadow-2xl ring-1 ring-cream/15">
        <a href="#top" className="sb-lift-tilt sb-lift relative flex h-11 items-center rounded-full bg-lime px-4 md:h-12 md:px-5" aria-label="SBRANO, torna su">
          {/* compact state: bold plain wordmark (no tagline / mascot) so it stays legible at pill height */}
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="140px" className="h-7 w-auto md:h-8" />
        </a>
        <nav className="hidden gap-1 md:flex">{LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href} className="sb-lift rounded-full px-3 pb-1.5 pt-2 font-tanker text-[16px] uppercase leading-none tracking-[0.03em] text-cream/85 transition-colors hover:bg-cream/10 hover:text-lime">{l.label}</a>)}</nav>
        <CartButton />
      </div>

      {/* 01 FRAME: rounded lime frame, nav sits in a diagonal notch cut into the top edge */}
      <div id="top" className="grain relative overflow-hidden rounded-[28px] bg-lime md:rounded-[40px]">
        <svg className="pointer-events-none absolute left-1/2 top-0 z-10 hidden h-[64px] w-[600px] -translate-x-1/2 lg:block" viewBox="0 0 600 64" aria-hidden>
          <path d="M0 0 H600 C584 0 574 4 566 14 L536 52 C529 60 520 64 506 64 H94 C80 64 71 60 64 52 L34 14 C26 4 16 0 0 0 Z" fill="#F6EBD7" />
        </svg>
        <nav className="h-nav relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-3 pt-3 md:px-4 lg:pt-[10px]" aria-label="Principale">
          <a href="#top" className="sb-lift-tilt sb-lift relative flex h-12 items-center rounded-full bg-cream px-4 md:h-[52px] md:px-5" aria-label="SBRANO home">
            {/* bold wordmark (no mascot), same as the compact bar, sized to fill the pill */}
            <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} priority sizes="160px" className="h-8 w-auto md:h-9" />
          </a>
          <ul className="absolute left-1/2 top-[14px] hidden -translate-x-1/2 gap-2 lg:flex">
            {NOTCH.map((l) => (
              <li key={l.href}><a href={l.href} className="sb-lift-tilt sb-lift flex h-10 items-center rounded-full bg-ink px-5 pt-[3px] font-tanker text-[18px] uppercase leading-none tracking-[0.03em] text-cream transition-colors hover:bg-lime hover:text-ink hover:ring-2 hover:ring-ink">{l.label}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <CartButton variant="dark" />
            <span className="hidden lg:block"><EllipseCta href="#menu" className="text-ink" label="Ordina">Ordina!</EllipseCta></span>
            <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-ink lg:hidden">
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        <div className={`relative z-20 grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="min-h-0 space-y-1 px-4">
            {LINKS.map((l) => <li key={l.href}><a onClick={() => setMenuOpen(false)} href={l.href} className="sb-uline py-1.5 font-tanker text-5xl uppercase leading-none text-ink">{l.label}</a></li>)}
            <li className="h-3" />
          </ul>
        </div>

        {/* 02 HERO */}
        <section className="relative" aria-label="SBRANO">
          <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 px-5 pb-24 pt-6 md:px-10 md:pb-28 md:pt-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-x-10 lg:pb-28 lg:pt-4 xl:gap-x-16 2xl:px-16">
            {/* claim: the loudest thing on the page, sized by viewport height but capped by width (see .h-claim) */}
            <div className="h-title-par relative z-10 lg:col-span-2">
              <h1 className="h-claim font-display uppercase text-ink">
                <span className="block overflow-hidden pb-[0.05em]"><span className="h-line block">Fame brutta.</span></span>
                <span className="block overflow-hidden pb-[0.05em]"><span className="h-line block">Prezzi giusti.</span></span>
              </h1>
              <div data-drag className="absolute right-[1%] top-[2%] z-20 hidden w-[clamp(110px,10vw,170px)] lg:block">
                <div className="sb-stk" style={{ ["--r" as string]: "10deg" } as React.CSSProperties}>
                  <Image src="/assets/stickers/vanchiglia.webp" alt="100% Vanchiglia" width={300} height={301} sizes="170px" draggable={false} className="h-auto w-full" />
                </div>
              </div>
            </div>
            <div className="h-title relative z-10 flex flex-col">
              {/* sub / payoff */}
              <p className="h-fade mt-6 max-w-[34rem] text-lg font-medium leading-snug md:mt-8 md:text-[19px] lg:mt-2 lg:text-[clamp(1.125rem,0.9rem+0.45vw,1.4rem)]">
                Smash burger, pollo croccante e patatine. <span className="whitespace-nowrap">Piazza Santa Giulia, Torino.</span>
              </p>
              <div className="h-fade mt-7 flex flex-wrap items-center gap-3">
                <PillButton href="#menu" variant="dark">Ordina ora</PillButton>
                <a href="#menu" data-mag="0.18" className="flex h-12 items-center rounded-full border-2 border-ink px-6 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-ink hover:text-lime md:h-14 md:px-7">Vedi menu</a>
              </div>
              <p className="h-fade mt-6 flex flex-wrap items-center gap-x-2.5 font-tanker text-[clamp(1.05rem,0.95rem+0.4vw,1.35rem)] uppercase leading-none" aria-label="In breve: Torino, Smash, Take away">
                <span>Torino</span><span aria-hidden>✶</span><span>Smash</span><span aria-hidden>✶</span><span>Take away</span>
              </p>
              {/* delivery (demo only: no real links) */}
              <div className="h-fade mt-6 flex flex-wrap items-center gap-x-3 gap-y-2.5" data-delivery-row>
                <p className="font-tanker text-[15px] uppercase leading-none tracking-[0.04em] text-ink/70">Oppure a domicilio</p>
<ul className="flex flex-wrap gap-1.5 md:gap-2">
                  {DELIVERY.map((d) => (
                    <li key={d.id}>
                      <a href="#" data-delivery={d.id} aria-label={`Ordina su ${d.name} (demo, nessun link reale)`}
                        onClick={(e) => { e.preventDefault(); announce({ title: "Solo demo", sub: `Qui partirebbe ${d.name}. Nella demo nessun ordine vero.`, img: "/assets/mascot/running.webp", cta: false }); }}
                        className="sb-lift-tilt sb-lift group flex h-9 items-center gap-1.5 rounded-full border-2 border-ink px-3 text-[13px] min-[400px]:h-10 min-[400px]:px-3.5 min-[400px]:text-[14px] md:gap-2 font-black leading-none shadow-[3px_3px_0_#111] transition-shadow hover:shadow-[5px_5px_0_#111] md:h-11 md:px-4"
                        style={{ background: d.bg, color: d.fg }}>
                        <span aria-hidden className="transition-transform duration-300 ease-[cubic-bezier(.3,1.8,.5,1)] group-hover:-rotate-12 group-hover:scale-110">{d.icon}</span>
                        <span className={d.cls}>{d.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* burger side: everything is positioned relative to the BLOB, which keeps a fixed (near round) aspect
                and a clamp-based size, so wide screens can't stretch it into an oval or scatter badge/card */}
            <div className="relative mt-10 flex items-center justify-center pb-10 md:pb-12 lg:mt-0 lg:pb-0">
              <div className="relative aspect-[500/520] w-[min(84vw,440px)] lg:w-[clamp(340px,30vw,560px)]">
                {/* draggable stickers (desktop mouse only; on touch they are plain taps) */}
                <div data-drag className="absolute left-[-4%] top-[-6%] z-20 w-[30%] lg:left-[-20%] lg:top-[-2%] lg:w-[32%]">
                  <button type="button" onClick={poke} data-egg={egg} aria-label="Mascotte SBRANO: toccami, non mordo" className="sb-stk relative block w-full" style={{ ["--r" as string]: "-8deg" } as React.CSSProperties}>
                    <Image src={egg % 2 ? "/assets/stickers/mascot-crown.webp" : "/assets/stickers/mascot-wave.webp"} alt="" width={300} height={egg % 2 ? 344 : 276} sizes="180px" draggable={false} className="h-auto w-full" />
                    <span className="sb-tag absolute -bottom-[14%] left-1/2 -translate-x-1/2 bg-lime font-tanker text-[clamp(11px,1vw,16px)] uppercase text-ink">{egg === 0 ? "Toccami, non mordo" : egg % 2 ? "Ahia. Un po’ mordo." : "Ancora? Ok."}</span>
                  </button>
                </div>
                <div data-drag className="absolute right-[-2%] top-[2%] z-20 lg:right-[-12%] lg:top-[8%]">
                  <a href="#builder" onClick={wasDragged} className="sb-stk sb-tag bg-ink font-tanker text-[clamp(13px,1.2vw,21px)] uppercase text-lime" style={{ ["--r" as string]: "7deg" } as React.CSSProperties}>
                    Costruisci il<br />tuo mostro →
                  </a>
                </div>
                <div data-drag className="absolute left-[-14%] top-[50%] z-20 hidden md:block">
                  <a href="#menu" onClick={wasDragged} className="sb-stk sb-tag bg-cream font-marker text-[clamp(16px,1.4vw,24px)] text-ink" style={{ ["--r" as string]: "-6deg" } as React.CSSProperties}>
                    Menu →
                  </a>
                </div>
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
                      <Image src="/assets/menu/sbranatore.webp" alt="Sbranatore: doppio smash burger con cheddar, bacon, cetrioli e cipolla rossa" fill priority sizes="(min-width:1024px) min(780px, 46vw), 100vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]" />
                    </div></div>
                  </div>
                </div>
                {/* rotating badge, overlapping the blob bottom-left (size in % of the blob) */}
                <div className="h-badge absolute bottom-[4%] left-[-8%] z-10 aspect-square w-[27%]">
                  <div className="relative h-full w-full rounded-full bg-ink">
                    <svg viewBox="0 0 200 200" className="animate-spin-slow absolute inset-0 h-full w-full" aria-hidden>
                      <defs><path id="badgeCircle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
                      <text className="font-display" fontSize="19" letterSpacing="1.5" fill="#D6FF4D"><textPath href="#badgeCircle" textLength="462" lengthAdjust="spacing">SMASH BURGER • TORINO • VANCHIGLIA • </textPath></text>
                    </svg>
                    <span className="absolute inset-0 m-auto flex h-[36%] w-[36%] items-center justify-center rounded-full bg-lime text-[clamp(16px,1.4vw,26px)]">★</span>
                  </div>
                </div>
                {/* mini product card, anchored to the blob bottom-right */}
                <div ref={mini} data-tilt className="h-mini absolute bottom-[-9%] right-[-6%] z-10 flex w-[252px] items-center gap-2.5 rounded-[22px] bg-ink p-2.5 text-cream shadow-xl md:w-[290px] md:gap-3 md:rounded-[24px] md:p-3 lg:bottom-[0%] lg:right-[-14%]">
                  <div className="relative h-14 w-16 shrink-0 rounded-2xl bg-lime md:h-16 md:w-20">
                    <Image src={star.img} alt="" fill sizes="80px" className="object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-cream/60">Il più scelto</p>
                    <p className="truncate font-bold">{star.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-lime px-2.5 py-0.5 text-sm font-bold tabular-nums text-ink">{euro(star.price)}</span>
                  </div>
                  <button onClick={addStar} aria-label={`Aggiungi ${star.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-2xl text-ink transition-transform hover:rotate-90 md:h-11 md:w-11">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* 03 wavy divider. It lives OUTSIDE the frame (no grain overlay on it) and also covers the header padding,
          so it is exactly the page colour: no seam/band between hero and next section */}
      <svg className="pointer-events-none absolute bottom-[-1px] left-0 z-10 h-[64px] w-full md:h-[92px]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 120 0, 240 0, 360 40 S 600 80, 720 40 S 960 0, 1080 40 S 1320 80, 1440 40 L1440 80 L0 80 Z" fill="#F6EBD7" />
      </svg>
    </header>
  );
}
