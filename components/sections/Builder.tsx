"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { INGREDIENTS, BREADS, DRINKS, FRIES, MENU_UPGRADE, euro, type Ingredient, type IngGroup } from "@/lib/data";
import { stackLayout, composeBurger } from "@/lib/stack";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";
import Tick from "../ui/Tick";

type Layer = { uid: number; ing: Ingredient };
/** total filling layers (buns excluded) and max copies of the same ingredient */
const MAX = 40;
const PER = 5;
/** logical px between the stack and the floating (open) top bun */
const GAP = 64;
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

type Tab = "pane" | IngGroup | "menu";
const TABS: { id: Tab; label: string; step: number }[] = [
  { id: "pane", label: "Pane", step: 0 },
  { id: "base", label: "Carne", step: 1 },
  { id: "formaggi", label: "Formaggi", step: 2 },
  { id: "verdure", label: "Verdure", step: 2 },
  { id: "salse", label: "Salse", step: 2 },
  { id: "croccanti", label: "Extra", step: 2 },
  { id: "menu", label: "Menu", step: 2 },
];
const STEPS = [
  { t: "Pane", d: "La base di tutto." },
  { t: "Carne e proteine", d: "Scegli la tua fonte di potere." },
  { t: "Aggiungi il resto", d: "Formaggi, verdure, salse, extra." },
  { t: "Chiudi il tuo burger", d: "Aggiungi il pane superiore e completa il tuo mostro." },
];
/** Marker notes: next to the active step on desktop, on the stage on mobile */
const NOTES = ["Parti dal pane, campione.", "Qui si decide chi sei.", "Ora sporcalo per bene.", "Chiudilo e sbranalo."];
/** short stage hint on desktop (the step note already sits next to the steps there) */
const HINTS = ["Scegli il pane", "Ora la carne", "Aggiungi il resto", "Chiudi il burger"];
const PRELOAD = [...INGREDIENTS.map((i) => i.img), ...BREADS.flatMap((b) => [b.bottom.img, b.top.img]),
  ...FRIES.map((f) => f.img), ...DRINKS.map((d) => d.img), ...["waving", "eating-burger", "running", "crown-thumbs-up"].map((m) => `/assets/mascot/${m}.webp`)];

const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden><path d="M4.5 10.5l3.6 3.6L15.5 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function Builder() {
  const root = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const uid = useRef(1);
  const [fillLayers, setFill] = useState<Layer[]>([]);
  const [breadId, setBreadId] = useState(BREADS[0].id);
  const [breadPicked, setBreadPicked] = useState(false);
  const [closed, setClosed] = useState(false);
  const [toast, setToast] = useState("");
  const [asMenu, setAsMenu] = useState(false);
  const [drink, setDrink] = useState(DRINKS[0].id);
  const [fries, setFries] = useState(FRIES[0].id);
  const [tab, setTab] = useState<Tab>("pane");
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false); // mobile summary expanded
  const [warm, setWarm] = useState(false);
  const drinkObj = DRINKS.find((d) => d.id === drink) ?? DRINKS[0];
  const friesObj = FRIES.find((f) => f.id === fries) ?? FRIES[0];
  const bread = BREADS.find((b) => b.id === breadId) ?? BREADS[0];
  const { add, announce } = useCart();
  const { contextSafe } = useGSAP({ scope: root });

  const fill = fillLayers.map((l) => l.ing);
  const all = [bread.bottom, ...fill, ...(closed ? [bread.top] : [])];
  const burgerPrice = fill.length ? all.reduce((a, i) => a + i.price, 0) + 2.0 : 0; // +2€ mano d'opera & amore
  const price = burgerPrice + (asMenu && fill.length ? MENU_UPGRADE : 0);
  const kcal = fill.length ? all.reduce((a, i) => a + i.kcal, 0) : 0;
  const name = makeName(fill, closed);
  const spicy = fill.some((f) => f.spicy);
  const full = fill.length >= MAX;
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    fill.forEach((f) => { m[f.id] = (m[f.id] ?? 0) + 1; });
    return m;
  }, [fill]);
  const hasProtein = fill.some((f) => f.group === "base");
  const done = [breadPicked || fill.length > 0, hasProtein, fill.some((f) => f.group !== "base"), closed];
  const active = closed ? 3 : step;

  const mood = useMemo(() => {
    if (!fill.length && !closed) return { img: "/assets/mascot/waving.webp", say: "Scegli un ingrediente per iniziare." };
    if (fill.length >= MAX) return { img: "/assets/mascot/eating-burger.webp", say: "Hai raggiunto il numero massimo di strati." };
    if (fill.length >= 30) return { img: "/assets/mascot/running.webp", say: "Per aggiungere un ingrediente, rimuovine uno." };
    if (fill.length >= 20) return { img: "/assets/mascot/eating-burger.webp", say: "Il tuo burger prende forma." };
    if (fill.length >= 12) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Una combinazione generosa." };
    if (fill.filter((f) => f.id === "patty").length >= 3) return { img: "/assets/mascot/eating-burger.webp", say: "La tua selezione è pronta." };
    if (spicy) return { img: "/assets/mascot/running.webp", say: "Aggiungi una bibita se vuoi." };
    if (closed && fill.length >= 4) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Ingredienti selezionati." };
    if (closed) return { img: "/assets/mascot/crown-thumbs-up.webp", say: "Burger completato." };
    return { img: "/assets/mascot/eating-burger.webp", say: fill.length ? "Continua a comporre il tuo burger." : "Scegli proteine e ingredienti." };
  }, [fill, spicy, closed]);
  const hint = closed ? "Pronto da ordinare" : full ? "Stack pieno" : active === 0 && fill.length ? "Scegli il pane" : HINTS[active];
  const note = closed ? "Pronto. Sbranalo." : full ? "La piastra è piena." : NOTES[active];

  // milestone stickers slapped on the summary card (20 layers, the 40 limit, burger closed)
  const [slap, setSlap] = useState<{ k: number; t: string; r: number } | null>(null);
  const prevLen = useRef(0);
  const prevClosed = useRef(false);
  useEffect(() => {
    const n = fill.length, p = prevLen.current, pc = prevClosed.current;
    prevLen.current = n; prevClosed.current = closed;
    const put = (t: string) => setSlap({ k: Date.now(), t, r: Math.round(Math.random() * 16 - 8) });
    if (!n) setSlap(null);
    else if (closed && !pc) put("Mostro completo. Prezzo giusto, come promesso.");
    else if (!closed && pc) setSlap(null);
    else if (n >= MAX && p < MAX) put("Basta. La piastra si rifiuta.");
    else if (n >= 20 && p < 20) put("Ok, ora fai paura.");
    else if (n < 20 && p >= 20 && !closed) setSlap(null);
  }, [fill.length, closed]);
  useEffect(() => {
    if (!slap || reduced()) return;
    gsap.fromTo(root.current!.querySelectorAll(".b-slap"), { scale: 1.6, opacity: 0, rotate: slap.r * 2 }, { scale: 1, opacity: 1, rotate: slap.r, duration: 0.5, ease: "elastic.out(1, 0.5)", overwrite: true });
    // mascot reacts: a hop and a head tilt, like the glasses just flew up
    if (mascotRef.current) gsap.fromTo(mascotRef.current, { y: 0, rotate: 0 }, { y: -18, rotate: -10, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 3, overwrite: true });
  }, [slap]);

  // stack layout (shared with the cart snapshot renderer): bottom bun is always on the plate
  const stackIngs = [bread.bottom, ...fill];
  const { offsets, top: topOffset, height: stackH } = stackLayout(stackIngs);
  // auto-scale: the burger (plus the floating top bun while open) always fits the stage and the viewport
  const plateRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 560, h: 500, vh: 900 });
  useEffect(() => {
    const el = plateRef.current; if (!el) return;
    const upd = () => setBox({ w: el.offsetWidth, h: el.offsetHeight, vh: window.innerHeight });
    upd();
    const ro = new ResizeObserver(upd); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const widthFit = Math.min(1, (box.w * 0.5) / 260, (box.h * 0.6) / 260);
  const availH = Math.max(160, Math.min(box.h * 0.66, box.vh * 0.55));
  const fit = Math.min(widthFit, availH / Math.max(1, stackH + (closed ? 0 : GAP)));

  // warm the image cache before the section is reached: stage + card images never pop in
  useEffect(() => {
    const el = root.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setWarm(true); io.disconnect(); } }, { rootMargin: "1600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!warm) return;
    PRELOAD.forEach((src) => { const im = new window.Image(); im.decoding = "async"; im.src = src; });
  }, [warm]);

  const popMascot = contextSafe(() => {
    if (reduced()) return;
    gsap.fromTo(mascotRef.current, { scale: 0.8, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
  });
  const squash = contextSafe((delay = 0.3) => {
    if (reduced()) return;
    gsap.fromTo(stackRef.current, { scaleY: 1 }, { scaleY: 0.94, scaleX: 1.03, duration: 0.12, delay, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 100%", overwrite: true });
  });
  const dropIn = contextSafe((sel: string) => {
    if (reduced()) return;
    requestAnimationFrame(() => {
      const el = root.current?.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el, { y: -320, opacity: 0, rotate: gsap.utils.random(-14, 14) }, { y: 0, opacity: 1, rotate: 0, duration: 0.8, ease: "bounce.out", overwrite: true });
      squash();
    });
  });

  const toggleMenu = (on: boolean) => {
    setAsMenu(on);
    if (on) {
      setOpen(false); setTab("menu"); setStep(2);
      // mobile: bring the stage (fries + drink appear next to the burger) and the picker into view
      if (window.matchMedia("(max-width: 1023px)").matches) {
        const el = root.current?.querySelector<HTMLElement>(".b-orbit");
        if (el) setTimeout(() => (window.__lenis ? window.__lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: "smooth", block: "start" })), 60);
      }
    } else if (tab === "menu") { setTab("formaggi"); }
  };
  const goTab = (t: Tab) => { setOpen(false); setTab(t); setStep(TABS.find((x) => x.id === t)!.step); };
  const goStep = (i: number) => {
    if (i === 3) { setStep(3); closeTop(); return; }
    setStep(i);
    if (i === 0) setTab("pane");
    else if (i === 1) setTab("base");
    else if (TABS.find((x) => x.id === tab)?.step !== 2) setTab("formaggi");
  };
  const pickBread = (id: string) => {
    setBreadPicked(true);
    if (id !== breadId) { setBreadId(id); dropIn("[data-layer='bottom']"); popMascot(); }
    setToast("");
    if (!fill.length) setTimeout(() => goTab("base"), 450); // first time: move on to the protein
  };

  const addIng = (ing: Ingredient) => {
    if (fill.length >= MAX) { setToast(`Massimo ${MAX} strati. Rimuovine uno (−) per aggiungere ${ing.name}.`); return; }
    if ((counts[ing.id] ?? 0) >= PER) { setToast(`Puoi aggiungere al massimo ${PER} porzioni di ${ing.name}.`); return; }
    setToast(""); setOpen(false);
    floatUp(ing);
    const l = { uid: uid.current++, ing };
    setFill((f) => [...f, l]);
    setTimeout(() => dropIn(`[data-layer="${l.uid}"]`), 0);
    popMascot();
  };
  /** "+0,50 €" bubble rising from the card stepper */
  const floatUp = (ing: Ingredient) => {
    if (reduced()) return;
    const at = root.current?.querySelector(`[data-ing="${ing.id}"] [data-count]`)?.getBoundingClientRect();
    if (!at || !at.width) return;
    const d = document.createElement("span");
    d.textContent = `+${euro(ing.price)}`;
    d.className = "sb-float-up pointer-events-none fixed z-[90] rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-ink ring-2 ring-ink";
    Object.assign(d.style, { left: at.left - 14 + "px", top: at.top - 22 + "px" });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 850);
  };
  const closeTop = () => {
    if (!fill.length) { setToast("Seleziona almeno un ingrediente."); return; }
    if (closed) return;
    setClosed(true); setStep(3); squash(0.45); popMascot();
  };
  const remove = contextSafe((u: number) => {
    const el = root.current?.querySelector(`[data-layer="${u}"]`);
    const doIt = () => { setFill((ls) => ls.filter((l) => l.uid !== u)); setToast(""); };
    if (el && !reduced()) gsap.to(el, { x: 260, rotate: 40, opacity: 0, duration: 0.4, ease: "power2.in", onComplete: doIt });
    else doIt();
    popMascot();
  });
  const removeOne = (ing: Ingredient) => {
    const last = [...fillLayers].reverse().find((l) => l.ing.id === ing.id);
    if (last) remove(last.uid);
  };
  const reset = () => { setOpen(false); setFill([]); setClosed(false); setToast(""); setBreadId(BREADS[0].id); setBreadPicked(false); setAsMenu(false); goTab("pane"); popMascot(); };

  const order = () => {
    if (!fill.length) { setToast("Seleziona almeno un ingrediente."); return; }
    const ids = [bread.bottom.id, ...fill.map((f) => f.id), bread.top.id];
    const key = "custom-" + ids.join("-") + (asMenu ? `-menu-${friesObj.id}-${drinkObj.id}` : "");
    const finalPrice = Math.round((price + (closed ? 0 : bread.top.price)) * 100) / 100;
    const fillNames = fill.map((f) => f.name);
    const finalName = makeName(fill, true); // the order always closes the bun first
    const go = async () => {
      let img = "/assets/menu/sbranatore.webp";
      try { img = await composeBurger(ids); } catch { /* fallback: stacked component in cart */ }
      // the composed burger (and the menu sides) fly along a curve into the cart pill
      const ghost = stackRef.current;
      if (ghost && !reduced()) gsap.to(ghost, { opacity: 0.18, scale: 0.9, duration: 0.25, ease: "power2.out", onComplete: () => { gsap.to(ghost, { opacity: 1, scale: 1, duration: 0.6, delay: 0.75, ease: "back.out(2)" }); } });
      flyToCart(stackRef.current, asMenu ? [img, friesObj.img, drinkObj.img] : img, () => {
        add({ id: key, name: asMenu ? `Menu ${finalName}` : finalName, price: finalPrice, img, layers: ids, ingredients: fillNames,
          note: `Pane: ${bread.name}. Ingredienti: ${fillNames.join(", ")}`,
          ...(asMenu ? { menu: { fries: friesObj.full, drink: drinkObj.name, friesImg: friesObj.img, drinkImg: drinkObj.img } } : {}) });
        announce({ title: "Nel sacchetto!", sub: asMenu ? `Il tuo mostro con ${friesObj.full.toLowerCase()} e ${drinkObj.name} è nel carrello.` : "Il tuo mostro è nel carrello.", img });
        setToast("Aggiunto all’ordine."); setOpen(false);
      }, { big: true });
    };
    if (!closed) { closeTop(); setTimeout(go, 750); } else go();
  };

  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".b-line", { yPercent: 110, rotate: 3, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".b-head", start: "top 90%", once: true } });
    gsap.from(".b-ringline", { scale: 0.7, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, transformOrigin: "50% 50%", scrollTrigger: { trigger: ".b-orbit", start: "top 80%", once: true } });
  }, { scope: root });
  // cards of the new tab fade in (opacity/transform only: no layout shift)
  useGSAP(() => {
    if (reduced() || !cardsRef.current) return;
    cardsRef.current.scrollTo({ left: 0 });
    gsap.fromTo(cardsRef.current.querySelectorAll(`[data-panel="${tab}"] .b-card`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.04, overwrite: true });
  }, { dependencies: [tab], scope: root });

  /* ---------- pieces ---------- */
  const card = (opts: { key: string; img: string; name: string; desc?: string; priceLabel: string; selected: boolean; badge?: React.ReactNode; spicy?: boolean;
    main: React.ReactNode; foot: React.ReactNode }) => (
    <div key={opts.key} data-ing={opts.key} data-tilt
      className={`b-card relative flex w-[164px] shrink-0 snap-start flex-col rounded-[22px] border-2 bg-white p-2 transition-[border-color,box-shadow] duration-200 md:w-[172px] lg:w-[clamp(140px,11vw,172px)] ${opts.selected ? "border-lime shadow-[0_0_0_3px_#d6ff4d]" : "border-ink/10"}`}>
      <span aria-hidden className={`absolute -right-1.5 -top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-lime text-ink transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] ${opts.selected ? "scale-100" : "scale-0"}`}><Check className="h-4 w-4" /></span>
      {opts.main}
      <p className="mt-2 truncate px-1 text-[14px] font-bold leading-tight">{opts.name}{opts.spicy && <span aria-label="piccante"> 🌶</span>}</p>
      <p className="mt-0.5 line-clamp-2 h-[2.7em] px-1 text-[11.5px] leading-[1.35] text-ink/55">{opts.desc}</p>
      <div className="mt-1.5 flex h-8 items-center justify-between gap-1 pl-1">
        <span className={`text-[12.5px] font-bold tabular-nums ${opts.priceLabel === "Gratis" ? "uppercase tracking-wider text-ink/50" : ""}`}>{opts.priceLabel}</span>
        {opts.foot}
      </div>
    </div>
  );
  const thumb = (img: string, alt: string, sizes = "160px") => (
    <span className="relative block h-[92px] w-full overflow-hidden rounded-[16px] bg-cream">
      <Image src={img} alt={alt} fill sizes={sizes} loading="eager" className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105" />
    </span>
  );
  const ingCard = (ing: Ingredient) => {
    const count = counts[ing.id] ?? 0;
    const maxed = full || count >= PER;
    return card({
      key: ing.id, img: ing.img, name: ing.name, desc: ing.desc, priceLabel: `+${euro(ing.price)}`, selected: count > 0, spicy: ing.spicy,
      main: (
        <button type="button" onClick={() => addIng(ing)} aria-label={`Aggiungi ${ing.name}, ${euro(ing.price)}`} aria-disabled={maxed}
          className={`group block w-full text-left transition-transform active:scale-[0.97] ${maxed ? "opacity-60" : ""}`}>{thumb(ing.img, "")}</button>
      ),
      foot: (
        <span className="flex h-8 items-center rounded-full bg-ink p-0.5 text-lime">
          <button type="button" onClick={() => removeOne(ing)} disabled={!count} aria-label={`Togli un ${ing.name}`} className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none hover:bg-cream/15 disabled:opacity-30">−</button>
          <span className="w-4 text-center text-xs font-bold tabular-nums" data-count><span key={count} className={count ? "sb-pop inline-block" : "inline-block"}>{count}</span></span>
          <button type="button" onClick={() => addIng(ing)} tabIndex={-1} aria-hidden className={`flex h-7 w-7 items-center justify-center rounded-full bg-lime text-base leading-none text-ink ${maxed ? "opacity-40" : ""}`}>+</button>
        </span>
      ),
    });
  };
  const breadCard = (b: (typeof BREADS)[number]) => {
    const sel = b.id === breadId;
    return card({
      key: "bread-" + b.id, img: b.top.img, name: b.name, desc: b.desc, priceLabel: b.extra ? `+${euro(b.extra)}` : "Gratis", selected: sel,
      main: (
        <button type="button" role="radio" aria-checked={sel} onClick={() => pickBread(b.id)} aria-label={`${b.name}, ${b.extra ? "+" + euro(b.extra) : "gratis"}`} data-bread={b.id}
          className="group block w-full text-left transition-transform active:scale-[0.97]">{thumb(b.top.img, "")}</button>
      ),
      foot: (
        <button type="button" tabIndex={-1} aria-hidden onClick={() => pickBread(b.id)}
          className={`flex h-8 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wider ${sel ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{sel ? "Scelto" : "Scegli"}</button>
      ),
    });
  };

  const tile = (o: { key: string; img: string; name: string; desc: string; sel: boolean; onPick: () => void; data: Record<string, string>; tint?: string }) => (
    <button key={o.key} type="button" role="radio" aria-checked={o.sel} onClick={o.onPick} {...o.data} data-tilt
      className={`b-card group relative flex w-[calc((100vw-84px)/3)] max-w-[150px] shrink-0 flex-col items-center md:w-[150px] rounded-[22px] border-2 bg-white p-2 pb-2.5 text-center transition-[border-color,box-shadow] duration-200 ${o.sel ? "border-lime shadow-[0_0_0_3px_#d6ff4d]" : "border-ink/10 hover:border-ink/30"}`}>
      <span aria-hidden className={`absolute -right-1.5 -top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-lime text-ink transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] ${o.sel ? "scale-100" : "scale-0"}`}><Check className="h-4 w-4" /></span>
      <span className="relative block aspect-square w-full overflow-hidden rounded-[16px]" style={{ background: o.tint ?? "#f6ebd7" }}>
        <Image src={o.img} alt="" fill sizes="150px" loading="eager" className={`object-contain p-1.5 transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] group-hover:-rotate-6 group-hover:scale-110 ${o.sel ? "scale-105" : ""}`} />
      </span>
      <span className="mt-2 block text-[13px] font-bold leading-tight md:text-[14px]">{o.name}</span>
      <span className="mt-0.5 hidden text-[11px] leading-tight text-ink/55 md:block">{o.desc}</span>
    </button>
  );
  const menuPicker = (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Scegli le patatine">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Patatine</p>
        <div className="flex gap-3">{FRIES.map((f) => tile({ key: f.id, img: f.img, name: f.name, desc: f.desc, sel: fries === f.id, onPick: () => setFries(f.id), data: { "data-fries": f.id } }))}</div>
      </div>
      <div role="radiogroup" aria-label="Scegli la bibita">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Bibita</p>
        <div className="flex gap-3">{DRINKS.map((d) => tile({ key: d.id, img: d.img, name: d.name, desc: "Alla spina, refill disponibile.", sel: drink === d.id, onPick: () => setDrink(d.id), data: { "data-drink": d.id }, tint: d.tint }))}</div>
      </div>
    </div>
  );

  return (
    <section ref={root} id="builder" aria-labelledby="b-title" className="relative overflow-x-clip px-4 pb-10 pt-20 md:px-10 md:pb-28 md:pt-28">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
        {/* 1. head */}
        <div className="b-head lg:col-start-1 lg:row-start-1">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-ink/70"><span>01 / Builder</span><span aria-hidden className="h-px w-16 bg-ink/40" /></p>
          <h2 id="b-title" className="mt-4 font-display text-[12.4vw] uppercase leading-[0.86] md:text-[clamp(52px,7vw,84px)] lg:text-[clamp(48px,4.7vw,84px)]">
            <span className="block overflow-hidden pb-[0.06em]"><span className="b-line block whitespace-nowrap">Costruisci</span></span>
            <span className="block overflow-hidden pb-[0.06em]"><span className="b-line block whitespace-nowrap">il tuo mostro</span></span>
          </h2>
          <p className="mt-4 max-w-[25rem] text-base text-ink/70 md:text-lg">Scegli gli ingredienti, strato dopo strato. Il tuo burger prende forma qui.</p>
        </div>

        {/* 2. steps: compact horizontal stepper on mobile, cards on desktop */}
        <ol className="relative grid grid-cols-4 gap-1 lg:col-start-1 lg:row-start-2 lg:grid-cols-1 lg:gap-2.5" aria-label="Passaggi">
          <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-ink/15 lg:hidden" />
          {STEPS.map((s, i) => {
            const on = active === i;
            return (
              <li key={s.t} className="relative">
                <button type="button" onClick={() => goStep(i)} aria-current={on ? "step" : undefined} data-step={i + 1}
                  className={`flex w-full flex-col items-center gap-1.5 text-center transition-colors lg:flex-row lg:items-center lg:gap-4 lg:rounded-[22px] lg:border-2 lg:p-3 lg:pr-5 lg:text-left ${on ? "lg:border-ink lg:bg-white" : "lg:border-transparent lg:bg-white/55 lg:hover:bg-white/80"}`}>
                  <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-lime transition-shadow duration-300 lg:h-11 lg:w-11 lg:text-xl ${on ? "shadow-[0_0_0_3px_#f6ebd7,0_0_0_6px_#d6ff4d]" : ""}`}>
                    {i + 1}
                    {done[i] && !on && <span aria-label="completato" className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-ink bg-lime text-ink"><Check className="h-3 w-3" /></span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[10px] font-bold uppercase leading-tight tracking-wider lg:text-[15px] ${on ? "text-ink" : "text-ink/70"}`}>{s.t}</span>
                    <span className="hidden text-sm text-ink/60 lg:block">{s.d}</span>
                  </span>
                </button>
                {on && <span key={note} aria-hidden className="sb-note pointer-events-none absolute -bottom-3.5 right-4 z-10 hidden rounded-md bg-cream px-2 pt-1 font-marker text-[15px] leading-none text-ink shadow-[0_0_0_2px_#111] lg:block xl:text-[17px]" style={{ ["--r" as string]: i % 2 ? "2deg" : "-3deg" } as React.CSSProperties}>{note}</span>}
              </li>
            );
          })}
        </ol>

        {/* 3. stage */}
        <div className="b-orbit relative isolate lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-end">
          <div ref={plateRef} className="relative mx-auto aspect-[1.12/1] w-full max-w-[680px] lg:aspect-auto lg:h-[clamp(400px,calc(100svh-400px),600px)]">
            <svg aria-hidden viewBox="0 0 112 100" className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 overflow-visible" style={{ aspectRatio: "1.12" }}>
              <circle className="b-ringline" cx="56" cy="51" r="49.5" fill="none" stroke="#111" strokeOpacity=".14" strokeWidth=".25" />
              <circle className="b-ringline" cx="56" cy="51" r="46.5" fill="none" stroke="#111" strokeOpacity=".28" strokeWidth=".3" strokeDasharray="1 1.4" />
            </svg>
            <div className="absolute left-1/2 top-[51%] aspect-square h-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime" />
            <svg aria-hidden viewBox="0 0 112 100" className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2" style={{ aspectRatio: "1.12" }}>
              <circle cx="56" cy="51" r="35" fill="none" stroke="#111" strokeOpacity=".1" strokeWidth=".25" />
              <circle cx="56" cy="51" r="26" fill="none" stroke="#111" strokeOpacity=".08" strokeWidth=".25" />
              <g className="sb-orbit" style={{ transformOrigin: "56px 51px" }}><circle cx="56" cy="4.5" r="1.1" fill="#111" /></g>
            </svg>
            {/* Fallo menu: fries + drink slide in next to the burger */}
            {asMenu && (
              <>
                <button type="button" onClick={() => goTab("menu")} aria-label={`Patatine: ${friesObj.full}. Cambia`} data-stage-side="fries"
                  className="sb-side-l absolute bottom-[15%] left-[1%] z-[4] aspect-square w-[24%] max-w-[150px] lg:left-[4%] lg:w-[21%]">
                  <span key={friesObj.id} className="sb-pop relative block h-full w-full"><Image src={friesObj.img} alt="" fill sizes="150px" className="object-contain object-bottom drop-shadow-[0_10px_10px_rgba(0,0,0,.25)]" /></span>
                </button>
                <button type="button" onClick={() => goTab("menu")} aria-label={`Bibita: ${drinkObj.name}. Cambia`} data-stage-side="drink"
                  className="sb-side-r absolute bottom-[15%] right-[1%] z-[4] aspect-[3/4] w-[20%] max-w-[124px] lg:right-[5%] lg:w-[17%]">
                  <span key={drinkObj.id} className="sb-pop relative block h-full w-full"><Image src={drinkObj.img} alt="" fill sizes="124px" className="object-contain object-bottom drop-shadow-[0_10px_10px_rgba(0,0,0,.25)]" /></span>
                </button>
              </>
            )}
            {/* stack */}
            <div className="absolute inset-x-0 bottom-[19%] flex justify-center">
              <div className="relative h-[300px] w-[260px]">
                <div ref={stackRef} className="absolute inset-0" aria-label="Il tuo burger">
                  <div className="absolute -bottom-3 left-1/2 h-6 w-[90%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-sm" />
                  <div className="absolute inset-0 origin-bottom transition-transform duration-500" style={{ transform: `scale(${fit})` }}>
                    {stackIngs.map((ing, i) => {
                      const l = i ? fillLayers[i - 1] : null;
                      return (
                        <div key={l ? l.uid : "bottom-" + bread.id} className="absolute bottom-0 left-1/2 transition-transform duration-500 ease-[cubic-bezier(.3,1.5,.5,1)]"
                          style={{ width: `${ing.w}%`, transform: `translate(-50%, ${-offsets[i]}px)`, zIndex: i + 1 }}>
                          <div data-layer={l ? l.uid : "bottom"} onClick={() => l && remove(l.uid)} className={`relative w-full ${l ? "cursor-pointer" : ""}`} style={{ aspectRatio: ing.ratio }}>
                            <Image src={ing.img} alt={ing.name} fill sizes="280px" priority={!l} className="object-contain object-bottom" />
                          </div>
                        </div>
                      );
                    })}
                    {/* top bun: floats above while open, drops on as the closing step */}
                    <div className="absolute bottom-0 left-1/2 transition-transform duration-[650ms] ease-[cubic-bezier(.34,1.5,.6,1)]"
                      style={{ width: `${bread.top.w}%`, transform: `translate(-50%, ${-(topOffset + (closed ? 0 : GAP))}px)`, zIndex: 50 }}>
                      <div data-layer="top" role="button" tabIndex={0} aria-label={closed ? "Togli il pane sopra" : "Chiudi con il pane sopra"}
                        onClick={() => (closed ? setClosed(false) : closeTop())} onKeyDown={(e) => e.key === "Enter" && (closed ? setClosed(false) : closeTop())}
                        className={`relative w-full cursor-pointer ${closed ? "" : "sb-bob"}`} style={{ aspectRatio: bread.top.ratio }}>
                        <Image key={bread.top.id} src={bread.top.img} alt="Pane sopra" fill sizes="280px" priority className="object-contain object-bottom" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* close button */}
            <button onClick={closeTop} disabled={closed} className="absolute bottom-[2%] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink py-1 pl-1 pr-4 text-[11px] font-bold uppercase tracking-wider text-lime transition-transform hover:scale-105 disabled:opacity-40 md:text-xs">
              <span className="relative h-7 w-7 rounded-full bg-lime md:h-8 md:w-8"><Image src={bread.top.img} alt="" fill sizes="32px" className="object-contain p-0.5" /></span>
              {closed ? "Chiuso" : "Completa con il pane sopra."}
            </button>
            {slap && <span key={slap.k} role="status" className="b-slap sb-tag pointer-events-none absolute left-0 top-[34%] z-[70] max-w-[46%] whitespace-normal bg-lime font-marker text-[15px] text-ink md:text-[18px] lg:hidden" style={{ transform: `rotate(${slap.r}deg)` }}>{slap.t}</span>}
            {/* handwritten hint + waving mascot */}
            <div className="pointer-events-none absolute right-0 top-0 z-[70] flex w-[34%] max-w-[230px] flex-col items-end text-right">
              <div className="flex items-start gap-1">
                <p className="mt-1 rotate-[-5deg] font-marker text-[14px] leading-[1.12] md:text-[19px] lg:text-[clamp(17px,1.4vw,23px)]" aria-live="polite"><span key={note} className="sb-pop-in inline-block lg:hidden">{note}</span><span key={hint} className="sb-pop-in hidden lg:inline-block">{hint}</span></p>
                <div className="relative h-12 w-12 shrink-0 md:h-16 md:w-16"><Image src="/assets/mascot/waving.webp" alt="" fill sizes="64px" className="object-contain" /></div>
              </div>
              <svg aria-hidden viewBox="0 0 120 70" className="mr-[30%] mt-0.5 h-auto w-[52%] text-ink">
                <path d="M112 6 C 96 40, 62 58, 14 58" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M26 47 L 12 58 L 27 66" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. ingredient panel */}
        <div className="rounded-[28px] border border-ink/10 bg-[#fbf4e6] p-3 md:p-5 lg:col-start-2 lg:row-start-3 lg:self-start">
          <div className="flex flex-col-reverse gap-3">
            <div role="tablist" aria-label="Categorie" className="no-scrollbar -mx-3 flex min-w-0 gap-1.5 overflow-x-auto px-3 md:mx-0 md:px-0">
              {TABS.filter((t) => t.id !== "menu" || asMenu).map((t) => {
                const n = t.id === "pane" || t.id === "menu" ? 0 : fill.filter((f) => f.group === t.id).length;
                const on = tab === t.id;
                return (
                  <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => goTab(t.id)} data-tab={t.id}
                    className={`sb-lift flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 text-[12px] lg:h-9 lg:px-3.5 lg:text-[11px] font-bold uppercase tracking-wider transition-colors ${t.id === "menu" ? (on ? "sb-pop-in border-ink bg-ink text-lime" : "sb-pop-in border-ink bg-white text-ink") : on ? "border-ink bg-lime text-ink" : "border-ink/12 bg-white text-ink/80 hover:border-ink/40"}`}>
                    {t.label}
                    {n > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] tabular-nums text-lime">{n}</span>}
                  </button>
                );
              })}
            </div>
            <p className="flex items-baseline gap-2 px-1 text-[11px] font-bold uppercase leading-tight tracking-wider md:justify-end">
              <span className={`tabular-nums ${full ? "text-red-600" : ""}`}>{fill.length}/{MAX} strati</span>
              <span className="text-ink/50">Massimo {PER} per ingrediente</span>
            </p>
          </div>
          <div ref={cardsRef} className="no-scrollbar -mx-3 mt-4 snap-x snap-mandatory overflow-x-auto scroll-pl-3 px-3 pb-2 pt-2 md:-mx-5 md:px-5">
            {TABS.filter((t) => (warm || t.id === tab) && (t.id !== "menu" || asMenu)).map((t) => (
              <div key={t.id} role="tabpanel" data-panel={t.id} hidden={t.id !== tab} className="flex w-max gap-3">
                {t.id === "pane" ? BREADS.map(breadCard) : t.id === "menu" ? menuPicker : INGREDIENTS.filter((i) => i.group === t.id).map(ingCard)}
              </div>
            ))}
          </div>
          <p className={`mt-2 min-h-5 px-1 text-sm ${full ? "text-red-600" : "text-ink/70"}`} role="status">{full ? `Hai raggiunto ${MAX} strati. Rimuovine uno (−) per aggiungerne altri.` : toast}</p>
        </div>

        {/* 5. summary: sticky compact bar on mobile, full card on desktop */}
        <div className="sticky bottom-3 z-[80] lg:relative lg:col-start-1 lg:row-start-3">
          {slap && <span key={slap.k} aria-hidden className="b-slap sb-tag pointer-events-none absolute -right-7 top-[30%] z-10 hidden max-w-[260px] whitespace-normal bg-lime font-marker text-[clamp(17px,1.35vw,22px)] text-ink lg:inline-flex" style={{ transform: `rotate(${slap.r}deg)` }}>{slap.t}</span>}
          <div className="max-h-[78svh] overflow-y-auto rounded-[28px] bg-ink p-3 text-cream shadow-[0_18px_40px_-12px_rgba(0,0,0,.45)] md:p-5 lg:max-h-none lg:overflow-visible lg:p-6 lg:shadow-none">
            {/* mobile header */}
            <div className="flex items-center gap-2 lg:hidden">
              <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 pl-1 text-left">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream/10 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
                  <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M5 12.5l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-[17px] uppercase leading-tight text-lime">{fill.length ? name : "Il tuo Sbrano"}</span>
                  <span className="block truncate text-[11px] text-cream/60">{toast || `${fill.length}/${MAX} strati · ${kcal} kcal`}</span>
                </span>
              </button>
              <button onClick={order} className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-lime px-4 text-[12px] font-bold uppercase tracking-wider text-ink" data-builder-order-mobile aria-label={`Aggiungi all’ordine, ${euro(price)}`}>
                <Tick value={price} format={euro} /><span aria-hidden className="text-lg leading-none">+</span>
              </button>
            </div>

            <div className={`${open ? "mt-4 block" : "hidden"} lg:mt-0 lg:block`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50">Il tuo Sbrano</p>
                  <p className={`mt-1.5 min-h-[2em] font-display uppercase leading-[1] text-lime ${name.length > 44 && fill.length ? "text-[22px] md:text-[clamp(22px,1.9vw,30px)]" : "text-[26px] md:text-[clamp(26px,2.3vw,38px)]"}`} aria-live="polite">{fill.length ? name : "Il tuo burger, come lo vuoi tu."}</p>
                  <p className="mt-2 min-h-5 text-sm text-cream/60">{mood.say}</p>
                </div>
                <div className="relative hidden w-[30%] max-w-[132px] shrink-0 sm:block">
                  <div ref={mascotRef} className="relative aspect-square w-full">
                    <Image key={mood.img} src={mood.img} alt="Mascotte SBRANO" fill sizes="132px" className="object-contain invert" />
                  </div>
                  <p aria-hidden className="absolute -left-5 bottom-1 rotate-[-9deg] font-display text-[15px] uppercase leading-none text-lime md:text-[17px]">Zero<br />limiti.</p>
                  <svg aria-hidden viewBox="0 0 60 10" className="absolute -left-6 -bottom-2 w-14 rotate-[-9deg] text-lime"><path d="M2 6 C 15 2, 30 9, 58 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 divide-x divide-cream/15 rounded-[20px] border border-cream/15">
                {([["Prezzo", price, euro, ""], ["Energia", kcal, undefined, "kcal"], ["Strati", fill.length, undefined, `/${MAX}`]] as const).map(([l, v, f, u]) => (
                  <div key={l} className="px-3 py-2.5 md:px-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50">{l}</p>
                    <p className="whitespace-nowrap font-display text-[22px] leading-tight tabular-nums md:text-[clamp(22px,2vw,30px)]"><Tick value={v} format={f} />{u && <span className="text-[0.55em] text-cream/50"> {u}</span>}</p>
                  </div>
                ))}
              </div>

              {/* Fallo menu */}
              <div className={`mt-3 rounded-[22px] p-3 transition-colors ${asMenu ? "bg-lime text-ink" : "bg-cream/10"}`}>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={asMenu} onChange={(e) => toggleMenu(e.target.checked)} className="peer sr-only" data-menu-toggle />
                  <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-lime ${asMenu ? "bg-ink" : "bg-cream/30"}`}><span className={`sb-knob absolute top-1 h-5 w-5 rounded-full ${asMenu ? "translate-x-6 bg-lime" : "translate-x-1 bg-cream"}`} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold uppercase tracking-wider">Fallo menu <span className="tabular-nums">+{euro(MENU_UPGRADE)}</span></span><span className={`block text-xs ${asMenu ? "text-ink/70" : "text-cream/60"}`}>{asMenu ? `${friesObj.full} e ${drinkObj.name}.` : "Patatine Sbrano e una bibita a scelta."}</span></span>
                  <span className="flex shrink-0 -space-x-3" aria-hidden>
                    <span key={friesObj.id} className="sb-pop relative h-10 w-10 rounded-full bg-cream ring-2 ring-ink"><Image src={friesObj.img} alt="" fill sizes="40px" className="object-contain p-1" /></span>
                    <span key={drinkObj.id} className="sb-pop relative h-10 w-10 rounded-full ring-2 ring-ink" style={{ background: drinkObj.tint }}><Image src={drinkObj.img} alt="" fill sizes="40px" className="object-contain p-1" /></span>
                  </span>
                </label>
                {asMenu && (
                  <button type="button" onClick={() => goTab("menu")} className="sb-pop-in mt-2 text-xs font-bold uppercase tracking-wider underline underline-offset-4">Cambia patatine o bibita</button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={order} data-mag="0.2" className="group hidden h-12 items-center justify-between gap-3 rounded-full bg-lime pl-6 pr-2 text-ink lg:flex" data-builder-order>
                  <span className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">Aggiungi all&apos;ordine</span>
                  <span className="flex h-9 items-center gap-2 border-l-2 border-ink/20 pl-3 pr-3 font-bold tabular-nums"><Tick value={price} format={euro} /></span>
                </button>
                <button onClick={reset} className="flex h-12 items-center gap-2 rounded-full border-2 border-cream/30 px-5 text-xs font-bold uppercase tracking-wider transition-colors hover:border-lime hover:text-lime">
                  <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4"><path d="M4 10a6 6 0 1 0 1.8-4.3M4 3.5v3.2h3.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Butta tutto e riparti
                </button>
              </div>
              <p className="mt-3 hidden min-h-5 text-sm text-lime/80 lg:block" aria-live="polite">{toast}</p>
            </div>
          </div>
        </div>
      </div>
      {/* hidden warm-up of the stage-size bun variants (same URLs the stage requests) */}
      {warm && (
        <div aria-hidden className="hidden">
          {BREADS.flatMap((b) => [b.bottom, b.top]).map((i) => <span key={i.id} className="relative block h-10 w-10"><Image src={i.img} alt="" fill sizes="280px" loading="eager" /></span>)}
          {INGREDIENTS.map((i) => <span key={i.id} className="relative block h-10 w-10"><Image src={i.img} alt="" fill sizes="280px" loading="eager" /></span>)}
        </div>
      )}
    </section>
  );
}
