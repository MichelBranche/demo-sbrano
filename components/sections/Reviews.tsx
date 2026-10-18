"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import Badge from "../ui/Badge";

const R = [
  { n: "Giulia, Vanchiglia", t: "Lo Sbranatore è diventato il mio preferito.", a: "/assets/mascot/eating-burger.webp" },
  { n: "Marco T.", t: "Patatine croccanti e porzione generosa.", a: "/assets/mascot/crown-thumbs-up.webp" },
  { n: "Fede_skate", t: "Buon rapporto qualità-prezzo e servizio rapido.", a: "/assets/mascot/running.webp" },
  { n: "Sara B.", t: "Il Mordi e Fuggi è il mio preferito.", a: "/assets/mascot/waving.webp" },
  { n: "Luca da Borgo Po", t: "Vengo fin qui apposta, anche più volte a settimana.", a: "/assets/mascot/eating-burger.webp" },
  { n: "Ale & Chiara", t: "Abbiamo condiviso le patatine al primo appuntamento.", a: "/assets/mascot/crown-thumbs-up.webp" },
  { n: "Davide R.", t: "Il pollo ha una panatura molto croccante.", a: "/assets/mascot/running.webp" },
  { n: "Elena, studentessa", t: "La combo a 13,90 € è un’opzione completa.", a: "/assets/mascot/waving.webp" },
];

function Card({ r, i }: { r: (typeof R)[number]; i: number }) {
  return (
    <figure className="mx-2 flex w-[300px] shrink-0 flex-col gap-4 rounded-[24px] border-2 border-ink bg-cream p-5 text-ink md:w-[400px] md:p-6" style={{ rotate: `${[-1, 0.8, -0.4, 1.2][i % 4]}deg` }}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xl leading-none text-lime" role="img" aria-label="Valutazione: 5 stelle su 5.">★</span>
        <span aria-hidden className="font-display text-5xl leading-none text-ink/20">“</span>
      </div>
      <blockquote className="text-[1.3rem] font-medium leading-[1.25] md:text-[1.45rem]">{r.t}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="relative h-11 w-11 rounded-full border-2 border-ink bg-white"><Image src={r.a} alt="" fill sizes="44px" className="object-contain p-1" /></span>
        <span className="pt-[0.1em] font-tanker text-[1.35rem] uppercase leading-none">{r.n}</span>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  const a = R.slice(0, 4), b = R.slice(4);
  const ref = useRef<HTMLElement>(null);
  // pause the CSS marquees while the section is offscreen
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-off", !e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} id="recensioni" className="relative overflow-hidden py-20 md:py-28" aria-labelledby="rv-title">
      <div className="mb-12 flex flex-col items-center gap-4 px-4 text-center">
        <Badge icon="crown" tilt={2}>Le recensioni</Badge>
        <h2 id="rv-title" className="font-display text-[13vw] uppercase leading-[0.86] md:text-[clamp(56px,7vw,112px)]">
          <span className="block md:-translate-x-[8%]">Gente che</span><span className="block md:translate-x-[10%]">ha sbranato</span>
        </h2>
        <div className="flex items-center gap-3"><span className="font-display text-6xl">4,9</span><span className="text-left text-sm leading-tight">★★★★★<br />su 1.284 recensioni</span></div>
        <p className="-mt-1 rotate-[-2deg] font-marker text-[1.35rem] leading-none">Il resto è invidia.</p>
      </div>
      {[a, b].map((row, k) => (
        <div key={k} className="marquee mb-2 flex overflow-hidden py-3">
          <div className={`marquee-track flex w-max will-change-transform ${k ? "rev" : ""}`} style={{ ["--dur" as string]: k ? "55s" : "45s" }}>
            {[...row, ...row, ...row, ...row].map((r, i) => <Card key={i} r={r} i={i + k} />)}
          </div>
        </div>
      ))}
    </section>
  );
}
