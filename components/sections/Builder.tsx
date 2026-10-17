"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { INGREDIENTS, BUN_BOTTOM, BUN_TOP, euro, type Ingredient } from "@/lib/data";
import SectionHead from "../ui/SectionHead";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";

type Layer = { uid: number; ing: Ingredient };
const MAX = 10;
const PLACES = ["di Vanchiglia", "del Balon", "della Mole", "di Santa Giulia", "del Po", "di Porta Palazzo"];

function makeName(fill: Ingredient[], closed: boolean) {
  if (!fill.length) return "Ancora niente. Coraggio.";
  const n = (id: string) => fill.filter((f) => f.id === id).length;
  const p = n("patty"), c = n("chicken");
  let base = "Il Vegetariano Arrabbiato";
  if (p && c) base = "Il Terra-Aria";
  else if (p >= 3) base = "Il Mostro";
  else if (p === 2) base = "Il Doppio";
  else if (p === 1) base = "Lo Smash";
  else if (c >= 2) base = "Il Pollaio";
  else if (c === 1) base = "Il Pollo";
  const adj: string[] = [];
  if (fill.some((f) => f.spicy)) adj.push("Infernale");
  if (n("bacon") >= 2) adj.push("Porcone"); else if (n("bacon")) adj.push("Affumicato");
  if (n("cheddar") >= 2) adj.push("Filantissimo"); else if (n("cheddar")) adj.push("Filante");
  if (n("onion-ring")) adj.push("Cerchiato");
  if (n("lettuce") && n("tomato")) adj.push("Quasi Sano");
  if (n("mayo")) adj.push("Cremoso");
  const teri = n("teriyaki") ? " di Tokyo" : "";
  const place = teri || " " + PLACES[fill.reduce((a, f) => a + f.id.length, 0) % PLACES.length];
  const xl = fill.length >= 8 ? " XXL" : "";
  return `${base} ${adj.slice(0, 2).join(" ")}${xl}${place}${closed ? "" : " (senza cappello)"}`.replace(/\s+/g, " ");
}

export default function Builder() {
  const root = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const uid = useRef(1);
  const [layers, setLayers] = useState<Layer[]>([]); // includes bun-bottom as first
  const [closed, setClosed] = useState(false);
  const [toast, setToast] = useState("");
  const { add } = useCart();
  const { contextSafe } = useGSAP({ scope: root });

  const fill = layers.filter((l) => l.ing.id !== "bun-bottom").map((l) => l.ing);
  const all = [...layers.map((l) => l.ing), ...(closed ? [BUN_TOP] : [])];
  const price = all.reduce((a, i) => a + i.price, 0) + (all.length ? 2.0 : 0); // +2€ mano d'opera & amore
  const kcal = all.reduce((a, i) => a + i.kcal, 0);
  const name = makeName(fill, closed);
  const spicy = fill.some((f) => f.spicy);

  const mood = useMemo(() => {
    if (!layers.length) return { img: "/assets/mascot/waving.webp", say: "Ciao! Tocca un ingrediente." };
    if (fill.filter((f) => f.id === "patty").length >= 3) return { img: "/assets/mascot/eating-burger.webp", say: "Ma sei serio? Rispetto." };
    if (spicy) return { img: "/assets/mascot/running.webp", say: "Brucia! Scappo a prendere da bere." };
    if (closed && fill.length >= 4) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Capolavoro. Roba da re." };
    if (closed) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Chiuso. Si mangia." };
    if (fill.length >= MAX) return { img: "/assets/mascot/eating-burger.webp", say: "Basta! Non entra in bocca." };
    return { img: "/assets/mascot/eating-burger.webp", say: fill.length ? "Mmh. Continua così." : "Base fatta. Ora la ciccia." };
  }, [layers.length, fill, spicy, closed]);

  // stack offsets
  const W = 260;
  let acc = 0;
  const offsets = layers.map((l) => { const o = acc; acc += l.ing.h * (W / 300); return o; });
  const topOffset = acc - 6;

  const popMascot = contextSafe(() => {
    if (reduced()) return;
    gsap.fromTo(mascotRef.current, { scale: 0.8, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
  });
  const dropIn = contextSafe((sel: string) => {
    if (reduced()) return;
    requestAnimationFrame(() => {
      const el = root.current?.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el, { y: -420, opacity: 0, rotate: gsap.utils.random(-14, 14) }, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: "bounce.out" });
      gsap.fromTo(stackRef.current, { scaleY: 1 }, { scaleY: 0.94, scaleX: 1.03, duration: 0.12, delay: 0.32, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 100%" });
    });
  });

  const addIng = (ing: Ingredient) => {
    if (fill.length >= MAX) { setToast("Stack pieno. Pensa alla tua mandibola."); return; }
    setToast("");
    const next = [...layers];
    const newOnes: Layer[] = [];
    if (!next.length) { const b = { uid: uid.current++, ing: BUN_BOTTOM }; next.push(b); newOnes.push(b); }
    const l = { uid: uid.current++, ing }; next.push(l); newOnes.push(l);
    setLayers(next);
    newOnes.forEach((n, i) => setTimeout(() => dropIn(`[data-layer="${n.uid}"]`), i * 160));
    popMascot();
  };
  const closeTop = () => {
    if (!layers.length) { setToast("Prima il pane sotto. Le basi."); return; }
    if (closed) return;
    setClosed(true); dropIn("[data-layer='top']"); popMascot();
  };
  const remove = contextSafe((u: number) => {
    const el = root.current?.querySelector(`[data-layer="${u}"]`);
    const doIt = () => setLayers((ls) => {
      const r = ls.filter((l) => l.uid !== u);
      if (r.length === 1 && r[0].ing.id === "bun-bottom") return r;
      return r;
    });
    if (el && !reduced()) gsap.to(el, { x: 260, rotate: 40, opacity: 0, duration: 0.45, ease: "power2.in", onComplete: doIt });
    else doIt();
    popMascot();
  });
  const reset = () => { setLayers([]); setClosed(false); setToast(""); popMascot(); };

  const order = () => {
    if (!fill.length) { setToast("Un burger senza niente è solo pane triste."); return; }
    const key = "custom-" + all.map((a) => a.id).join("-");
    const go = () => flyToCart(stackRef.current, "/assets/menu/sbranatore.webp", () => {
      add({ id: key, name, price: Math.round((price + (closed ? 0 : BUN_TOP.price)) * 100) / 100, img: "/assets/menu/sbranatore.webp", note: `Tuo: ${fill.map((f) => f.name).join(", ")}` });
      setToast("Aggiunto! Il cassiere ti guarda con stima.");
    });
    if (!closed) { closeTop(); setTimeout(go, 700); } else go();
  };

  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".b-chips", { scale: 0.6, rotate: -90, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".b-orbit", start: "top 75%" } });
    gsap.from(".b-ringline", { scale: 0.4, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".b-orbit", start: "top 75%" } });
  }, { scope: root });

  const Chip = ({ ing, small = false }: { ing: Ingredient; small?: boolean }) => {
    const count = fill.filter((f) => f.id === ing.id).length;
    return (
      <button onClick={() => addIng(ing)} aria-label={`Aggiungi ${ing.name}, ${euro(ing.price)}`}
        className={`b-chip group flex items-center gap-2 rounded-full border-2 border-cream py-1 pl-1 pr-2 text-left text-[13px] font-bold shadow-sm transition-[scale,background-color] duration-300 hover:scale-110 ${count ? "bg-ink text-lime" : "bg-white text-ink hover:bg-lime"} ${small ? "" : "whitespace-nowrap"}`}>
        <span className={`relative h-9 w-9 shrink-0 rounded-full ${count ? "bg-lime" : "bg-cream"}`}><Image src={ing.img} alt="" fill sizes="36px" className="object-contain p-0.5" /></span>
        <span className="leading-tight">{ing.name}</span>
        <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs ${count ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{count ? `×${count}` : "+"}</span>
      </button>
    );
  };

  return (
    <section ref={root} id="builder" className="relative overflow-hidden px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1360px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* left: copy + live info */}
        <div className="order-2 lg:order-1">
          <SectionHead label="Burger builder" l1="Costruisci" l2="il tuo mostro" align="left" />
          <ol className="mt-8 space-y-3">
            {[["Pane", "Il pane sotto arriva da solo. Siamo gentili."], ["Ciccia e extra", "Tocca gli ingredienti in orbita. Ognuno cade al suo posto."], ["Chiudi e ordina", "Il pane sopra chiude i giochi. Poi dritto in cassa."]].map(([t, d], i) => (
              <li key={t} className="flex items-center gap-4 rounded-[22px] bg-white/60 p-3 pr-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xl text-lime">{i + 1}</span>
                <div><p className="font-bold uppercase tracking-wider">{t}</p><p className="text-sm text-ink/60">{d}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-[28px] bg-ink p-5 text-cream md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cream/50">Il suo nome è</p>
            <p className="mt-1 min-h-[2.1em] font-display text-3xl uppercase leading-[1] text-lime md:text-4xl" aria-live="polite">{name}</p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div><p className="text-xs uppercase tracking-wider text-cream/50">Prezzo</p><p className="font-display text-4xl tabular-nums">{euro(price)}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-cream/50">Energia</p><p className="font-display text-4xl tabular-nums">{kcal} <span className="text-lg">kcal</span></p></div>
            </div>
            {layers.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Strati, tocca per togliere">
                {layers.filter((l) => l.ing.id !== "bun-bottom").map((l) => (
                  <li key={l.uid}><button onClick={() => remove(l.uid)} className="rounded-full bg-cream/10 px-3 py-1 text-xs hover:bg-lime hover:text-ink" aria-label={`Togli ${l.ing.name}`}>{l.ing.name} ✕</button></li>
                ))}
                {closed && <li><button onClick={() => setClosed(false)} className="rounded-full bg-cream/10 px-3 py-1 text-xs hover:bg-lime hover:text-ink">Pane sopra ✕</button></li>}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={order} className="group flex items-center gap-1">
                <span className="flex h-12 items-center rounded-full bg-lime px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">Aggiungi all&apos;ordine</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-xl text-ink transition-transform duration-500 group-hover:rotate-90">+</span>
              </button>
              <button onClick={reset} className="h-12 rounded-full border-2 border-cream/30 px-5 text-xs font-bold uppercase tracking-wider hover:border-lime hover:text-lime">Ricomincia</button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-lime/80" aria-live="polite">{toast}</p>
          </div>
        </div>

        {/* right: orbit */}
        <div className="b-orbit relative order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[680px]">
            <div className="b-ringline absolute inset-[16%] rounded-full border-2 border-dashed border-ink/25" />
            <div className="b-ringline absolute inset-[3%] hidden rounded-full border-2 border-ink/10 md:block" />
            <div className="absolute inset-[24%] rounded-full bg-lime" />
            {/* stack */}
            <div className="absolute inset-x-0 bottom-[30%] flex justify-center">
              <div ref={stackRef} className="relative h-[300px] w-[200px] sm:w-[260px]" aria-label="Il tuo burger">
                <div className="absolute -bottom-3 left-1/2 h-6 w-[90%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-sm" />
                {layers.map((l, i) => (
                  <div key={l.uid} className="absolute bottom-0 left-1/2 transition-transform duration-500 ease-[cubic-bezier(.3,1.5,.5,1)]"
                    style={{ width: `${l.ing.w}%`, transform: `translate(-50%, ${-offsets[i] * 1.15}px)`, zIndex: i + 1 }}>
                    <div data-layer={l.uid} onClick={() => l.ing.id !== "bun-bottom" && remove(l.uid)} className={`relative w-full ${l.ing.id !== "bun-bottom" ? "cursor-pointer" : ""}`} style={{ aspectRatio: l.ing.ratio }}>
                      <Image src={l.ing.img} alt={l.ing.name} fill sizes="280px" className="object-contain object-bottom" />
                    </div>
                  </div>
                ))}
                {closed && (
                  <div className="absolute bottom-0 left-1/2 transition-transform duration-500" style={{ width: `${BUN_TOP.w}%`, transform: `translate(-50%, ${-topOffset * 1.15 - 14}px)`, zIndex: 50 }}>
                    <div data-layer="top" onClick={() => setClosed(false)} className="relative w-full cursor-pointer" style={{ aspectRatio: BUN_TOP.ratio }}>
                      <Image src={BUN_TOP.img} alt="Pane sopra" fill sizes="280px" className="object-contain object-bottom" />
                    </div>
                  </div>
                )}
                {!layers.length && (
                  <p className="absolute inset-x-0 bottom-10 text-center font-display text-2xl uppercase leading-none text-ink/50">Piatto vuoto.<br />Fame piena.</p>
                )}
              </div>
            </div>
            {/* close button */}
            <button onClick={closeTop} disabled={closed} className="absolute bottom-[19%] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink py-1 pl-1 pr-4 text-xs font-bold uppercase tracking-wider text-lime transition-transform hover:scale-105 disabled:opacity-40">
              <span className="relative h-8 w-8 rounded-full bg-lime"><Image src={BUN_TOP.img} alt="" fill sizes="32px" className="object-contain p-0.5" /></span>
              {closed ? "Chiuso" : "Chiudi col pane"}
            </button>

            {/* orbit ring (md+) */}
            <div className="b-chips absolute inset-0 hidden md:block"><div className="orbit-ring absolute inset-0">
              {INGREDIENTS.map((ing, i) => {
                const a = (i / INGREDIENTS.length) * Math.PI * 2 - Math.PI / 2;
                const r = 45.5;
                return (
                  <div key={ing.id} className="absolute" style={{ left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%` }}>
                    <div className="orbit-counter"><div className="-translate-x-1/2 -translate-y-1/2"><Chip ing={ing} /></div></div>
                  </div>
                );
              })}
            </div></div>

            {/* mascot */}
            <div className="absolute right-0 top-0 z-[70] flex flex-col items-end md:right-[2%] md:top-[2%]">
              <div className="relative max-w-[180px] rounded-[18px] rounded-br-none bg-ink px-3 py-2 text-xs font-bold text-cream md:max-w-[200px] md:text-sm" aria-live="polite">{mood.say}</div>
              <div ref={mascotRef} className="relative mt-1 h-20 w-20 rounded-full border-[3px] border-ink bg-cream md:h-28 md:w-28">
                <Image key={mood.img} src={mood.img} alt="Mascotte SBRANO" fill sizes="112px" className="object-contain p-1.5" />
              </div>
            </div>
          </div>
          {/* chips (mobile) */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 md:hidden">
            {INGREDIENTS.map((ing) => <Chip key={ing.id} ing={ing} small />)}
          </div>
        </div>
      </div>
    </section>
  );
}
