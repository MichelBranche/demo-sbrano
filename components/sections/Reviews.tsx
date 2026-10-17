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
  const dark = i % 3 === 1;
  return (
    <figure className={`mx-2 flex w-[300px] shrink-0 flex-col gap-4 rounded-[28px] p-5 md:w-[380px] md:p-6 ${dark ? "bg-ink text-cream" : i % 3 === 2 ? "bg-lime text-ink" : "bg-white text-ink"}`}>
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-lg" aria-label="Valutazione: 5 stelle su 5.">{"★★★★★"}</div>
        <span className="font-display text-4xl leading-none opacity-30">“</span>
      </div>
      <blockquote className="text-lg font-medium leading-snug">{r.t}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className={`relative h-11 w-11 rounded-full ${dark ? "bg-lime" : "bg-cream"}`}><Image src={r.a} alt="" fill sizes="44px" className="object-contain p-1" /></span>
        <span className="text-sm font-bold uppercase tracking-wider">{r.n}</span>
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
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28" aria-labelledby="rv-title">
      <div className="mb-12 flex flex-col items-center gap-4 px-4 text-center">
        <Badge icon="crown" tilt={2}>Le recensioni</Badge>
        <h2 id="rv-title" className="font-display text-[13vw] uppercase leading-[0.86] md:text-[clamp(56px,7vw,112px)]">
          <span className="block md:-translate-x-[8%]">Le esperienze</span><span className="block md:translate-x-[10%]">dei clienti</span>
        </h2>
        <div className="flex items-center gap-3"><span className="font-display text-6xl">4,9</span><span className="text-left text-sm leading-tight">★★★★★<br />su 1.284 recensioni</span></div>
      </div>
      {[a, b].map((row, k) => (
        <div key={k} className="marquee mb-4 flex overflow-hidden">
          <div className={`marquee-track flex w-max will-change-transform ${k ? "rev" : ""}`} style={{ ["--dur" as string]: k ? "55s" : "45s" }}>
            {[...row, ...row, ...row, ...row].map((r, i) => <Card key={i} r={r} i={i + k} />)}
          </div>
        </div>
      ))}
    </section>
  );
}
