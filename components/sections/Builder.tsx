"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { INGREDIENTS, ING_GROUPS, BUN_BOTTOM, BUN_TOP, DRINKS, MENU_FRIES, MENU_UPGRADE, euro, type Ingredient } from "@/lib/data";
import { stackLayout, composeBurger } from "@/lib/stack";
import SectionHead from "../ui/SectionHead";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";

type Layer = { uid: number; ing: Ingredient };
/** total filling layers (buns excluded) and max copies of the same ingredient */
const MAX = 40;
const PER = 5;
const PLACES = ["di Vanchiglia", "del Balon", "della Mole", "di Santa Giulia", "del Po", "di Porta Palazzo"];

function makeName(fill: Ingredient[], closed: boolean) {
  if (!fill.length) return "Inizia scegliendo gli ingredienti.";
  const n = (id: string) => fill.filter((f) => f.id === id).length;
  const p = n("patty"), c = n("chicken");
  let base = "Il Vegetariano";
  if (p && c) base = "Terra e mare";
  else if (p >= 5) base = "Il Classico";
  else if (p >= 4) base = "Il Doppio Piano";
  else if (p >= 3) base = "Il Burger";
  else if (p === 2) base = "Il Doppio";
  else if (p === 1) base = "Lo Smash";
  else if (c >= 2) base = "Il Pollo";
  else if (c === 1) base = "Il Croccante";
  const adj: string[] = [];
  if (fill.some((f) => f.spicy)) adj.push("Piccante");
  if (n("bacon") >= 2) adj.push("Con bacon"); else if (n("bacon")) adj.push("Affumicato");
  if (n("cheddar") >= 2) adj.push("Extra formaggio"); else if (n("cheddar")) adj.push("Filante");
  if (n("onion-ring")) adj.push("Con onion ring");
  if (n("lettuce") && n("tomato")) adj.push("Vegetariano");
  if (n("mayo")) adj.push("Cremoso");
  const teri = n("teriyaki") ? " Teriyaki" : "";
  const place = teri || " " + PLACES[fill.reduce((a, f) => a + f.id.length, 0) % PLACES.length];
  const L = fill.length;
  const xl = L >= 35 ? " Grande" : L >= 25 ? " Doppio" : L >= 18 ? " Extra" : L >= 12 ? " XXXL" : L >= 8 ? " XXL" : "";
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
  const [asMenu, setAsMenu] = useState(false);
  const [drink, setDrink] = useState(DRINKS[0].id);
  const drinkObj = DRINKS.find((d) => d.id === drink) ?? DRINKS[0];
  const { add } = useCart();
  const { contextSafe } = useGSAP({ scope: root });

  const fill = layers.filter((l) => l.ing.id !== "bun-bottom").map((l) => l.ing);
  const all = [...layers.map((l) => l.ing), ...(closed ? [BUN_TOP] : [])];
  const burgerPrice = all.reduce((a, i) => a + i.price, 0) + (all.length ? 2.0 : 0); // +2€ mano d'opera & amore
  const price = burgerPrice + (asMenu && all.length ? MENU_UPGRADE : 0);
  const kcal = all.reduce((a, i) => a + i.kcal, 0);
  const name = makeName(fill, closed);
  const spicy = fill.some((f) => f.spicy);
  const full = fill.length >= MAX;
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    fill.forEach((f) => { m[f.id] = (m[f.id] ?? 0) + 1; });
    return m;
  }, [fill]);


  const mood = useMemo(() => {
    if (!layers.length) return { img: "/assets/mascot/waving.webp", say: "Scegli un ingrediente per iniziare." };
    if (fill.length >= MAX) return { img: "/assets/mascot/eating-burger.webp", say: "Hai raggiunto il numero massimo di strati." };
    if (fill.length >= 30) return { img: "/assets/mascot/running.webp", say: "Per aggiungere un ingrediente, rimuovine uno." };
    if (fill.length >= 20) return { img: "/assets/mascot/eating-burger.webp", say: "Il tuo burger prende forma." };
    if (fill.length >= 12) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Una combinazione generosa." };
    if (fill.filter((f) => f.id === "patty").length >= 3) return { img: "/assets/mascot/eating-burger.webp", say: "La tua selezione è pronta." };
    if (spicy) return { img: "/assets/mascot/running.webp", say: "Aggiungi una bibita se vuoi." };
    if (closed && fill.length >= 4) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Ingredienti selezionati." };
    if (closed) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Burger completato." };
    return { img: "/assets/mascot/eating-burger.webp", say: fill.length ? "Continua a comporre il tuo burger." : "Scegli proteine e ingredienti." };
  }, [layers.length, fill, spicy, closed]);

  // stack layout (shared with the cart snapshot renderer)
  const { offsets, top: topOffset, height: stackH } = stackLayout(layers.map((l) => l.ing));
  // the burger grows freely, then auto-scales so it always fits the plate AND the viewport
  const plateRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 520, h: 520, vh: 900 });
  useEffect(() => {
    const el = plateRef.current; if (!el) return;
    const upd = () => setBox({ w: el.offsetWidth, h: el.offsetHeight, vh: window.innerHeight });
    upd();
    const ro = new ResizeObserver(upd); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const widthFit = Math.min(1, (box.w * 0.62) / 260);
  const availH = Math.max(200, Math.min(box.h * 0.72, box.vh * 0.6)); // stays inside the plate, clear of the fixed navbar
  const fit = Math.min(widthFit, availH / Math.max(1, stackH));

  const popMascot = contextSafe(() => {
    if (reduced()) return;
    gsap.fromTo(mascotRef.current, { scale: 0.8, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
  });
  const dropIn = contextSafe((sel: string) => {
    if (reduced()) return;
    requestAnimationFrame(() => {
      const el = root.current?.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el, { y: -320, opacity: 0, rotate: gsap.utils.random(-14, 14) }, { y: 0, opacity: 1, rotate: 0, duration: 0.8, ease: "bounce.out", overwrite: true });
      gsap.fromTo(stackRef.current, { scaleY: 1 }, { scaleY: 0.94, scaleX: 1.03, duration: 0.12, delay: 0.3, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 100%", overwrite: true });
    });
  });

  const addIng = (ing: Ingredient) => {
    if (fill.length >= MAX) { setToast(`Massimo ${MAX} strati. Rimuovine uno (−) per aggiungere ${ing.name}.`); return; }
    if ((counts[ing.id] ?? 0) >= PER) { setToast(`Puoi aggiungere al massimo ${PER} porzioni di ${ing.name}.`); return; }
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
    if (!layers.length) { setToast("Aggiungi prima il pane sotto."); return; }
    if (closed) return;
    setClosed(true); dropIn("[data-layer='top']"); popMascot();
  };
  const remove = contextSafe((u: number) => {
    const el = root.current?.querySelector(`[data-layer="${u}"]`);
    const doIt = () => { setLayers((ls) => ls.filter((l) => l.uid !== u)); setToast(""); };
    if (el && !reduced()) gsap.to(el, { x: 260, rotate: 40, opacity: 0, duration: 0.4, ease: "power2.in", onComplete: doIt });
    else doIt();
    popMascot();
  });
  const removeOne = (ing: Ingredient) => {
    const last = [...layers].reverse().find((l) => l.ing.id === ing.id);
    if (last) remove(last.uid);
  };
  const reset = () => { setLayers([]); setClosed(false); setToast(""); popMascot(); };

  const order = () => {
    if (!fill.length) { setToast("Seleziona almeno un ingrediente."); return; }
    const ids = [...layers.map((l) => l.ing.id), BUN_TOP.id];
    const key = "custom-" + ids.join("-") + (asMenu ? `-menu-${drinkObj.id}` : "");
    const finalPrice = Math.round((price + (closed ? 0 : BUN_TOP.price)) * 100) / 100;
    const fillNames = fill.map((f) => f.name);
    const finalName = makeName(fill, true); // the order always closes the bun first
    const go = async () => {
      let img = "/assets/menu/sbranatore.webp";
      try { img = await composeBurger(ids); } catch { /* fallback: stacked component in cart */ }
      flyToCart(stackRef.current, img, () => {
        add({ id: key, name: asMenu ? `Menu ${finalName}` : finalName, price: finalPrice, img, layers: ids, ingredients: fillNames, note: `Ingredienti: ${fillNames.join(", ")}`,
          ...(asMenu ? { menu: { fries: MENU_FRIES.name, drink: drinkObj.name, friesImg: MENU_FRIES.img, drinkImg: drinkObj.img } } : {}) });
        setToast("Aggiunto all’ordine.");
      });
    };
    if (!closed) { closeTop(); setTimeout(go, 700); } else go();
  };

  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".b-group", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".b-picker", start: "top 85%", once: true } });
    gsap.from(".b-ringline", { scale: 0.6, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".b-orbit", start: "top 80%", once: true } });
  }, { scope: root });


  const Chip = ({ ing }: { ing: Ingredient }) => {
    const count = counts[ing.id] ?? 0;
    const maxed = full || count >= PER;
    return (
      <div data-ing={ing.id} className={`b-chip flex items-center gap-1 rounded-full border-2 p-1 text-[13px] font-bold transition-colors duration-200 ${count ? "border-ink bg-ink text-lime" : "border-ink/10 bg-white text-ink"}`}>
        <button type="button" onClick={() => addIng(ing)} aria-label={`Aggiungi ${ing.name}, ${euro(ing.price)}`} aria-disabled={maxed}
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-full pr-1 text-left transition-transform active:scale-95 ${maxed ? "opacity-60" : ""}`}>
          <span className={`relative h-9 w-9 shrink-0 rounded-full ${count ? "bg-lime" : "bg-cream"}`}><Image src={ing.img} alt="" fill sizes="36px" className="object-contain p-0.5" /></span>
          <span className="min-w-0 flex-1 leading-tight">{ing.name}{ing.spicy && <span aria-label="piccante"> 🌶</span>}<span className={`block text-[11px] font-medium ${count ? "text-lime/60" : "text-ink/50"}`}>+{euro(ing.price)}</span></span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          {count > 0 && <button type="button" onClick={() => removeOne(ing)} aria-label={`Togli un ${ing.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/15 text-base leading-none hover:bg-cream/30">−</button>}
          {count > 0 && <span className="w-5 text-center text-xs tabular-nums" data-count>{count}</span>}
          <button type="button" onClick={() => addIng(ing)} tabIndex={-1} aria-hidden className={`flex h-7 w-7 items-center justify-center rounded-full text-base leading-none ${count ? "bg-lime text-ink" : "bg-ink text-lime"} ${maxed ? "opacity-40" : ""}`}>+</button>
        </div>
      </div>
    );
  };

  return (
    <section ref={root} id="builder" className="relative overflow-x-clip px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1360px] items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* left: copy + live info */}
        <div className="order-2 lg:order-1 lg:sticky lg:top-24">
          <SectionHead label="Fai il mostro" icon="bolt" tilt={-4} l1="Costruisci" l2="il tuo mostro" align="left" />
          <ol className="mt-8 space-y-3">
            {[["Pane", "La base è già inclusa."], ["Ciccia e extra", "Scegli gli ingredienti dai gruppi qui sotto."], ["Chiudi e ordina", "Aggiungi il pane superiore per completare il burger."]].map(([t, d], i) => (
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
              <div><p className="text-xs uppercase tracking-wider text-cream/50">Strati</p><p className="font-display text-4xl tabular-nums">{fill.length}<span className="text-lg text-cream/50">/{MAX}</span></p></div>
            </div>
            {layers.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Strati, tocca per togliere">
                {layers.filter((l) => l.ing.id !== "bun-bottom").map((l) => (
                  <li key={l.uid}><button onClick={() => remove(l.uid)} className="rounded-full bg-cream/10 px-3 py-1 text-xs hover:bg-lime hover:text-ink" aria-label={`Togli ${l.ing.name}`}>{l.ing.name} ✕</button></li>
                ))}
                {closed && <li><button onClick={() => setClosed(false)} className="rounded-full bg-cream/10 px-3 py-1 text-xs hover:bg-lime hover:text-ink">Pane sopra · rimuovi</button></li>}
              </ul>
            )}
            {/* Fallo menu */}
            <div className={`mt-5 rounded-[22px] p-3 transition-colors ${asMenu ? "bg-lime text-ink" : "bg-cream/10"}`}>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={asMenu} onChange={(e) => setAsMenu(e.target.checked)} className="peer sr-only" data-menu-toggle />
                <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${asMenu ? "bg-ink" : "bg-cream/30"}`}><span className={`absolute top-1 h-5 w-5 rounded-full transition-transform ${asMenu ? "translate-x-6 bg-lime" : "translate-x-1 bg-cream"}`} /></span>
                <span className="flex-1"><span className="block font-bold uppercase tracking-wider">Fallo menu <span className="tabular-nums">+{euro(MENU_UPGRADE)}</span></span><span className={`block text-xs ${asMenu ? "text-ink/70" : "text-cream/60"}`}>Patatine Sbrano e una bibita a scelta.</span></span>
                <span className="flex -space-x-3" aria-hidden>
                  <span className="relative h-10 w-10 rounded-full bg-cream"><Image src={MENU_FRIES.img} alt="" fill sizes="40px" className="object-contain p-1" /></span>
                  <span className="relative h-10 w-10 rounded-full" style={{ background: drinkObj.tint }}><Image src={drinkObj.img} alt="" fill sizes="40px" className="object-contain p-1" /></span>
                </span>
              </label>
              {asMenu && (
                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Scegli la bibita">
                  {DRINKS.map((d) => (
                    <button key={d.id} type="button" role="radio" aria-checked={drink === d.id} onClick={() => setDrink(d.id)} data-drink={d.id}
                      className={`flex items-center gap-1.5 rounded-full border-2 py-0.5 pl-0.5 pr-3 text-xs font-bold ${drink === d.id ? "border-ink bg-ink text-lime" : "border-ink/20 bg-white/60 text-ink"}`}>
                      <span className="relative h-7 w-7 overflow-hidden rounded-full border border-ink/20" style={{ background: d.tint }}><Image src={d.img} alt="" fill sizes="28px" className="object-contain p-0.5" /></span>{d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={order} className="group flex items-center gap-1" data-builder-order>
                <span className="flex h-12 items-center rounded-full bg-lime px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">Aggiungi all&apos;ordine</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-xl text-ink transition-transform duration-500 group-hover:rotate-90">+</span>
              </button>
              <button onClick={reset} className="h-12 rounded-full border-2 border-cream/30 px-5 text-xs font-bold uppercase tracking-wider hover:border-lime hover:text-lime">Ricomincia</button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-lime/80" aria-live="polite">{toast}</p>
          </div>
        </div>

        {/* right: plate + grouped picker */}
        <div className="b-orbit relative order-1 lg:order-2">
          <div ref={plateRef} className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="b-ringline absolute inset-[6%] rounded-full border-2 border-dashed border-ink/25" />
            <div className="b-ringline absolute inset-0 hidden rounded-full border-2 border-ink/10 md:block" />
            <div className="absolute inset-[14%] rounded-full bg-lime" />
            {/* stack */}
            <div className="absolute inset-x-0 bottom-[26%] flex justify-center">
              <div className="relative h-[300px] w-[260px]">
                <div ref={stackRef} className="absolute inset-0" aria-label="Il tuo burger">
                  <div className="absolute -bottom-3 left-1/2 h-6 w-[90%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-sm" />
                  <div className="absolute inset-0 origin-bottom transition-transform duration-500" style={{ transform: `scale(${fit})` }}>
                    {layers.map((l, i) => (
                      <div key={l.uid} className="absolute bottom-0 left-1/2 transition-transform duration-500 ease-[cubic-bezier(.3,1.5,.5,1)]"
                        style={{ width: `${l.ing.w}%`, transform: `translate(-50%, ${-offsets[i]}px)`, zIndex: i + 1 }}>
                        <div data-layer={l.uid} onClick={() => l.ing.id !== "bun-bottom" && remove(l.uid)} className={`relative w-full ${l.ing.id !== "bun-bottom" ? "cursor-pointer" : ""}`} style={{ aspectRatio: l.ing.ratio }}>
                          <Image src={l.ing.img} alt={l.ing.name} fill sizes="280px" className="object-contain object-bottom" />
                        </div>
                      </div>
                    ))}
                    {closed && (
                      <div className="absolute bottom-0 left-1/2 transition-transform duration-500" style={{ width: `${BUN_TOP.w}%`, transform: `translate(-50%, ${-topOffset}px)`, zIndex: 50 }}>
                        <div data-layer="top" onClick={() => setClosed(false)} className="relative w-full cursor-pointer" style={{ aspectRatio: BUN_TOP.ratio }}>
                          <Image src={BUN_TOP.img} alt="Pane sopra" fill sizes="280px" className="object-contain object-bottom" />
                        </div>
                      </div>
                    )}
                  </div>
                  {!layers.length && (
                    <p className="absolute inset-x-0 bottom-10 text-center font-display text-2xl uppercase leading-none text-ink/50">Inizia a comporre il tuo burger.<br />Scegli gli ingredienti dal menu.</p>
                  )}
                </div>
              </div>
            </div>
            {/* close button */}
            <button onClick={closeTop} disabled={closed} className="absolute bottom-[12%] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink py-1 pl-1 pr-4 text-xs font-bold uppercase tracking-wider text-lime transition-transform hover:scale-105 disabled:opacity-40">
              <span className="relative h-8 w-8 rounded-full bg-lime"><Image src={BUN_TOP.img} alt="" fill sizes="32px" className="object-contain p-0.5" /></span>
              {closed ? "Chiuso" : "Completa con il pane sopra."}
            </button>
            {/* mascot */}
            <div className="absolute right-0 top-0 z-[70] flex flex-col items-end">
              <div className="relative max-w-[180px] rounded-[18px] rounded-br-none bg-ink px-3 py-2 text-xs font-bold text-cream md:max-w-[200px] md:text-sm" aria-live="polite">{mood.say}</div>
              <div ref={mascotRef} className="relative mt-1 h-20 w-20 rounded-full border-[3px] border-ink bg-cream md:h-24 md:w-24">
                <Image key={mood.img} src={mood.img} alt="Mascotte SBRANO" fill sizes="96px" className="object-contain p-1.5" />
              </div>
            </div>
          </div>

          {/* grouped ingredient picker */}
          <div className="b-picker mt-6 rounded-[28px] bg-white/60 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/60">Ingredienti</p>
              <p className={`text-xs font-bold uppercase tracking-wider tabular-nums ${full ? "text-red-600" : "text-ink/60"}`}>{full ? `Stack pieno ${fill.length}/${MAX}` : `${fill.length}/${MAX} strati · massimo ${PER} per ingrediente`}</p>
            </div>
            <div className="space-y-4">
              {ING_GROUPS.map((g) => (
                <div key={g.id} className="b-group" role="group" aria-label={g.label}>
                  <p className="mb-2 flex items-baseline gap-2 px-1"><span className="font-display text-xl uppercase leading-none">{g.label}</span><span className="text-xs text-ink/50">{g.hint}</span></p>
                  <div className="grid grid-cols-1 gap-2 min-[460px]:grid-cols-2">
                    {INGREDIENTS.filter((i) => i.group === g.id).map((ing) => <Chip key={ing.id} ing={ing} />)}
                  </div>
                </div>
              ))}
            </div>
            {full && <p className="mt-3 rounded-2xl bg-ink px-4 py-2 text-sm text-lime" role="status">Hai raggiunto {MAX} strati. Rimuovine uno (−) per aggiungerne altri.</p>}
            {!full && toast && <p className="mt-3 px-1 text-sm text-ink/70" role="status">{toast}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
