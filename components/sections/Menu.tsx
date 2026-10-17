"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { MENU, FILTERS, DRINKS, euro, type Cat } from "@/lib/data";
import SectionHead from "../ui/SectionHead";
import Badge from "../ui/Badge";
import Sticker from "../ui/Sticker";
import { BLUR } from "@/lib/blur";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";

const N = MENU.length;
const STEP = 360 / N;
const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

export default function Menu() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const imgs = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ rot: 0, R: 380 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [filter, setFilter] = useState<Cat | null>(null);
  const { add } = useCart();

  const render = useCallback(() => {
    const { rot, R } = state.current;
    let best = 0, bestAbs = 999;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const a = norm(i * STEP + rot);
      const abs = Math.abs(a);
      if (abs < bestAbs) { bestAbs = abs; best = i; }
      const t = abs / 180;
      el.style.transform = `translate3d(-50%,-50%,${-R}px) rotateY(${a}deg) translateZ(${R}px)`;
      el.style.opacity = String(Math.max(0, 1 - t * 1.25));
      el.style.zIndex = String(100 - Math.round(abs));
      // wrapper has headroom padding: only the card itself takes pointer events
      el.style.pointerEvents = "none";
      (el.firstElementChild as HTMLElement | null)?.style.setProperty("pointer-events", abs < 100 ? "auto" : "none");
    });
    if (best !== activeRef.current) { activeRef.current = best; setActive(best); }
  }, []);

  const measure = useCallback(() => {
    const w = stage.current?.offsetWidth ?? 1200;
    state.current.R = w < 640 ? 250 : w < 1024 ? 330 : 400;
    render();
  }, [render]);

  const goTo = useCallback((idx: number, dur = 1.1) => {
    const cur = state.current.rot;
    const target = -idx * STEP;
    const delta = norm(target - cur);
    tween.current?.kill();
    tween.current = gsap.to(state.current, { rot: cur + delta, duration: reduced() ? 0 : dur, ease: "expo.out", onUpdate: render });
  }, [render]);

  useEffect(() => { measure(); addEventListener("resize", measure); return () => removeEventListener("resize", measure); }, [measure]);

  // drag with inertia
  useEffect(() => {
    const el = stage.current!;
    let down = false, lastX = 0, lastT = 0, v = 0;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      down = true; lastX = e.clientX; lastT = performance.now(); v = 0;
      tween.current?.kill(); el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const now = performance.now(); const dx = e.clientX - lastX;
      const k = el.offsetWidth < 640 ? 0.35 : 0.22;
      state.current.rot += dx * k;
      v = (dx * k) / Math.max(1, now - lastT) * 16; lastX = e.clientX; lastT = now; render();
    };
    const onUp = () => {
      if (!down) return; down = false; el.style.cursor = "";
      const proj = state.current.rot + v * 14;
      const snapped = Math.round(proj / STEP) * STEP;
      tween.current = gsap.to(state.current, { rot: snapped, duration: reduced() ? 0 : 1.4, ease: "power4.out", onUpdate: render });
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => { el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp); };
  }, [render]);

  // entrance: cylinder spins in on scroll
  useGSAP(() => {
    if (reduced()) return;
    state.current.rot = -140;
    render();
    gsap.to(state.current, { rot: 0, duration: 2.2, ease: "expo.out", onUpdate: render, scrollTrigger: { trigger: stage.current, start: "top 75%" } });
    // filter pills: static (no opacity-0 state that could be seen while scrolling in)
  }, { scope: root });

  const pick = (c: Cat) => {
    const next = filter === c ? null : c;
    setFilter(next);
    if (next) {
      // closest matching item to current front
      const matches = MENU.map((m, i) => (m.cats.includes(next) ? i : -1)).filter((i) => i >= 0);
      const cur = activeRef.current;
      const idx = matches.includes(cur) ? matches[(matches.indexOf(cur) + 1) % matches.length] : matches.sort((a, b) => Math.abs(norm((a - cur) * STEP)) - Math.abs(norm((b - cur) * STEP)))[0];
      goTo(idx);
    }
  };

  const [flavor, setFlavor] = useState(DRINKS[0].id);
  const addItem = (i: number) => {
    const m = MENU[i];
    if (m.id === "bibita") {
      const d = DRINKS.find((x) => x.id === flavor) ?? DRINKS[0];
      flyToCart(imgs.current[i], d.img, () => add({ id: `bibita-${d.id}`, name: `Bibita ${d.name}`, price: m.price, img: d.img }));
      return;
    }
    flyToCart(imgs.current[i], m.img, () => add({ id: m.id, name: m.name, price: m.price, img: m.img }));
  };

  const m = MENU[active];
  return (
    <section ref={root} id="menu" className="relative overflow-hidden pb-16 pt-20 md:pt-28">
      <div className="px-5">
        <SectionHead reveal={false} label="Roba da sbranare" icon="mascot" tilt={-3} l1="Scegli la" l2="tua vittima" note="Trascina il cilindro, filtra, sbrana. Prezzi da piazza, porzioni da tangenziale." />
      </div>
      <div className="m-pills mt-8 flex flex-wrap justify-center gap-2 px-4">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => pick(f.id)} aria-pressed={filter === f.id}
            className={`m-pill h-11 rounded-full border-2 border-ink px-5 text-sm font-bold uppercase tracking-wider transition-colors ${filter === f.id ? "bg-ink text-lime" : "bg-transparent hover:bg-lime"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div ref={stage} tabIndex={0} aria-roledescription="carosello" aria-label="Menu, usa le frecce per ruotare"
        onKeyDown={(e) => { if (e.key === "ArrowRight") goTo((active + 1) % N); if (e.key === "ArrowLeft") goTo((active - 1 + N) % N); }}
        className="relative mx-auto -mt-2 h-[500px] cursor-grab touch-pan-y select-none outline-none md:h-[600px]"
        style={{ perspective: "1500px", perspectiveOrigin: "50% 40%" }}>
        <div className="absolute bottom-6 left-1/2 h-16 w-[80%] max-w-[900px] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-xl" />
        <div className="absolute left-1/2 top-[52%] h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          {MENU.map((it, i) => {
            const isActive = i === active;
            const dim = filter && !it.cats.includes(filter);
            return (
              <div key={it.id} ref={(el) => { cards.current[i] = el; }} className="absolute left-0 top-0 will-change-transform" style={{ backfaceVisibility: "hidden", padding: "112px 48px 16px", marginTop: -48 }}>
                {/* padding = headroom: the 3D-transformed wrapper clips its painted bounds, so the popped-out burger and the scaled active card must stay inside it */}
                <article className={`relative w-[230px] rounded-[28px] p-3 transition-[transform,background-color,filter] duration-500 ease-[cubic-bezier(.2,1.4,.4,1)] md:w-[290px] ${isActive ? "scale-[1.08] bg-ink text-cream shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]" : "bg-white text-ink"} ${dim ? "grayscale opacity-40" : ""}`}>
                  <div className={`relative h-[200px] rounded-[20px] md:h-[250px] ${it.cutout ? (isActive ? "bg-lime" : "bg-cream") : "overflow-hidden"}`}>
                    <div ref={(el) => { imgs.current[i] = el; }}
                      className={`absolute transition-transform duration-700 ease-[cubic-bezier(.2,1.6,.4,1)] ${it.cutout ? "-inset-2" : "inset-0"} ${isActive && it.cutout ? "-translate-y-10 scale-[1.22] md:-translate-y-14" : ""} ${isActive && !it.cutout ? "scale-110" : ""}`}>
                      <Image src={it.img} alt={it.name} fill sizes="320px" draggable={false} className={`${it.cutout ? "object-contain p-3 drop-shadow-[0_20px_20px_rgba(0,0,0,.3)]" : "rounded-[20px] object-cover"}`} />
                    </div>
                  </div>
                  <div className="px-2 pb-1 pt-4">
                    <span data-menu-tag className={`pill-label mb-2 h-6 px-3 text-[10px] ${isActive ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{it.tag}</span>
                    <h3 className="font-display text-[28px] uppercase leading-none md:text-[34px]">{it.name}</h3>
                    <p className={`mt-2 line-clamp-2 min-h-[2.6em] text-sm leading-snug ${isActive ? "text-cream/70" : "text-ink/60"}`}>{it.desc}</p>
                    {it.id === "bibita" && (
                      <div className="mt-3 flex gap-1 md:gap-1.5" role="radiogroup" aria-label="Scegli il gusto" onPointerDown={(e) => e.stopPropagation()}>
                        {DRINKS.map((d) => (
                          <button key={d.id} type="button" role="radio" aria-checked={flavor === d.id} data-flavor={d.id} onClick={() => setFlavor(d.id)}
                            className={`flex h-8 items-center gap-1 rounded-full border-2 px-2.5 text-[10px] font-bold uppercase md:pl-0.5 md:text-[11px] transition-colors ${flavor === d.id ? (isActive ? "border-lime bg-lime text-ink" : "border-ink bg-ink text-lime") : (isActive ? "border-cream/25 text-cream" : "border-ink/20 text-ink")}`}>
                            <span className="relative hidden h-6 w-6 rounded-full bg-cream md:block"><Image src={d.img} alt="" fill sizes="24px" className="object-contain p-0.5" /></span>
                            {d.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${isActive ? "bg-lime text-ink" : "bg-cream"}`}>{euro(it.price)}</span>
                        <span className={`text-xs ${isActive ? "text-cream/50" : "text-ink/50"}`}>{it.kcal} kcal</span>
                      </div>
                      <button onClick={() => addItem(i)} aria-label={`Aggiungi ${it.name} al carrello`}
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-3xl leading-none transition-transform duration-300 hover:rotate-90 active:scale-90 ${isActive ? "bg-lime text-ink" : "bg-ink text-lime"}`}>+</button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button onClick={() => goTo((active - 1 + N) % N)} aria-label="Precedente" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink text-lg font-bold transition-colors hover:bg-ink hover:text-lime">←</button>
        <div className="flex gap-2">
          {MENU.map((it, i) => (
            <button key={it.id} onClick={() => goTo(i)} aria-label={it.name} className={`h-2.5 rounded-full transition-all duration-500 ${i === active ? "w-9 bg-ink" : "w-2.5 bg-ink/25"}`} />
          ))}
        </div>
        <button onClick={() => goTo((active + 1) % N)} aria-label="Successivo" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink text-lg font-bold transition-colors hover:bg-ink hover:text-lime">→</button>
      </div>
      <p className="mt-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-ink/50" aria-live="polite">← trascina • {m.name} →</p>
      <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 px-5 text-center">
        <span className="pill-label bg-lime text-ink">Combo</span>
        <p className="text-sm md:text-base">Burger + patatine + bibita a <b>{euro(13.9)}</b>. Lo diciamo piano, sennò finisce.</p>
      </div>
      {/* Free refill band: real fountain photo, fetched early (eager, low priority) with blur placeholder so it never pops in */}
      <div className="relative mx-auto mt-10 max-w-[1100px] px-4 md:px-10" data-refill>
        <Sticker name="asterisco" spin tilt={0} parallax={16} className="absolute -top-9 right-4 z-10 hidden w-[72px] md:block" sizes="72px" />
        <div className="grid overflow-hidden rounded-[28px] bg-ink text-cream md:grid-cols-[1.25fr_1fr] md:rounded-[36px]">
          <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[300px]">
            <Image src="/assets/locale/free-refill.webp" alt="Il banco bibite SBRANO con la spina e il murale della mascotte" fill loading="eager" fetchPriority="low" placeholder="blur" blurDataURL={BLUR["/assets/locale/free-refill.webp"]}
              sizes="(min-width:1100px) 600px, (min-width:768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
            <Badge icon="bolt" tilt={-3} dark className="w-fit">Free refill</Badge>
            <h3 className="font-display text-4xl uppercase leading-[0.9] md:text-5xl">Refill gratis.<br /><span className="text-lime">Sete brutta?</span></h3>
            <p className="text-cream/70">Torna al banco: Pepsi, Fanta o Sprite. Il bicchiere lo riempi tu, quante volte vuoi.</p>
            <div className="flex -space-x-3" aria-hidden>
              {DRINKS.map((d) => <span key={d.id} className="relative h-14 w-14 rounded-full border-2 border-ink bg-cream"><Image src={d.img} alt="" fill sizes="56px" className="object-contain p-1" /></span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
