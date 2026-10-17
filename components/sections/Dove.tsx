"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import PillButton from "../ui/PillButton";

const HOURS = [
  ["Lunedì", "Chiuso (dormiamo)"],
  ["Mar - Gio", "12:00-15:00 • 19:00-23:30"],
  ["Ven - Sab", "12:00-15:00 • 19:00-01:00"],
  ["Domenica", "12:00-23:00"],
];

export default function Dove() {
  const root = useRef<HTMLElement>(null);
  const [today, setToday] = useState(-1);
  useEffect(() => setToday(new Date().getDay()), []);
  useGSAP(() => {
    if (reduced()) return;
    gsap.from(".d-pin", { y: -120, opacity: 0, duration: 1.2, ease: "bounce.out", scrollTrigger: { trigger: ".d-map", start: "top 75%" } });
    gsap.fromTo(".d-route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".d-map", start: "top 80%", end: "bottom 50%", scrub: true } });
    // mascot runs along the route
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    tl.fromTo(".d-runner", { xPercent: -120, left: "0%" }, { left: "100%", xPercent: 20, duration: 9 })
      .to(".d-runner-bob", { y: -8, duration: 0.18, repeat: 49, yoyo: true, ease: "sine.inOut" }, 0);
    gsap.from(".d-row", { x: -30, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".d-info", start: "top 80%" } });
  }, { scope: root });
  const dayIdx = today === 1 ? 0 : today >= 2 && today <= 4 ? 1 : today === 5 || today === 6 ? 2 : today === 0 ? 3 : -1;
  return (
    <section ref={root} id="dove" className="relative px-4 pb-20 md:px-10">
      <div className="mx-auto grid max-w-[1360px] gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <div className="d-info flex flex-col rounded-[32px] bg-ink p-6 text-cream md:p-10">
          <span className="pill-label w-fit bg-lime text-ink">Dove siamo</span>
          <h2 className="mt-5 font-display text-5xl uppercase leading-[0.88] md:text-7xl">Piazza<br /><span className="pl-[8%] text-lime">Santa Giulia</span></h2>
          <p className="mt-4 text-cream/70">Piazza Santa Giulia, 10124 Torino. Vanchiglia, a due passi dalla Mole e dal Po. Cerca l&apos;insegna lime, non puoi sbagliare.</p>
          <ul className="mt-6 divide-y divide-cream/10">
            {HOURS.map(([d, h], i) => (
              <li key={d} className={`d-row flex items-center justify-between gap-3 py-3 ${i === dayIdx ? "text-lime" : ""}`}>
                <span className="font-bold uppercase tracking-wider">{d}{i === dayIdx && <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] text-ink">oggi</span>}</span>
                <span className="text-right text-sm tabular-nums text-cream/80">{h}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <PillButton href="https://www.google.com/maps/search/?api=1&query=Piazza+Santa+Giulia+Torino" variant="lime">Indicazioni</PillButton>
            <a href="tel:+390110000000" className="flex h-12 items-center rounded-full border-2 border-cream/30 px-6 text-[13px] font-bold uppercase tracking-wider hover:border-lime hover:text-lime md:h-14">Chiama</a>
          </div>
        </div>

        <div className="d-map relative min-h-[420px] overflow-hidden rounded-[32px] bg-lime md:min-h-[560px]">
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-label="Mappa stilizzata di Vanchiglia">
            <rect width="800" height="600" fill="#D6FF4D" />
            {/* river Po */}
            <path d="M560 -20 C 600 120, 700 200, 690 330 S 740 520, 820 620 L 900 620 L 900 -20 Z" fill="#111" opacity=".9" />
            <text x="735" y="300" fill="#D6FF4D" fontSize="22" className="font-display" transform="rotate(70 735 300)">FIUME PO</text>
            {/* blocks */}
            <g fill="#111" opacity=".08">
              {Array.from({ length: 30 }).map((_, i) => { const x = (i % 6) * 95 + 10, y = Math.floor(i / 6) * 120 + 15; return <rect key={i} x={x} y={y} width="78" height="100" rx="14" />; })}
            </g>
            {/* streets */}
            <g stroke="#111" strokeWidth="16" strokeLinecap="round" opacity=".85" fill="none">
              <path d="M-20 140 L 620 160" />
              <path d="M-20 380 L 660 400" />
              <path d="M200 -20 L 230 620" />
              <path d="M420 -20 L 400 620" />
            </g>
            <g fill="#111" fontSize="13" fontWeight="700" letterSpacing="2">
              <text x="20" y="128">VIA VANCHIGLIA</text>
              <text x="30" y="368">CORSO SAN MAURIZIO</text>
              <text x="242" y="560" transform="rotate(-88 242 560)">VIA SANTA GIULIA</text>
            </g>
            {/* piazza */}
            <rect x="250" y="190" width="130" height="150" rx="24" fill="#F6EBD7" stroke="#111" strokeWidth="4" />
            <text x="315" y="275" textAnchor="middle" fontSize="12" fontWeight="800" fill="#111">P.ZZA S. GIULIA</text>
            {/* Mole */}
            <g transform="translate(70 450)"><path d="M30 0 L40 -60 L50 0 Z M20 0 H60 V20 H20 Z" fill="#111" /><text x="40" y="40" textAnchor="middle" fontSize="12" fontWeight="800">MOLE</text></g>
            <path className="d-route" pathLength={1} strokeDasharray="1" d="M110 470 C 160 430, 180 300, 240 290 S 300 260, 315 240" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" strokeDashoffset="0" />
          </svg>
          {/* pin */}
          <div className="d-pin absolute left-[39%] top-[22%] -translate-x-1/2 md:left-[39.5%] md:top-[24%]">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full rounded-br-none bg-ink shadow-xl [transform:rotate(45deg)]">
              <span className="relative h-12 w-12 [transform:rotate(-45deg)]"><Image src="/assets/mascot/eating-burger-filled.webp" alt="" fill sizes="48px" className="object-contain" /></span>
            </div>
          </div>
          <div className="absolute right-4 top-4 rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-lime">Siamo qui ↙</div>
          {/* running mascot strip */}
          <div className="absolute inset-x-0 bottom-0 h-36 overflow-hidden">
            <div className="absolute inset-x-4 bottom-3 rounded-full bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-cream">Da Porta Nuova 18 min • Dalla Mole 6 min • Di corsa 2</div>
            <div className="d-runner absolute bottom-[60px] left-0 h-20 w-20">
              <div className="d-runner-bob relative h-full w-full rounded-full bg-cream">
                <Image src="/assets/mascot/running.webp" alt="Mascotte che corre" fill sizes="80px" className="object-contain p-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
