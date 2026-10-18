"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, reduced } from "@/lib/gsap";
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

/** marquee on the wavy black ribbon (text follows the curve, scrolls forever) */
const MARQUEE = "★\u00a0\u00a0 GOOD MOOD \u00a0\u00a0★\u00a0\u00a0 SMASH BURGER \u00a0\u00a0★\u00a0\u00a0 A TORINO, VANCHIGLIA \u00a0\u00a0★\u00a0\u00a0 BURGER · FRIES · DRINKS \u00a0\u00a0";
/** flying pieces cut out of the hero photo itself: at rest they sit exactly where they were shot,
 * on scroll / mouse they drift at their own depth (l/t/w in % of the photo canvas) */
const PIECES = [
  { src: "/assets/hero/hp-0.webp", l: 81.515, t: 5.855, w: 13.899, iw: 195, ih: 190, d: 1.6 },
  { src: "/assets/hero/hp-1.webp", l: 90.202, t: 35.224, w: 8.617, iw: 121, ih: 91, d: 1.2 },
  { src: "/assets/hero/hp-2.webp", l: 53.509, t: 0.274, w: 11.188, iw: 157, ih: 88, d: 1.0 },
  { src: "/assets/hero/hp-3.webp", l: 7.366, t: 88.198, w: 3.753, iw: 53, ih: 54, d: 2.0 },
  { src: "/assets/hero/hp-4.webp", l: 13.412, t: 34.95, w: 4.031, iw: 56, ih: 50, d: 0.8 },
  { src: "/assets/hero/hp-5.webp", l: 6.185, t: 82.983, w: 4.239, iw: 59, ih: 57, d: 1.8 },
  { src: "/assets/hero/hp-6.webp", l: 95.483, t: 2.196, w: 3.266, iw: 46, ih: 54, d: 0.6 },
  { src: "/assets/hero/hp-7.webp", l: 94.302, t: 44.739, w: 2.849, iw: 40, ih: 42, d: 1.4 },
  { src: "/assets/hero/hp-8.webp", l: 8.617, t: 56.45, w: 2.919, iw: 41, ih: 40, d: 0.9 },
];
/** title art by Michel, one image per line, placed (in % of a 491x408 box) exactly as in the mockup */
const TITLE = [
  { l: 1.08, t: 0.15, w: 67.78, ih: 360, sy: 0 },
  { l: 0.672, t: 24.98, w: 99.23, ih: 249 },
  { l: 0.468, t: 52.6, w: 79.19, ih: 265, sy: 1.08 },
  { l: 0.061, t: 77.2, w: 85.74, ih: 205, sy: 1.1 },
];
const AVATARS = ["/assets/menu/sbranatore.webp", "/assets/menu/diavolo.webp", "/assets/menu/tonyptony-burger-v2.webp"];

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

/** scalloped black sticker: curved "100%" / "VANCHIGLIA", lime ring arcs, the cream mascot */
function Badge() {
  const N = 26, pts: string[] = [];
  for (let i = 0; i <= 260; i++) { const a = (i / 260) * Math.PI * 2, r = 97 + 2.4 * Math.sin(a * N); pts.push(`${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)}`); }
  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_18px_rgba(17,17,17,.3)]" aria-hidden>
        <polygon points={pts.join(" ")} fill="#0d0d0d" />
        <path d="M44 58 A74 74 0 0 0 36 128" fill="none" stroke="#CFF840" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M156 58 A74 74 0 0 1 172 112" fill="none" stroke="#CFF840" strokeWidth="3.2" strokeLinecap="round" />
        <defs>
          <path id="hb-top" d="M46,72 A66,66 0 0,1 154,72" />
          <path id="hb-bot" d="M30,112 A72,72 0 0,0 172,110" />
        </defs>
        <text fontFamily="var(--font-display)" fontSize="37" fill="#CFF840" textAnchor="middle"><textPath href="#hb-top" startOffset="50%">100%</textPath></text>
        <text fontFamily="var(--font-display)" fontSize="30" fill="#CFF840" textAnchor="middle" letterSpacing="0.3" dy="24"><textPath href="#hb-bot" startOffset="50%">VANCHIGLIA</textPath></text>
      </svg>
      <Image src="/assets/mascot/thumbs-cream.webp" alt="" width={438} height={440} sizes="120px" draggable={false} className="sb-thumb absolute left-[23%] top-[25%] w-[55%]" />
      <span className="sr-only">100% Vanchiglia</span>
    </div>
  );
}

/** black wavy ribbon; the viewBox keeps 1440 units at desktop so text size matches the mockup, wider units on phones */
function WaveRibbon() {
  const ref = useRef<SVGSVGElement>(null);
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { const w = el.parentElement!.clientWidth; setVw(window.innerWidth >= 1024 ? 1440 : Math.round(Math.max(w * 1.25, 480))); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el.parentElement!); return () => ro.disconnect();
  }, []);
  const k = vw / 1440;
  const X = (x: number) => (x * k).toFixed(1);
  const wide = vw === 1440;
  // desktop: the stage is narrower than the frame, so the band keeps waving past both stage edges
  const d = wide
    ? "M-760 62 S -540 86, -420 78 S -190 18, -40 48 C 110 78, 240 72, 420 62 S 640 50, 780 56 S 960 86, 1080 78 S 1300 56, 1480 62 S 1700 86, 1820 78 S 2040 56, 2200 62"
    : `M${X(-40)} 48 C ${X(110)} 78, ${X(240)} 72, ${X(420)} 62 S ${X(640)} 50, ${X(780)} 56 S ${X(960)} 86, ${X(1080)} 78 S ${X(1300)} 56, ${X(1480)} 62`;
  const REP = wide ? 10 : 6;
  useGSAP(() => {
    if (reduced()) return;
    const tp = ref.current!.querySelector("textPath")!, t = ref.current!.querySelector("text")!;
    const cyc = t.getComputedTextLength() / REP;
    const o = { v: 0 };
    const tw = gsap.to(o, { v: -cyc, duration: cyc / 38, ease: "none", repeat: -1, onUpdate: () => tp.setAttribute("startOffset", o.v.toFixed(1)) });
    return () => tw.kill();
  }, { dependencies: [vw], scope: ref });
  return (
    <svg ref={ref} viewBox={`0 0 ${vw} 120`} className="hx-ribbon block h-auto w-full overflow-visible" aria-hidden>
      <defs><path id="hx-rb" d={d} /></defs>
      <path d={d} stroke="#0b0b0b" strokeWidth="40" fill="none" />
      <text fontFamily="var(--font-display)" fontSize="20" fill="#D7F64E" dy="7" letterSpacing="0.8"><textPath href="#hx-rb" startOffset="0">{MARQUEE.repeat(REP)}</textPath></text>
    </svg>
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
  const wasDragged = (e: React.MouseEvent) => {
    const el = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-drag]");
    if (el?.dataset.dragged) { delete el.dataset.dragged; e.preventDefault(); return true; }
    return false;
  };
  const poke = (e: React.MouseEvent) => { if (wasDragged(e)) return; setEgg((n) => n + 1); burst(e.clientX, e.clientY, 12); };

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(".h-nav > *", { y: -30, opacity: 0, duration: 0.8, stagger: 0.06 })
        .from(".h-line", { yPercent: 105, duration: 1.1, stagger: 0.14 }, 0.1)
        .from(".h-zig", { xPercent: 20, opacity: 0, duration: 1.2 }, 0.15)
        .from(".h-burger", { yPercent: 18, xPercent: 8, rotate: 6, scale: 0.8, opacity: 0, duration: 1.4, ease: "elastic.out(1, 0.75)" }, 0.3)
        .from(".h-fly-in", { scale: 0, rotate: -60, opacity: 0, duration: 0.9, ease: "back.out(2)", stagger: 0.05 }, 0.75)
        .from(".h-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.5)
        .from(".h-badge", { scale: 0, rotate: -180, duration: 1.1, ease: "back.out(1.6)" }, 0.8)
        .from(".h-low > *", { y: 20, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.9);
      const off = onSiteReady(() => tl.play());
      gsap.to(".h-burger-breath", { scale: 1.015, y: -6, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.utils.toArray<HTMLElement>(".h-fly-f").forEach((el, i) => gsap.to(el, { y: i % 2 ? 7 : -7, rotate: i % 2 ? 6 : -6, duration: 2.2 + (i % 4) * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.4 };
      gsap.fromTo(".h-burger-par", { yPercent: 0 }, { yPercent: 10, ease: "none", immediateRender: false, scrollTrigger: st });
      gsap.fromTo(".h-title-par", { yPercent: 0 }, { yPercent: -12, ease: "none", immediateRender: false, scrollTrigger: st });
      gsap.utils.toArray<HTMLElement>(".h-fly").forEach((el) => {
        const d = Number(el.dataset.depth || 1);
        gsap.fromTo(el, { y: 0, rotate: 0 }, { y: -170 * d, rotate: (d > 1.2 ? 1 : -1) * 50 * d, ease: "none", immediateRender: false, scrollTrigger: st });
      });
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const qs = gsap.utils.toArray<HTMLElement>(".h-fly-m, .h-burger-tilt").map((el) => {
        const d = Number(el.dataset.depth || 0.3);
        return { d, x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }) };
      });
      const move = (e: PointerEvent) => { const mx = e.clientX / innerWidth - 0.5, my = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(mx * 40 * q.d); q.y(my * 26 * q.d); }); };
      if (fine) window.addEventListener("pointermove", move, { passive: true });
      return () => { off(); window.removeEventListener("pointermove", move); };
    });
    gsap.set(".float-bar", { yPercent: -160 });
    ScrollTrigger.create({
      trigger: root.current, start: "bottom 80px",
      onEnter: () => gsap.to(".float-bar", { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }),
      onLeaveBack: () => gsap.to(".float-bar", { yPercent: -160, autoAlpha: 0, duration: 0.4, ease: "power2.in" }),
    });
  }, { scope: root });

  return (
    <header ref={root} className="hx relative px-2 pb-2 md:px-3 md:pb-3 lg:p-0">
      {/* floating bar (fixed) */}
      <div data-cart-wrap className="float-bar invisible fixed left-1/2 top-3 z-[88] flex w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-full bg-ink p-1.5 pl-3 opacity-0 shadow-2xl ring-1 ring-cream/15">
        <a href="#top" className="sb-lift-tilt sb-lift relative flex h-11 items-center rounded-full bg-lime px-4 md:h-12 md:px-5" aria-label="SBRANO, torna su">
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="140px" className="h-7 w-auto md:h-8" />
        </a>
        <nav className="hidden gap-1 md:flex">{LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href} aria-current={act === l.href ? "true" : undefined} className={`sb-lift rounded-full px-3 pb-1.5 pt-2 font-tanker text-[16px] uppercase leading-none tracking-[0.03em] transition-colors ${act === l.href ? "bg-lime text-ink" : "text-cream/85 hover:bg-cream/10 hover:text-lime"}`}>{l.label}</a>)}</nav>
        <CartButton />
      </div>

      <div id="top" className="hx-frame relative overflow-hidden rounded-[28px] bg-[#F5ECD9] md:rounded-[36px]">
        {/* lime zigzag field (desktop: traced from the mockup, 1440x810 units) */}
        <svg className="h-zig hx-zig pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1440 810" preserveAspectRatio="none" aria-hidden>
          <path d="M716 0 L1070 0 L902 80 L1060 72 L1336 56 L1314 0 L2400 0 L2400 402 L1440 402 L1386 386 L1300 470 L1120 520 L700 520 L556 490 L563 450 L575 400 L613 250 L658 100 L674 50 Z" fill="#CFF840" />
        </svg>

        <nav className="h-nav hx-nav relative z-30 flex w-full items-center justify-between gap-3 px-4 pt-4 md:px-8" aria-label="Principale">
          <a href="#top" className="hx-logo sb-lift relative flex h-11 items-center" aria-label="SBRANO home">
            <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} sizes="160px" className="h-9 w-auto lg:h-full" />
          </a>
          <ul className="hx-links hidden lg:flex">
            {LINKS.map((l) => <li key={l.href} className="h-full"><a href={l.href} aria-current={act === l.href ? "true" : undefined} className={`hx-link flex h-full items-center rounded-full font-tanker uppercase leading-none text-ink transition-colors ${act === l.href ? "bg-[#CFF840]" : "hover:bg-ink hover:text-lime"}`}><span className="hx-lt">{l.label}</span></a></li>)}
          </ul>
          <div className="hx-navr flex items-center gap-2">
            <span className="hx-cart"><CartButton variant="dark" /></span>
            <a href="#menu" data-mag="0.18" className="hx-order sb-lift hidden items-center justify-center rounded-full bg-ink font-tanker uppercase leading-none text-[#D7F64E] transition-colors hover:bg-lime hover:text-ink lg:flex"><span className="hx-lt">Ordina ora</span><svg aria-hidden viewBox="0 0 20 14" className="hx-arr"><path d="M1 7 H18 M12 1 L18 7 L12 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
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

        <section className="hx-stage relative" aria-label="SBRANO">
          {/* left column */}
          <div className="hx-left h-title-par relative z-20 px-5 pt-5 md:px-10">
            {/* title art by Michel (two layers, sized independently to match the mockup); the real text is the h1 */}
            <h1 className="hx-title relative aspect-[491/408] w-[min(82vw,480px)]">
              <span className="sr-only">Fame brutta. Prezzi giusti.</span>
              {TITLE.map((t, i) => (
                <span key={i} aria-hidden className="absolute block overflow-hidden pb-[1%]" style={{ left: `${t.l}%`, top: `${t.t}%`, width: `${t.w}%`, scale: t.sy ? `1 ${t.sy}` : undefined, transformOrigin: "0 0" }}>
                  <span className="h-line block"><Image src={`/assets/hero/tl-${i}.webp`} alt="" width={900} height={t.ih} priority sizes="(min-width:1024px) 34vw, 88vw" className="h-auto w-full" /></span>
                </span>
              ))}
            </h1>
            <p className="hx-sub h-fade mt-5 max-w-[30rem] text-[17px] font-medium leading-snug">
              Smash burger, pollo croccante e patatine.<br className="max-lg:hidden" /> Piazza Santa Giulia, Torino.
            </p>
            <div className="hx-ctas h-fade mt-6 flex items-center gap-2.5">
              <a href="#menu" data-mag="0.18" className="hx-cta1 sb-lift flex h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-[18px] font-tanker uppercase leading-none text-[#D7F64E] transition-colors hover:bg-lime hover:text-ink"><span className="hx-lt">Ordina ora</span><svg aria-hidden viewBox="0 0 20 14" className="hx-arr"><path d="M1 7 H18 M12 1 L18 7 L12 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <a href="#menu" data-mag="0.18" className="hx-cta2 sb-lift flex h-12 items-center justify-center rounded-full border-2 border-ink px-6 text-[18px] font-tanker uppercase leading-none transition-colors hover:bg-ink hover:text-lime"><span className="hx-lt">Vedi menu</span></a>
            </div>
            {/* delivery (demo only: no real links) */}
            <div className="hx-delrow h-fade mt-5 flex flex-wrap items-center gap-x-2 gap-y-2.5" data-delivery-row>
              <p className="hx-opp text-[11px] font-medium uppercase leading-none tracking-[0.03em]">Oppure a domicilio</p>
              <ul className="hx-dels flex flex-wrap gap-1.5">
                {DELIVERY.map((d) => (
                  <li key={d.id}>
                    <a href="#" data-delivery={d.id} aria-label={`Ordina su ${d.name} (demo, nessun link reale)`}
                      onClick={(e) => { e.preventDefault(); announce({ title: "Solo demo", sub: `Qui partirebbe ${d.name}. Nella demo nessun ordine vero.`, img: "/assets/mascot/running.webp", cta: false }); }}
                      className={`hx-del hx-del-${d.id} sb-lift flex h-10 items-center justify-center rounded-full bg-white px-3.5 shadow-[0_2px_8px_rgba(17,17,17,.12)] transition-shadow hover:shadow-[0_6px_16px_rgba(17,17,17,.2)]`}>
                      <Image src={d.src} alt="" width={d.w} height={d.h} unoptimized className={`hx-dlogo w-auto ${d.cls}`} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* burger side */}
          <div className="hx-right relative mt-8 lg:mt-0">
            <svg className="h-zig pointer-events-none absolute inset-x-[-6%] inset-y-[6%] h-[88%] w-[112%] lg:hidden" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
              <path d="M70 0 L400 0 V230 L300 270 L40 280 L20 250 L60 120 Z" fill="#CFF840" />
            </svg>
            <div className="hx-burger relative mx-auto aspect-[1400/1063] w-[112%] max-w-none -translate-x-[5%]">
              <div className="h-burger absolute inset-0 will-change-transform">
                <div className="h-burger-par h-full w-full will-change-transform"><div className="h-burger-tilt h-full w-full" data-depth="0.3">
                  <div className="h-burger-breath relative h-full w-full will-change-transform">
                    <Image src="/assets/hero/hero-main.webp" alt="Doppio smash burger con cheddar, bacon, lattuga e jalapeño nella carta SBRANO, con gli ingredienti che volano" fill priority sizes="(min-width:1024px) 66vw, 112vw" className="object-contain" />
                  </div>
                </div></div>
              </div>
              {PIECES.map((f, i) => (
                <div key={i} className="h-fly pointer-events-none absolute z-10" data-depth={f.d} style={{ left: `${f.l}%`, top: `${f.t}%`, width: `${f.w}%` }} aria-hidden>
                  <div className="h-fly-m" data-depth={f.d}><div className="h-fly-in"><div className="h-fly-f">
                    <Image src={f.src} alt="" width={f.iw} height={f.ih} sizes="140px" className="h-auto w-full" />
                  </div></div></div>
                </div>
              ))}
              {/* draggable stickers (desktop mouse only; on touch they are plain taps) */}
              <div data-drag className="hx-mascot absolute lg:hidden left-[3%] top-[56%] z-20 w-[17%]">
                <button type="button" onClick={poke} data-egg={egg} aria-label="Mascotte SBRANO: toccami, non mordo" className="sb-stk relative block w-full" style={{ ["--r" as string]: "-8deg" } as React.CSSProperties}>
                  <Image src={egg % 2 ? "/assets/stickers/mascot-crown.webp" : "/assets/stickers/mascot-wave.webp"} alt="" width={300} height={egg % 2 ? 344 : 276} sizes="120px" draggable={false} className="h-auto w-full" />
                  <span className="sb-tag absolute -bottom-[16%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-lime font-tanker text-[10px] uppercase text-ink">{egg === 0 ? "Toccami, non mordo" : egg % 2 ? "Ahia. Un po’ mordo." : "Ancora? Ok."}</span>
                </button>
              </div>
              <div data-drag className="hx-build absolute lg:hidden right-[6%] top-[-3%] z-20">
                <a href="#builder" onClick={wasDragged} className="sb-stk sb-tag bg-ink font-tanker text-[12px] uppercase text-lime" style={{ ["--r" as string]: "7deg" } as React.CSSProperties}>
                  Costruisci il<br />tuo mostro →
                </a>
              </div>
            </div>
            <div data-drag className="hx-badge h-badge absolute bottom-[4%] right-[3%] z-20 w-[27%]">
              <div className="sb-stk" style={{ ["--r" as string]: "0deg" } as React.CSSProperties}><Badge /></div>
            </div>
          </div>

          {/* wavy marquee ribbon */}
          <div className="hx-rib relative z-20 -mx-2 mt-2 md:-mx-3"><WaveRibbon /></div>

          {/* bottom strip */}
          <div className="hx-low h-low relative z-20 flex w-full items-center justify-between gap-4 px-4 pb-4 pt-1 md:px-8">
            <a href="#locale" className="hx-loc group flex items-center gap-3">
              <span className="hx-thumb relative block h-[40px] w-[66px] shrink-0 overflow-hidden rounded-[6px]">
                <Image src="/assets/locale/locale-night.webp" alt="" fill sizes="92px" className="object-cover grayscale brightness-[1.45] contrast-[1.05] transition duration-500 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-100" />
              </span>
              <span className="hx-small text-[12px] font-medium uppercase leading-[1.15]">Torino<br />Vanchiglia</span>
              <span aria-hidden className="hx-ne hidden font-tanker text-[16px] lg:inline leading-none transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
            </a>
            <a href="#menu" className="hx-scroll hidden items-center gap-5 md:flex">
              <svg aria-hidden viewBox="0 0 10 34" className="sb-scroll hx-sarr h-[33px] w-[8px]"><path d="M5 1 V32 M1 27 L5 32 L9 27" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              <span className="hx-tiny text-[10px] font-medium uppercase leading-[1.2]">Scroll<br />per scoprire</span>
            </a>
            <a href="#recensioni" className="hx-fans group flex items-center">
              <span className="hx-avs flex -space-x-2.5">
                {AVATARS.map((a) => <span key={a} className="hx-av relative block h-[30px] w-[30px] overflow-hidden rounded-full border-2 border-[#F5ECD9] bg-[#2b2622]"><Image src={a} alt="" fill sizes="40px" className="object-contain p-[3px]" /></span>)}
              </span>
              <span className="hx-small ml-2.5 whitespace-nowrap text-[11px] font-medium uppercase leading-[1.15]">+ 12.000<br />stomaci felici</span>
              <span aria-hidden className="hx-ne ml-6 hidden font-tanker text-[16px] lg:inline leading-none transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
            </a>
          </div>
        </section>
      </div>
      <DayBar />
    </header>
  );
}
