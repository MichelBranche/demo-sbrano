"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { useCart } from "../cart/CartProvider";
import { flyToCart } from "@/lib/fly";
import { euro } from "@/lib/data";
import { BLUR } from "@/lib/blur";
import Badge from "../ui/Badge";

/** One photo only: the real Diavolo di Vanchiglia (spicy bacon & jalapeño smash). */
const SHOT = { src: "/assets/promo/burger-mese.webp", alt: "Il Diavolo di Vanchiglia: cheeseburger piccante con bacon e jalapeño" };
const ACC = [
  { t: "Ingredienti", chips: ["Doppio smash", "Cheddar", "Bacon croccante", "Jalapeño", "Salsa spicy", "Brioche al sesamo"] },
  { t: "Allergeni", chips: ["Glutine", "Latte", "Uova", "Sesamo", "Senape"] },
];

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

export default function Spotlight() {
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  const { add } = useCart();

  useGSAP(() => {
    if (reduced()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    tl.from(".sp-card", { y: 60, opacity: 0, duration: 0.9 })
      .from(".sp-photo", { scale: 0.96, opacity: 0, duration: 0.9 }, 0.1)
      .from(".sp-side", { xPercent: (i) => (i ? 100 : -100), duration: 0.9 }, 0);
  }, { scope: root });

  const addIt = () => flyToCart(img.current, "/assets/promo/burger-mese.webp", () => add({ id: "diavolo", name: "Il Diavolo di Vanchiglia", price: 12.9, img: "/assets/promo/burger-mese.webp", note: "Burger del mese" }));

  return (
    <section ref={root} id="proposta" className="relative mt-10 scroll-mt-20" aria-labelledby="sp-title">
      <Wave />
      <div className="-my-px flex overflow-hidden items-stretch bg-ink py-10 md:py-16">
        <SidePanel side="l" text="Edizione del mese" />
        <div className="sp-card relative mx-3 flex-1 rounded-[32px] bg-ink-3 p-4 md:mx-6 md:rounded-[40px] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div ref={img} className="sp-photo relative aspect-[4/3] overflow-hidden rounded-[24px] bg-ink lg:aspect-auto lg:min-h-[520px]">
              <Image src={SHOT.src} alt={SHOT.alt} fill loading="eager" placeholder="blur" blurDataURL={BLUR[SHOT.src]}
                sizes="(min-width:1280px) 46vw, (min-width:1024px) 50vw, 100vw" className="object-cover object-[70%_50%]" />
              <span aria-hidden className="pointer-events-none absolute left-4 top-3 z-10 hidden font-tanker text-[clamp(84px,7.4vw,140px)] uppercase leading-[0.8] text-cream mix-blend-difference lg:block">Diavolo</span>
              <span className="sb-tag absolute bottom-5 right-4 z-10 rotate-[-4deg] bg-lime font-marker text-[clamp(15px,1.2vw,20px)] text-ink">Solo a ottobre, poi sparisce.</span>
            </div>
            <div className="flex flex-col justify-center text-cream">
              <Badge icon="fire" tilt={-4} dark className="w-fit">La proposta del mese</Badge>
              <h2 id="sp-title" className="mt-4 font-display text-[11vw] uppercase leading-[0.85] md:text-[clamp(44px,4.6vw,76px)]">
                Il Diavolo<br /><span className="whitespace-nowrap pl-[6%] text-lime">di Vanchiglia</span>
              </h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-display text-5xl text-lime tabular-nums">{euro(12.9)}</span>
                <span className="text-sm text-cream/60">1.040 kcal.</span>
              </div>
              <div className="mt-6 space-y-3">
                {ACC.map((a, i) => {
                  const on = open === i;
                  return (
                    <div key={a.t} className={`rounded-[22px] transition-colors duration-500 ${on ? "bg-lime text-ink" : "bg-cream/10 text-cream"}`}>
                      <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} className="flex w-full items-center justify-between px-5 py-4 text-left font-bold uppercase tracking-wider">
                        {a.t}
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform duration-500 ${on ? "rotate-45 bg-ink text-lime" : "bg-lime text-ink"}`}>+</span>
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="min-h-0 overflow-hidden">
                          <p className="px-5 pb-5 text-[15px] font-medium leading-snug">{a.chips.join(", ")}.{a.t === "Allergeni" && <span className="mt-1.5 block font-marker text-[17px]">Leggili, così il 112 resta tranquillo.</span>}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={addIt} className="group mt-6 flex w-fit items-center gap-1">
                <span className="flex h-14 items-center rounded-full bg-lime px-7 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">Aggiungi all&apos;ordine</span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-ink transition-transform duration-500 group-hover:rotate-90">+</span>
              </button>
            </div>
          </div>
        </div>
        <SidePanel side="r" text="Smash ✶" />
      </div>
      <Wave flip />
    </section>
  );
}
