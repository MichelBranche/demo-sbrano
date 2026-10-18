"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import CartButton from "../cart/CartButton";
import { useCart } from "../cart/CartProvider";
import { burst } from "@/lib/fly";
import { useDragStickers } from "@/lib/drag";
import { onSiteReady } from "../Preloader";

export const LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#builder", label: "Builder" },
  { href: "#filiera", label: "Filiera" },
  { href: "#locale", label: "Il locale" },
  { href: "#dove", label: "Dove siamo" },
];
/** delivery row (demo, no real links): official logos used as-is (Wikimedia Commons, public domain / trademark of each brand),
 * sized per logo so they read optically equal inside identical white pills */
const DELIVERY = [
  { id: "deliveroo", name: "Deliveroo", src: "/assets/delivery/deliveroo.svg", w: 300, h: 80, cls: "h-[23px] md:h-[26px]" },
  { id: "glovo", name: "Glovo", src: "/assets/delivery/glovo.svg", w: 2515, h: 833, cls: "h-[21px] md:h-[24px]" },
  { id: "justeat", name: "Just Eat", src: "/assets/delivery/justeat.svg", w: 190, h: 47, cls: "h-[18px] md:h-[21px]" },
];

/** day bar: rotates four burgers every 4s, each links to its spot (menu carousel or the monthly special) */
const DAY = [
  { n: "Il Diavolo di Vanchiglia", href: "#proposta", id: "", sp: "diavolo" },
  { n: "TonyPTony, il Fuorilegge", href: "#proposta", id: "", sp: "tonyptony" },
  { n: "Sbranatore", href: "#menu", id: "sbranatore", sp: "" },
  { n: "Mordi e Fuggi", href: "#menu", id: "mordi-e-fuggi", sp: "" },
];
export function goMenuItem(id: string, sp = "") {
  if (id) window.dispatchEvent(new CustomEvent("sbrano:menu-goto", { detail: id }));
  if (sp) window.dispatchEvent(new CustomEvent("sbrano:special", { detail: sp }));
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
    <a href={d.href} onClick={() => goMenuItem(d.id, d.sp)} data-daybar
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

/** marquee ribbon under the hero (straight, slightly tilted) */
const MARQUEE = ["Good mood", "Smash burger", "A Torino, Vanchiglia", "Burger · Fries · Drinks"];
/** extra flying pieces on top of the hero photo; d = parallax depth (bigger moves more) */
const FLY = [
  { src: "/assets/hero/fly-jalapeno.webp", w: 419, h: 420, cls: "right-[-2%] top-[0%] w-[12%]", d: 1.5, r: 18, f: "" },
  { src: "/assets/hero/fly-bacon.webp", w: 420, h: 275, cls: "left-[-7%] top-[40%] w-[19%]", d: 1.9, r: -10, f: "" },
  { src: "/assets/hero/fly-sauce.webp", w: 420, h: 236, cls: "left-[20%] top-[-6%] w-[12%]", d: 1.1, r: -20, f: "" },
  { src: "/assets/hero/fly-jalapeno.webp", w: 419, h: 420, cls: "left-[1%] top-[6%] w-[8%] hidden md:block", d: 0.7, r: -34, f: "blur-[1.5px] opacity-90" },
  // chili flakes: small, soft, far away (depth particles)
  { src: "/assets/hero/fly-chili-1.webp", w: 200, h: 132, cls: "right-[22%] top-[-8%] w-[9%]", d: 0.5, r: 0, f: "blur-[1px] opacity-80" },
  { src: "/assets/hero/fly-chili-3.webp", w: 200, h: 124, cls: "left-[8%] bottom-[6%] w-[10%] hidden md:block", d: 2.2, r: 20, f: "" },
  { src: "/assets/hero/fly-chili-4.webp", w: 200, h: 143, cls: "right-[-4%] top-[42%] w-[8%]", d: 0.6, r: -15, f: "blur-[1.5px] opacity-75" },
];
const AVATARS = ["/assets/menu/sbranatore.webp", "/assets/menu/tonyptony-burger-v2.webp", "/assets/menu/diavolo.webp"];

/** which section is on screen (for the active nav pill); in the hero the Menu pill leads */
function useSpy() {
  const [act, setAct] = useState("#menu");
  useEffect(() => {
    const ids = LINKS.map((l) => l.href);
    const f = () => {
      let cur = "#menu";
      for (const id of ids) { const el = document.querySelector(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = id; }
      setAct(cur);
    };
    f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f);
  }, []);
  return act;
}

/** black round badge: curved lime text + the cream mascot */
function Badge() {
  return (
    <div className="relative aspect-square w-full rounded-full bg-ink shadow-[0_14px_30px_rgba(17,17,17,.28)]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="100" cy="100" r="92" fill="none" stroke="#D6FF4D" strokeWidth="3" />
        <defs>
          <path id="hb-top" d="M38,100 a62,62 0 0,1 124,0" />
          <path id="hb-bot" d="M20,100 a80,80 0 0,0 160,0" />
        </defs>
        <text className="font-display" fontSize="34" fill="#D6FF4D" textAnchor="middle"><textPath href="#hb-top" startOffset="50%">100%</textPath></text>
        <text className="font-display" fontSize="25" fill="#D6FF4D" textAnchor="middle" letterSpacing="1"><textPath href="#hb-bot" startOffset="50%">VANCHIGLIA</textPath></text>
      </svg>
      <Image src="/assets/mascot/thumbs-cream.webp" alt="" width={438} height={440} sizes="120px" draggable={false} className="sb-thumb absolute left-1/2 top-1/2 w-[44%] -translate-x-1/2 -translate-y-[50%]" />
      <span className="sr-only">100% Vanchiglia</span>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { announce } = useCart();
  const [egg, setEgg] = useState(0);
  const act = useSpy();
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
        .from(".h-line", { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.09 }, 0.1)
        .from(".h-zig", { xPercent: 30, opacity: 0, duration: 1.2 }, 0.15)
        .from(".h-burger", { yPercent: 30, xPercent: 12, rotate: 10, scale: 0.6, opacity: 0, duration: 1.4, ease: "elastic.out(1, 0.7)" }, 0.3)
        .from(".h-fly-in", { scale: 0, rotate: -60, opacity: 0, duration: 0.9, ease: "back.out(2)", stagger: 0.08 }, 0.7)
        .from(".h-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.5)
        .from(".h-badge", { scale: 0, rotate: -180, duration: 1.1, ease: "back.out(1.6)" }, 0.8)
        .from(".h-low > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.9);
      const off = onSiteReady(() => tl.play());
      // breathing burger, idle drift on the flying pieces
      gsap.to(".h-burger-breath", { scale: 1.025, y: -8, rotate: -0.8, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.utils.toArray<HTMLElement>(".h-fly-f").forEach((el, i) => gsap.to(el, { y: i % 2 ? 14 : -14, rotate: `+=${i % 2 ? 8 : -8}`, duration: 2.2 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      // scroll parallax (own wrappers, never the intro targets): pieces fly apart at their depth
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.4 };
      gsap.fromTo(".h-burger-par", { yPercent: 0 }, { yPercent: 12, ease: "none", immediateRender: false, scrollTrigger: st });
      gsap.fromTo(".h-title-par", { yPercent: 0 }, { yPercent: -14, ease: "none", immediateRender: false, scrollTrigger: st });
      gsap.utils.toArray<HTMLElement>(".h-fly").forEach((el) => {
        const d = Number(el.dataset.depth || 1);
        gsap.fromTo(el, { y: 0 }, { y: -160 * d, rotate: (d > 1.3 ? 1 : -1) * 40 * d, ease: "none", immediateRender: false, scrollTrigger: st });
      });
      // mouse parallax (real mouse only)
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const qs = gsap.utils.toArray<HTMLElement>(".h-fly-m, .h-burger-tilt").map((el) => {
        const d = Number(el.dataset.depth || 0.5);
        return { d, x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }) };
      });
      const move = (e: PointerEvent) => { const mx = e.clientX / innerWidth - 0.5, my = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(mx * 46 * q.d); q.y(my * 30 * q.d); }); };
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

  const pill = (href: string) => `sb-lift flex h-10 items-center rounded-full px-4 pt-[3px] font-tanker text-[17px] uppercase leading-none tracking-[0.03em] transition-colors ${act === href ? "bg-lime text-ink ring-2 ring-ink" : "text-ink hover:bg-ink hover:text-lime"}`;

  return (
    <header ref={root} className="relative px-2 pb-2 md:px-3 md:pb-3">
      <DayBar />
      {/* floating bar (fixed) */}
      <div data-cart-wrap className="float-bar invisible fixed left-1/2 top-3 z-[88] flex w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-full bg-ink p-1.5 pl-3 opacity-0 shadow-2xl ring-1 ring-cream/15">
        <a href="#top" className="sb-lift-tilt sb-lift relative flex h-11 items-center rounded-full bg-lime px-4 md:h-12 md:px-5" aria-label="SBRANO, torna su">
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="140px" className="h-7 w-auto md:h-8" />
        </a>
        <nav className="hidden gap-1 md:flex">{LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href} aria-current={act === l.href ? "true" : undefined} className={`sb-lift rounded-full px-3 pb-1.5 pt-2 font-tanker text-[16px] uppercase leading-none tracking-[0.03em] transition-colors ${act === l.href ? "bg-lime text-ink" : "text-cream/85 hover:bg-cream/10 hover:text-lime"}`}>{l.label}</a>)}</nav>
        <CartButton />
      </div>

      <div id="top" className="grain relative overflow-hidden rounded-[28px] bg-[#f3e6cc] md:rounded-[40px]">
        {/* lime zigzag field behind the burger (desktop: right half, full height; mobile: behind the burger only) */}
        <svg className="h-zig pointer-events-none absolute right-0 top-0 hidden h-[86%] w-[62%] lg:block" viewBox="0 0 900 800" preserveAspectRatio="none" aria-hidden>
          <path d="M210 0 H900 V800 H560 L640 690 L470 640 L560 520 L360 470 L470 330 L250 300 L370 170 L150 120 Z" fill="#D6FF4D" />
        </svg>
        <nav className="h-nav relative z-30 mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 pt-4 md:px-8 lg:pt-5 2xl:px-14" aria-label="Principale">
          <a href="#top" className="sb-lift-tilt sb-lift relative flex h-11 items-center md:h-12" aria-label="SBRANO home">
            <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="160px" className="h-9 w-auto md:h-10" />
          </a>
          <ul className="absolute left-1/2 top-[18px] hidden -translate-x-1/2 gap-1 rounded-full lg:flex lg:top-[22px]">
            {LINKS.map((l) => <li key={l.href}><a href={l.href} aria-current={act === l.href ? "true" : undefined} className={pill(l.href)}>{l.label}</a></li>)}
          </ul>
          <div className="flex items-center gap-2">
            <CartButton variant="dark" />
            <a href="#menu" data-mag="0.18" className="sb-lift hidden h-12 items-center gap-2 rounded-full bg-ink px-6 pt-[3px] font-tanker text-[18px] uppercase leading-none text-cream transition-colors hover:bg-lime hover:text-ink hover:ring-2 hover:ring-ink lg:flex">Ordina ora <span aria-hidden className="text-lime">→</span></a>
            <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-ink lg:hidden">
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-lime transition-transform ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        <div className={`relative z-30 grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="min-h-0 space-y-1 px-4">
            {LINKS.map((l) => <li key={l.href}><a onClick={() => setMenuOpen(false)} href={l.href} className="sb-uline py-1.5 font-tanker text-5xl uppercase leading-none text-ink">{l.label}</a></li>)}
            <li className="h-3" />
          </ul>
        </div>

        <section className="relative" aria-label="SBRANO">
          <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 px-5 pt-6 md:px-10 lg:min-h-[min(calc(100svh-250px),720px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-x-4 lg:pt-2 2xl:px-16">
            <div className="h-title-par relative z-20 flex flex-col [container-type:inline-size]">
              <h1 className="h-claim2 font-display uppercase">
                <span className="block overflow-hidden pb-[0.04em]"><span className="h-line block text-ink">Fame</span></span>
                <span className="block overflow-hidden pb-[0.04em]"><span className="h-line block text-ink">Brutta.</span></span>
                <span className="block overflow-hidden pb-[0.04em] pr-[0.08em]"><span className="h-line h-lime block">Prezzi</span></span>
                <span className="block overflow-hidden pb-[0.08em] pr-[0.08em]"><span className="h-line h-lime block">Giusti.</span></span>
              </h1>
              <p className="h-fade mt-5 max-w-[30rem] text-[17px] font-medium leading-snug md:text-[19px] lg:mt-4 lg:text-[clamp(1.05rem,0.85rem+0.4vw,1.3rem)]">
                Smash burger e patatine. <span className="whitespace-nowrap">Piazza Santa Giulia, Torino.</span>
              </p>
              <div className="h-fade mt-6 flex flex-wrap items-center gap-3">
                <a href="#menu" data-mag="0.18" className="sb-lift flex h-12 items-center gap-3 rounded-full bg-ink px-7 pt-[3px] font-tanker text-[19px] uppercase leading-none text-cream transition-colors hover:bg-lime hover:text-ink hover:ring-2 hover:ring-ink md:h-14 md:px-8 md:text-[21px]">Ordina ora <span aria-hidden className="text-lime">→</span></a>
                <a href="#menu" data-mag="0.18" className="sb-lift flex h-12 items-center rounded-full border-[2.5px] border-ink px-7 pt-[3px] font-tanker text-[19px] uppercase leading-none transition-colors hover:bg-ink hover:text-lime md:h-14 md:px-8 md:text-[21px]">Vedi menu</a>
              </div>
              {/* delivery (demo only: no real links) */}
              <div className="h-fade mt-5 flex flex-wrap items-center gap-x-3 gap-y-2.5" data-delivery-row>
                <p className="font-tanker text-[14px] uppercase leading-none tracking-[0.04em] text-ink/70">Oppure a domicilio</p>
                <ul className="flex flex-wrap gap-1.5 md:gap-2">
                  {DELIVERY.map((d) => (
                    <li key={d.id}>
                      <a href="#" data-delivery={d.id} aria-label={`Ordina su ${d.name} (demo, nessun link reale)`}
                        onClick={(e) => { e.preventDefault(); announce({ title: "Solo demo", sub: `Qui partirebbe ${d.name}. Nella demo nessun ordine vero.`, img: "/assets/mascot/running.webp", cta: false }); }}
                        className="sb-lift-tilt sb-lift flex h-10 items-center rounded-full border-2 border-ink bg-white px-3.5 shadow-[3px_3px_0_#111] transition-shadow hover:shadow-[5px_5px_0_#111] md:h-11 md:px-4">
                        <Image src={d.src} alt="" width={d.w} height={d.h} unoptimized className={`w-auto ${d.cls}`} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* burger side */}
            <div className="relative mt-8 lg:mt-0">
              {/* mobile zigzag (desktop uses the frame-wide one) */}
              <svg className="h-zig pointer-events-none absolute inset-x-[-6%] inset-y-[4%] h-[92%] w-[112%] lg:hidden" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
                <path d="M40 10 L400 0 V300 L60 290 L110 230 L10 200 L90 150 L0 110 L80 70 Z" fill="#D6FF4D" />
              </svg>
              <div className="relative mx-auto aspect-[1400/1043] w-[108%] max-w-none -translate-x-[4%] lg:w-[118%] lg:-translate-x-[8%]">
                <div className="h-burger absolute inset-0 will-change-transform">
                  <div className="h-burger-par h-full w-full will-change-transform"><div className="h-burger-tilt h-full w-full" data-depth="0.35">
                    <div className="h-burger-breath relative h-full w-full will-change-transform">
                      <Image src="/assets/hero/hero-burger.webp" alt="Doppio smash burger con cheddar, bacon e jalapeño nella carta SBRANO, con gli ingredienti che volano" fill priority sizes="(min-width:1024px) 62vw, 110vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.22)]" />
                    </div>
                  </div></div>
                </div>
                {FLY.map((f, i) => (
                  <div key={i} className={`h-fly pointer-events-none absolute z-10 ${f.cls}`} data-depth={f.d} aria-hidden>
                    <div className="h-fly-m" data-depth={f.d}><div className="h-fly-in"><div className="h-fly-f" style={{ rotate: `${f.r}deg` }}>
                      <Image src={f.src} alt="" width={f.w} height={f.h} sizes="160px" className={`h-auto w-full drop-shadow-[0_14px_14px_rgba(0,0,0,.22)] ${f.f}`} />
                    </div></div></div>
                  </div>
                ))}
                {/* draggable stickers (desktop mouse only; on touch they are plain taps) */}
                <div data-drag className="absolute left-[2%] top-[58%] z-20 w-[19%] lg:left-[-2%] lg:top-[62%] lg:w-[15%]">
                  <button type="button" onClick={poke} data-egg={egg} aria-label="Mascotte SBRANO: toccami, non mordo" className="sb-stk relative block w-full" style={{ ["--r" as string]: "-8deg" } as React.CSSProperties}>
                    <Image src={egg % 2 ? "/assets/stickers/mascot-crown.webp" : "/assets/stickers/mascot-wave.webp"} alt="" width={300} height={egg % 2 ? 344 : 276} sizes="160px" draggable={false} className="h-auto w-full" />
                    <span className="sb-tag absolute -bottom-[16%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-lime font-tanker text-[clamp(10px,0.9vw,15px)] uppercase text-ink">{egg === 0 ? "Toccami, non mordo" : egg % 2 ? "Ahia. Un po’ mordo." : "Ancora? Ok."}</span>
                  </button>
                </div>
                <div data-drag className="absolute right-[6%] top-[-2%] z-20 lg:right-[10%] lg:top-[0%]">
                  <a href="#builder" onClick={wasDragged} className="sb-stk sb-tag bg-ink font-tanker text-[clamp(12px,1.1vw,19px)] uppercase text-lime" style={{ ["--r" as string]: "7deg" } as React.CSSProperties}>
                    Costruisci il<br />tuo mostro →
                  </a>
                </div>
                <div data-drag className="h-badge absolute bottom-[2%] right-[3%] z-20 w-[25%] lg:bottom-[8%] lg:right-[6%] lg:w-[20%]">
                  <div className="sb-stk" style={{ ["--r" as string]: "-8deg" } as React.CSSProperties}><Badge /></div>
                </div>
              </div>
            </div>
          </div>

          {/* tilted marquee */}
          <div className="relative z-20 -mx-4 mt-6 -rotate-[2deg] overflow-hidden bg-ink py-2.5 md:mt-4 md:py-3 lg:mt-0" aria-hidden>
            <div className="sb-marq flex w-max">
              {[0, 1].map((k) => (
                <div key={k} className="flex shrink-0">
                  {Array.from({ length: 3 }).flatMap((_, j) => MARQUEE.map((t) => (
                    <span key={`${j}-${t}`} className="flex items-center gap-5 px-5 font-display text-[clamp(18px,1.2rem+0.6vw,30px)] uppercase leading-none text-lime"><span className="pt-[0.1em]">{t}</span><span className="text-cream">★</span></span>
                  )))}
                </div>
              ))}
            </div>
          </div>

          {/* bottom strip */}
          <div className="h-low relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-5 pb-5 pt-6 md:px-10 md:pb-6 2xl:px-16">
            <a href="#locale" className="group flex items-center gap-3">
              <span className="relative block h-[52px] w-[78px] shrink-0 overflow-hidden rounded-[12px] border-2 border-ink md:h-[60px] md:w-[92px]">
                <Image src="/assets/locale/locale-night.webp" alt="" fill sizes="92px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </span>
              <span className="font-tanker text-[15px] uppercase leading-[1.05] md:text-[17px]">Torino<br />Vanchiglia <span aria-hidden className="inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span></span>
            </a>
            <a href="#menu" className="hidden items-center gap-2.5 font-tanker text-[13px] uppercase leading-[1.1] tracking-[0.06em] text-ink/70 md:flex">
              <svg aria-hidden viewBox="0 0 16 40" className="sb-scroll h-9 w-3.5"><path d="M8 2 V36 M2 30 L8 37 L14 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <span>Scroll<br />per scoprire</span>
            </a>
            <a href="#menu" className="group flex items-center gap-3">
              <span className="flex -space-x-3">
                {AVATARS.map((a) => <span key={a} className="relative block h-11 w-11 overflow-hidden rounded-full border-2 border-ink bg-lime md:h-12 md:w-12"><Image src={a} alt="" fill sizes="48px" className="object-contain p-0.5" /></span>)}
              </span>
              <span className="font-tanker text-[15px] uppercase leading-[1.05] md:text-[17px]">Il menu<br />completo <span aria-hidden className="inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span></span>
            </a>
          </div>
        </section>
      </div>
    </header>
  );
}
