"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";
import { euro, SPECIALS } from "@/lib/data";
import Doodle from "../ui/Doodle";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

/** Drops showcase: the "burger del mese / edizioni speciali" band.
 * One cutout per drop over a torn lime paper panel, thumbnails + autoplay progress below.
 * GSAP swaps the burger (rotate/scale) and reveals the title lines through a SplitText mask. */
const AUTOPLAY = 6;
const N = SPECIALS.length;

const Wave = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className={`block h-[44px] w-full md:h-[80px] ${flip ? "rotate-180" : ""}`} aria-hidden>
    <path d="M0 90 L0 50 C 180 0, 360 0, 540 40 S 900 90, 1080 45 S 1320 0, 1440 30 L1440 90 Z" fill="#111" />
  </svg>
);

function Strip({ side, words }: { side: "l" | "r"; words: string[] }) {
  return (
    <div className="dp-strip relative hidden w-[110px] shrink-0 xl:block" aria-hidden>
      <svg viewBox="0 0 110 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={side === "l" ? "M0 0 H86 C 110 100, 66 200, 86 300 S 110 500, 86 600 H0 Z" : "M110 0 H24 C 0 100, 44 200, 24 300 S 0 500, 24 600 H110 Z"} fill="#D6FF4D" />
      </svg>
      <div className={`relative flex h-full flex-col items-center justify-center gap-5 ${side === "l" ? "pr-6" : "pl-6"}`}>
        <span className="flex items-center gap-4 font-tanker text-[26px] uppercase leading-none tracking-[0.06em] text-ink [writing-mode:vertical-rl]">
          {words.map((w, i) => <span key={w} className="flex items-center gap-4">{i > 0 && <span className="text-[18px]">★</span>}{w}</span>)}
        </span>
        <div className="flex flex-col gap-1.5">{[0, 1, 2].map((i) => <i key={i} className="block h-2.5 w-2.5 rounded-full bg-ink" />)}</div>
      </div>
    </div>
  );
}

export default function Spotlight() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const play = useRef<gsap.core.Tween | null>(null);
  const splits = useRef<SplitText[]>([]);
  const hold = useRef({ hover: false, open: false, view: false });
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const { add } = useCart();

  const sync = useCallback(() => {
    const p = play.current; if (!p) return;
    const h = hold.current;
    if (h.hover || h.open || !h.view) p.pause(); else p.resume();
  }, []);

  const go = useCallback((n: number, dir?: number) => {
    const from = cur.current; const to = ((n % N) + N) % N;
    if (to === from) return;
    const d = dir ?? (to > from ? 1 : -1);
    cur.current = to; setIdx(to); setOpen(false); hold.current.open = false;
    const q = gsap.utils.selector(root);
    const oldB = q(`[data-dp-slide="${from}"]`), newB = q(`[data-dp-slide="${to}"]`);
    const oldC = q(`[data-dp-copy="${from}"]`), newC = q(`[data-dp-copy="${to}"]`);
    tl.current?.progress(1).kill();
    if (reduced()) {
      gsap.set([...oldB, ...oldC], { autoAlpha: 0 }); gsap.set([...newB, ...newC], { autoAlpha: 1 });
    } else {
      const oldL = splits.current[from]?.lines ?? [], newL = splits.current[to]?.lines ?? [];
      const t = gsap.timeline({ defaults: { ease: "power3.out" } });
      t.to(oldB, { xPercent: -28 * d, rotate: -16 * d, scale: 0.72, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, 0)
        .to(oldL, { yPercent: -110, duration: 0.4, ease: "power3.in", stagger: 0.05 }, 0)
        .to(oldC.length ? q(`[data-dp-copy="${from}"] [data-fx]`) : [], { y: -14, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
        .set(oldC, { autoAlpha: 0 }, 0.45)
        .set(newC, { autoAlpha: 1 }, 0.45)
        .fromTo(newL, { yPercent: 110 }, { yPercent: 0, duration: 0.85, ease: "power4.out", stagger: 0.09 }, 0.45)
        .fromTo(q(`[data-dp-copy="${to}"] [data-fx]`), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06 }, 0.6)
        .fromTo(newB, { xPercent: 30 * d, rotate: 18 * d, scale: 0.72, autoAlpha: 0 }, { xPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 0.95, ease: "back.out(1.3)" }, 0.3)
        .fromTo(q(`[data-dp-slide="${to}"] [data-pop]`), { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.08 }, 0.75)
        .fromTo(q(".dp-paper"), { rotate: -4 + 3 * d, scale: 0.95 }, { rotate: -4, scale: 1, duration: 1.1, ease: "elastic.out(1,0.6)" }, 0.2);
      tl.current = t;
    }
    // keep the active thumbnail in view without scrolling the page
    const box = thumbs.current, el = box?.querySelector<HTMLElement>(`[data-dp-thumb="${to}"]`);
    if (box && el) box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: reduced() ? "auto" : "smooth" });
    play.current?.progress(0); sync();
  }, [sync]);

  // autoplay: the progress bar tween drives the timer
  useGSAP(() => {
    gsap.set(root.current!.querySelectorAll("[data-dp-slide]:not([data-dp-slide='0']),[data-dp-copy]:not([data-dp-copy='0'])"), { autoAlpha: 0 });
    if (reduced()) { gsap.set(bar.current, { scaleX: 1 / N }); return; }
    play.current = gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: "none", paused: true, onComplete: () => go(cur.current + 1, 1) });
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive || !root.current) return;
      splits.current = SPECIALS.map((_, i) => SplitText.create(root.current!.querySelector(`[data-dp-title="${i}"]`)!, { type: "lines", mask: "lines" }));
    });
    // entrance
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true }, defaults: { ease: "power3.out" } })
      .from(".dp-strip", { xPercent: (i) => (i ? 100 : -100), duration: 0.9 }, 0)
      .from(".dp-paper", { rotate: 8, scale: 0.8, autoAlpha: 0, duration: 1, ease: "back.out(1.4)" }, 0.1)
      .from("[data-dp-slide='0'] .dp-burger", { y: 80, rotate: 10, scale: 0.8, autoAlpha: 0, duration: 1, ease: "back.out(1.3)" }, 0.25)
      .from("[data-dp-copy='0'] [data-fx]", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.3);
    return () => { alive = false; splits.current.forEach((s) => s.revert()); splits.current = []; play.current?.kill(); };
  }, { scope: root });

  // pause when off screen or tab hidden
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { hold.current.view = e.isIntersecting && !document.hidden; sync(); }, { threshold: 0.35 });
    io.observe(root.current!);
    const vis = () => { hold.current.view = !document.hidden && hold.current.view; if (!document.hidden) { const r = root.current!.getBoundingClientRect(); hold.current.view = r.top < innerHeight * 0.65 && r.bottom > innerHeight * 0.35; } sync(); };
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [sync]);

  // day bar deep link + keyboard arrows while the band is on screen
  useEffect(() => {
    const on = (e: Event) => { const i = SPECIALS.findIndex((x) => x.id === (e as CustomEvent<string>).detail); if (i >= 0) go(i); };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); hold.current.open = false; sync(); return; }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const a = document.activeElement as HTMLElement | null;
      if (a && a !== document.body && !root.current!.contains(a)) return;
      if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
      const r = root.current!.getBoundingClientRect();
      if (r.bottom < innerHeight * 0.3 || r.top > innerHeight * 0.7) return;
      e.preventDefault(); go(cur.current + (e.key === "ArrowRight" ? 1 : -1), e.key === "ArrowRight" ? 1 : -1);
    };
    addEventListener("sbrano:special", on); addEventListener("keydown", key);
    return () => { removeEventListener("sbrano:special", on); removeEventListener("keydown", key); };
  }, [go, sync]);

  // swipe / drag on the stage
  const down = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: React.PointerEvent) => {
    const s = down.current; down.current = null; if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(cur.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  const toggle = (v: boolean) => { setOpen(v); hold.current.open = v; sync(); };
  const it = SPECIALS[idx];
  const addIt = () => {
    const img = root.current!.querySelector<HTMLElement>(`[data-dp-slide="${cur.current}"] .dp-burger`);
    const x = SPECIALS[cur.current];
    flyToCart(img, x.img, () => add({ id: x.id, name: x.name, price: x.price, img: x.img, note: x.note }));
  };

  return (
    <section ref={root} id="proposta" className="relative mt-10 scroll-mt-20" aria-roledescription="carosello" aria-labelledby="dp-title"
      onMouseEnter={() => { hold.current.hover = true; sync(); }} onMouseLeave={() => { hold.current.hover = false; sync(); }}
      onFocus={() => { hold.current.hover = true; sync(); }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { hold.current.hover = false; sync(); } }}>
      <h2 id="dp-title" className="sr-only">Edizioni speciali e burger del mese</h2>
      <Wave />
      <div className="-my-px flex items-stretch overflow-hidden bg-ink py-6 md:py-10">
        <Strip side="l" words={["Sbrano", "Smash burger culture"]} />
        <div className="relative mx-auto w-full max-w-[1180px] flex-1 px-4 md:px-8">
          <div className="grid items-center gap-y-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-6">
            {/* stage */}
            <div ref={stage} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (down.current = null)}
              className="relative aspect-[1.08] w-full touch-pan-y select-none lg:order-2 lg:aspect-[1.12]" aria-live="polite">
              <div aria-hidden className="dp-paper absolute inset-[9%_6%_7%_8%] rotate-[-4deg] drop-shadow-[0_18px_24px_rgba(0,0,0,.45)]">
                <Image src="/assets/promo/torn-lime.webp" alt="" fill sizes="(min-width:1024px) 560px, 90vw" className="object-fill" />
                <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-ink/20">
                  <path d="M20 250 C 80 230, 120 270, 190 245" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M300 40 l40 -14 M310 56 l46 -16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M330 270 C 350 240, 380 250, 392 220" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              {SPECIALS.map((x, i) => (
                <div key={x.id} data-dp-slide={i} aria-hidden={idx !== i} className={`absolute inset-0 ${i ? "invisible opacity-0" : ""}`}>
                  <Image src={x.cut} alt={x.alt} fill draggable={false} sizes="(min-width:1024px) 640px, 100vw" loading={i ? "lazy" : "eager"}
                    className="dp-burger object-contain object-center p-[2%] drop-shadow-[0_34px_32px_rgba(0,0,0,.5)]" />
                  <span data-pop className="absolute right-[0%] top-[1%] z-10 flex aspect-square w-[25%] min-w-[100px] max-w-[164px] rotate-[10deg] flex-col items-center justify-center text-center text-cream drop-shadow-[0_14px_18px_rgba(0,0,0,.5)]">
                    <Image src="/assets/promo/sticker-black.webp" alt="" fill sizes="164px" className="object-contain" />
                    <Doodle name="l-crown" className="relative mb-1 w-[30%] text-lime" />
                    <span className="relative font-marker text-[clamp(15px,1.6vw,24px)] uppercase leading-[0.9]">{x.stamp[0]}<br />{x.stamp[1]}</span>
                  </span>
                  <span data-pop className="absolute bottom-[9%] right-[-2%] z-10 flex aspect-[1.55] w-[27%] min-w-[124px] max-w-[230px] rotate-[-7deg] items-center justify-center drop-shadow-[0_12px_16px_rgba(0,0,0,.45)]">
                    <Image src="/assets/promo/torn-cream.webp" alt="" fill sizes="230px" className="object-contain" />
                    <span className="relative mt-[14%] max-w-[78%] text-center font-tanker text-[clamp(15px,1.55vw,25px)] uppercase leading-[0.92] text-ink">{x.torn}</span>
                  </span>
                  <span data-pop className="absolute left-[8%] top-[1%] w-[15%]"><Doodle name="l-crown-burst" className="w-full -rotate-12 text-lime" /></span>
                  <span data-pop className="absolute bottom-[8%] left-[2%] w-[7%]"><Doodle name="l-bolt" className="w-full rotate-12 text-lime" /></span>
                  <span data-pop className="absolute left-[1%] top-[36%] w-[5.5%]"><Doodle name="l-star-solid" className="w-full text-cream" /></span>
                </div>
              ))}
              {/* ingredients sheet */}
              <div role="dialog" aria-modal="false" aria-label={`Ingredienti di ${it.name}`} hidden={!open}
                className="absolute inset-x-[4%] bottom-[4%] z-30 max-h-[88%] no-scrollbar overflow-auto rounded-[24px] bg-ink-3 p-5 text-cream shadow-[0_24px_50px_rgba(0,0,0,.6)] md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-tanker text-[22px] uppercase leading-none text-lime">{it.name}</span>
                  <button onClick={() => toggle(false)} aria-label="Chiudi ingredienti" className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-lg text-ink">×</button>
                </div>
                {it.acc.map((a) => (
                  <div key={a.t} className="mt-3">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cream/50">{a.t}</p>
                    <ul className="flex flex-wrap gap-1.5">{a.chips.map((c) => <li key={c} className="rounded-full bg-cream/10 px-3 py-1.5 text-[13px] font-medium leading-tight">{c}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
            {/* copy: all drops share one grid cell, the tallest sets the height */}
            <div className="grid @container lg:order-1">
              {SPECIALS.map((x, i) => (
                <div key={x.id} data-dp-copy={i} aria-hidden={idx !== i} className={`flex flex-col items-start self-center [grid-area:1/1] ${i ? "invisible opacity-0" : ""}`}>
                  <span data-fx className="rounded-full bg-lime px-4 pb-1.5 pt-2 font-tanker text-[14px] uppercase leading-none tracking-[0.04em] text-ink md:text-[16px]">{x.pill}</span>
                  <div className="relative mt-4 w-full" style={{ fontSize: `min(172px, ${(92 / x.fit).toFixed(2)}cqw, calc(11vw + 70px))` }}>
                    <p data-dp-title={i} className="font-display uppercase leading-[0.86] text-cream">
                      <span className="block">{x.d1}</span><span className="block text-lime">{x.d2}</span>
                    </p>
                    <Doodle name="l-drip-wide" className="absolute bottom-[-0.3em] left-[2%] w-[0.8em] text-lime opacity-90" />
                    <Doodle name="l-crown-tall" className="absolute top-[-0.2em] w-[0.42em] rotate-12 text-lime" style={{ left: `${x.w1 + 0.02}em` }} />
                  </div>
                  <p data-fx className="mt-8 max-w-[18ch] text-[clamp(20px,1.1rem+0.9vw,32px)] font-bold leading-[1.1] text-cream">{x.tagline}</p>
                  <p data-fx className="mt-3 font-display text-[clamp(34px,1.6rem+1.2vw,48px)] leading-none text-lime tabular-nums">{euro(x.price)}</p>
                  <div data-fx className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <button tabIndex={idx === i ? 0 : -1} onClick={addIt} aria-label={`Lo voglio: aggiungi ${x.name} al carrello`}
                      className="group flex h-14 items-center gap-3 rounded-full bg-lime px-8 font-tanker text-[20px] uppercase leading-none text-ink transition-transform duration-300 hover:-rotate-2 hover:scale-[1.03]">
                      <span className="pt-[0.12em]">Lo voglio</span><span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </button>
                    <button tabIndex={idx === i ? 0 : -1} onClick={() => toggle(!open)} aria-expanded={open && idx === i}
                      className="group relative font-tanker text-[16px] uppercase leading-none tracking-[0.04em] text-cream">
                      <span className="pt-[0.12em]">Scopri gli ingredienti</span> <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                      <svg aria-hidden viewBox="0 0 120 8" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-[5px] w-[86%] text-lime"><path d="M2 5 C 30 2, 70 7, 118 3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* thumbnails + progress */}
          <div className="mt-6 flex items-center gap-3 md:mt-5 md:justify-center">
            <button onClick={() => go(cur.current - 1, -1)} aria-label="Drop precedente" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/10 text-xl text-cream transition-colors hover:bg-lime hover:text-ink sm:flex">←</button>
            <div ref={thumbs} role="tablist" aria-label="Scegli il drop" className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-1">
              {SPECIALS.map((x, i) => (
                <button key={x.id} role="tab" data-dp-thumb={i} data-sp-tab={x.id} aria-selected={idx === i} aria-label={x.name} onClick={() => go(i)}
                  className={`flex h-[84px] w-[214px] shrink-0 snap-center items-center gap-2 rounded-[18px] p-2 pr-4 text-left transition-colors duration-300 md:h-[92px] md:w-[236px] ${idx === i ? "bg-lime text-ink" : "bg-ink-3 text-cream hover:bg-cream/15"}`}>
                  <span className="relative h-full w-[46%] shrink-0"><Image src={x.cut} alt="" fill sizes="110px" className="object-contain" /></span>
                  <span className="font-tanker text-[18px] uppercase leading-[0.95] md:text-[20px]">{x.thumb[0]}<br />{x.thumb[1]}</span>
                </button>
              ))}
            </div>
            <button onClick={() => go(cur.current + 1, 1)} aria-label="Drop successivo" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/10 text-xl text-cream transition-colors hover:bg-lime hover:text-ink sm:flex">→</button>
          </div>
          <div className="mt-4 flex items-center gap-4 md:justify-center">
            <span className="shrink-0 whitespace-nowrap font-tanker text-[15px] leading-none tracking-[0.08em] text-cream tabular-nums" aria-live="polite">{String(idx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span>
            <span className="relative h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-cream/15"><span ref={bar} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-lime" /></span>
            <span className="flex gap-2 sm:hidden">
              <button onClick={() => go(cur.current - 1, -1)} aria-label="Drop precedente" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream">←</button>
              <button onClick={() => go(cur.current + 1, 1)} aria-label="Drop successivo" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream">→</button>
            </span>
          </div>
        </div>
        <Strip side="r" words={["Burger", "Fries", "Good mood"]} />
      </div>
      <Wave flip />
    </section>
  );
}
