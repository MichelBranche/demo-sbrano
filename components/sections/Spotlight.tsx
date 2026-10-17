"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";
import { euro, SPECIALS } from "@/lib/data";
import { BLUR } from "@/lib/blur";
import Badge from "../ui/Badge";

/** Two specials share this section: Il Diavolo di Vanchiglia (burger del mese) and TonyPTony (special edition).
 * One photo per item, no slider: a two-way switch crossfades photo and copy (opacity only, both panels share one grid cell so nothing jumps). */
const Wave = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className={`block h-[50px] w-full md:h-[90px] ${flip ? "rotate-180" : ""}`} aria-hidden>
    <path d="M0 90 L0 50 C 180 0, 360 0, 540 40 S 900 90, 1080 45 S 1320 0, 1440 30 L1440 90 Z" fill="#111" />
  </svg>
);

function SidePanel({ side, text }: { side: "l" | "r"; text: string }) {
  return (
    <div className="sp-side relative hidden w-[150px] shrink-0 xl:block">
      <svg viewBox="0 0 150 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={side === "l" ? "M0 0 H120 C 150 100, 90 200, 120 300 S 150 500, 120 600 H0 Z" : "M150 0 H30 C 0 100, 60 200, 30 300 S 0 500, 30 600 H150 Z"} fill="#D6FF4D" />
      </svg>
      <div className={`relative flex h-full flex-col items-center justify-center gap-6 ${side === "l" ? "pr-6" : "pl-6"}`}>
        <span className="font-display text-5xl uppercase text-ink [writing-mode:vertical-rl]">{text}</span>
        <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <i key={i} className="block h-3 w-3 rounded-full bg-ink" />)}</div>
      </div>
    </div>
  );
}

function Details({ it, on }: { it: (typeof SPECIALS)[number]; on: boolean }) {
  const [open, setOpen] = useState(0);
  return (
    <>
      <div className="mt-6 space-y-3 lg:mt-0">
        {it.acc.map((a, i) => {
          const o = open === i;
          return (
            <div key={a.t} className={`rounded-[22px] transition-colors duration-500 ${o ? "bg-lime text-ink" : "bg-cream/10 text-cream"}`}>
              <button tabIndex={on ? 0 : -1} onClick={() => setOpen(o ? -1 : i)} aria-expanded={o} className="flex w-full items-center justify-between px-5 py-4 text-left font-bold uppercase tracking-wider">
                {a.t}
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform duration-500 ${o ? "rotate-45 bg-ink text-lime" : "bg-lime text-ink"}`}>+</span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${o ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="min-h-0 overflow-hidden">
                  <p className="px-5 pb-5 text-[15px] font-medium leading-snug">{a.chips.join(", ")}.{a.t === "Allergeni" && <span className="mt-1.5 block font-marker text-[17px]">Leggili, così il 112 resta tranquillo.</span>}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function Spotlight() {
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const { add } = useCart();

  // day bar can ask for a specific special
  useEffect(() => {
    const on = (e: Event) => { const i = SPECIALS.findIndex((x) => x.id === (e as CustomEvent<string>).detail); if (i >= 0) setSel(i); };
    addEventListener("sbrano:special", on); return () => removeEventListener("sbrano:special", on);
  }, []);

  useGSAP(() => {
    if (reduced()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    tl.from(".sp-card", { y: 60, opacity: 0, duration: 0.9 })
      .from(".sp-photo", { scale: 0.96, opacity: 0, duration: 0.9 }, 0.1)
      .from(".sp-side", { xPercent: (i) => (i ? 100 : -100), duration: 0.9 }, 0);
  }, { scope: root });

  const cur = SPECIALS[sel];
  const addIt = () => flyToCart(img.current, cur.img, () => add({ id: cur.id, name: cur.name, price: cur.price, img: cur.img, note: cur.note }));

  return (
    <section ref={root} id="proposta" className="relative mt-10 scroll-mt-20" aria-labelledby="sp-title">
      <Wave />
      <div className="-my-px flex overflow-hidden items-stretch bg-ink py-10 md:py-16">
        <SidePanel side="l" text="Edizioni speciali" />
        <div className="sp-card relative mx-3 flex-1 rounded-[32px] bg-ink-3 p-4 md:mx-6 md:rounded-[40px] md:p-10">
          {/* switch */}
          <div role="tablist" aria-label="Proposte speciali" className="mb-4 flex w-full gap-1 rounded-full bg-ink p-1 sm:w-fit md:mb-6">
            {SPECIALS.map((x, i) => (
              <button key={x.id} role="tab" id={`sp-tab-${x.id}`} aria-selected={sel === i} aria-controls="sp-panel" data-sp-tab={x.id} onClick={() => setSel(i)}
                className={`flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 font-tanker text-[15px] uppercase leading-none tracking-[0.03em] transition-colors duration-300 sm:flex-none sm:px-5 md:h-12 md:text-[18px] ${sel === i ? "bg-lime text-ink" : "text-cream/70 hover:text-lime"}`}>
                <span className="pt-[0.1em]">{x.tab}</span>
                <span className={`hidden pt-[0.1em] md:inline ${sel === i ? "text-ink/60" : "text-cream/40"}`}>{x.name.replace("Il Diavolo di Vanchiglia", "Diavolo")}</span>
              </button>
            ))}
          </div>
          <div id="sp-panel" role="tabpanel" aria-labelledby={`sp-tab-${cur.id}`} className="flex flex-col gap-6 md:gap-10">
            <div ref={img} className="sp-photo relative aspect-[16/9] overflow-hidden rounded-[24px] bg-ink">
              {SPECIALS.map((x, i) => (
                <div key={x.id} aria-hidden={sel !== i} data-sp-photo={x.id} className={`absolute inset-0 transition-opacity duration-500 ${sel === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                  {x.cutout ? (
                    <>
                      {/* composed cutout on the brand lime, same treatment as the menu burgers */}
                      <div aria-hidden className="grain absolute inset-0 bg-lime" />
                      <Image src={x.photo} alt={x.alt} fill sizes="(min-width:1280px) 900px, 100vw" className="object-contain object-[50%_70%] p-[4%] pt-[9%] drop-shadow-[0_30px_30px_rgba(0,0,0,.35)]" />
                      {x.poster && (
                        <a href={x.poster} target="_blank" rel="noopener" aria-label="Apri il poster di TonyPTony"
                          className="sb-lift-tilt absolute bottom-[6%] right-[4%] z-10 hidden w-[24%] rotate-[4deg] overflow-hidden rounded-xl border-[5px] border-white shadow-[0_18px_30px_-10px_rgba(0,0,0,.5)] md:block">
                          <Image src={x.poster} alt="Poster di TonyPTony" width={1672} height={941} sizes="280px" className="block h-auto w-full" />
                        </a>
                      )}
                    </>
                  ) : (
                    <Image src={x.photo} alt={x.alt} fill loading={i === 0 ? "eager" : "lazy"} placeholder={BLUR[x.photo] ? "blur" : "empty"} blurDataURL={BLUR[x.photo]}
                      sizes="(min-width:1280px) 1100px, 100vw" className="object-cover" />
                  )}
                  {x.overlay && <span aria-hidden className={`pointer-events-none absolute left-4 top-3 hidden font-tanker text-[clamp(84px,7.4vw,140px)] uppercase leading-[0.8] lg:block ${x.cutout ? "z-0 text-ink" : "z-10 text-cream mix-blend-difference"}`}>{x.overlay}</span>}
                  {x.sticker && <span className="sb-tag absolute bottom-5 right-4 z-10 rotate-[-4deg] bg-lime font-marker text-[clamp(15px,1.2vw,20px)] text-ink">{x.sticker}</span>}
                </div>
              ))}
            </div>
            {/* both copies share one grid cell: the taller sets the height, the switch never shifts the layout */}
            <div className="grid text-cream">
              {SPECIALS.map((x, i) => {
                const on = sel === i;
                return (
                  <div key={x.id} aria-hidden={!on} data-sp-copy={x.id} className={`grid content-start gap-x-12 transition-opacity duration-500 [grid-area:1/1] lg:grid-cols-[1fr_1fr] ${on ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}>
                    <div className="flex flex-col">
                    <Badge icon={x.poster ? "star" : "fire"} tilt={-4} dark className="w-fit">{x.eyebrow}</Badge>
                    <h2 id={on ? "sp-title" : undefined} className="mt-4 font-display text-[11vw] uppercase leading-[0.85] md:text-[clamp(44px,4.6vw,76px)]">
                      {x.l1}<br /><span className="whitespace-nowrap pl-[6%] text-lime">{x.l2}</span>
                    </h2>
                    {x.tagline && <p className="mt-4 rotate-[-2deg] font-marker text-[clamp(1.2rem,1rem+0.6vw,1.6rem)] leading-tight text-lime">{x.tagline}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="font-display text-5xl text-lime tabular-nums">{euro(x.price)}</span>
                      {x.kcal ? <span className="text-sm text-cream/60">{x.kcal.toLocaleString("it-IT")} kcal.</span> : null}
                      {x.tags?.map((t) => <span key={t} className="pill-label h-7 bg-cream/10 px-3 text-[11px] text-cream">{t}</span>)}
                    </div>
                    </div>
                    <div className="flex flex-col lg:pt-2">
                    <Details it={x} on={on} />
                    <button tabIndex={on ? 0 : -1} onClick={addIt} className="group mt-6 flex w-fit items-center gap-1" aria-label={`Aggiungi ${x.name} all'ordine`}>
                      <span className="flex h-14 items-center rounded-full bg-lime px-7 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">Aggiungi all&apos;ordine</span>
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-ink transition-transform duration-500 group-hover:rotate-90">+</span>
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <SidePanel side="r" text="Smash ✶" />
      </div>
      <Wave flip />
    </section>
  );
}
