"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "@/lib/gsap";
import { ADDRESS, HOURS_TABLE, MAPS_URL } from "@/lib/hours";

/** the three reviews of Michel's mockup, word for word; lines break as in the mockup on desktop */
const REVIEWS = [
  { l: ["“Lo Sbranatore è diventato", "il mio preferito. Smash burger", "pazzeschi e atmosfera top!”"], hang: true, n: "Giulia", a: "Vanchiglia", img: "/assets/locale/interno.webp" },
  { l: ["“Patatine croccanti e porzioni", "generose. Qualità top e prezzi", "giusti. Ci torno sempre!”"], n: "Marco T.", a: "Torino", img: "/assets/locale/locale-night.webp" },
  { l: ["“Il pollo ha una panatura", "spettacolare e la combo è", "una bomba. Servizio super rapido!”"], n: "Eleonora B.", a: "Torino", img: "/assets/locale/esterno-piazza.webp" },
];

/** street labels on the map, in map units (827 x 348): centre, rotation, text length */
const STREETS = [
  { x: 227.9, y: 41.6, r: 9.5, l: 141, t: "CORSO SAN MAURIZIO" },
  { x: 625.6, y: 103.6, r: 1.7, l: 177, t: "CORSO REGINA MARGHERITA" },
  { x: 132.2, y: 153.2, r: -82.4, l: 87, t: "VIA VANCHIGLIA" },
  { x: 365.7, y: 279.6, r: -83.1, l: 93, t: "VIA SANTA GIULIA" },
  { x: 122.1, y: 283.6, r: 14.0, l: 121, t: "VIA GIULIA DI BAROLO" },
  { x: 683.4, y: 275.6, r: -33.6, l: 122, t: "LUNGO PO ANTONELLI" },
];

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="currentColor" d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" />
    </svg>
  );
}

function Title() {
  // Lunar Blob on two gentle arches, like the mockup's warped lockup
  return (
    <svg viewBox="400 30 664 196" className="rv-title-svg block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <path id="rv-arc1" d="M430 128 A2190 2190 0 0 1 1010 128" />
        <path id="rv-arc2" d="M392 213 A2090 2090 0 0 1 1068 213" />
      </defs>
      <text className="rv-t1" fill="#111" stroke="#111" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: "var(--font-display)" }} fontSize="99">
        <textPath href="#rv-arc1" startOffset="50%" textAnchor="middle" textLength="536" lengthAdjust="spacingAndGlyphs">VANCHIGLIA</textPath>
      </text>
      <text className="rv-t2" fill="#98BC12" stroke="#98BC12" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: "var(--font-display)" }} fontSize="93">
        <textPath href="#rv-arc2" startOffset="50%" textAnchor="middle" textLength="631" lengthAdjust="spacingAndGlyphs">CI VUOLE BENE.</textPath>
      </text>
    </svg>
  );
}

function MapArt() {
  return (
    <svg viewBox="0 0 827 348" preserveAspectRatio="xMidYMid slice" className="absolute left-1/2 top-0 aspect-[827/348] h-full w-auto max-w-none -translate-x-[43%] md:-translate-x-1/2 lg:inset-0 lg:w-full lg:translate-x-0" role="img" aria-label="Mappa illustrata di Vanchiglia: SBRANO è in Piazza Santa Giulia, tra Corso San Maurizio, Via Vanchiglia, Via Santa Giulia e il Po.">
      <image href="/assets/map/vanchiglia-map.svg" x="0" y="0" width="827" height="348" preserveAspectRatio="none" />
      <g fill="#F7EEDD" style={{ fontFamily: "var(--font-body)" }} fontWeight="700" fontSize="11.9">
        {STREETS.map((s) => (
          <text key={s.t} x={s.x} y={s.y} dy="4.1" textAnchor="middle" textLength={s.l} lengthAdjust="spacing" transform={`rotate(${s.r} ${s.x} ${s.y})`}>{s.t}</text>
        ))}
      </g>
      <g transform="rotate(-30 640 232)">
        <text x="630" y="232" dy="4.2" textAnchor="middle" textLength="64" lengthAdjust="spacing" fill="#111" style={{ fontFamily: "var(--font-body)" }} fontWeight="700" fontSize="12.6">FIUME PO</text>
        <path d="M667 231 h11 m-4 -3.4 l4 3.4 l-4 3.4" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* "Siamo qui!" + doodle arrow */}
      <text className="rv-siamo" x="200" y="142" transform="rotate(-13 255 128)" fill="#111" style={{ fontFamily: "var(--font-marker)" }} fontSize="25.5" stroke="#111" strokeWidth=".6">Siamo qui!</text>
      <g fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path className="rv-arrow" d="M268 158 C 272 172, 284 182, 306 184" />
        <path d="M297 175 L 307 184 L 295 189" />
      </g>
      {/* pin + label */}
      <g className="rv-pin">
        <path d="M356.4 191 C 352 178, 332 168, 332 150 a24.4 24.4 0 0 1 48.8 0 C 380.8 168, 361 178, 356.4 191 Z" fill="#111" />
        <circle cx="356.4" cy="152" r="10.4" fill="#D2FA52" />
      </g>
      <g className="rv-label">
        <rect x="314.5" y="193.5" width="85" height="30" rx="15" fill="#F7EEDD" stroke="#111" strokeWidth="2.6" />
        <text x="357" y="208.5" dy="6.5" textAnchor="middle" fill="#111" style={{ fontFamily: "var(--font-tanker)" }} fontSize="19" letterSpacing=".3">SBRANO</text>
      </g>
    </svg>
  );
}

export default function Reviews() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    const st = { trigger: root.current, start: "top 70%" };
    gsap.from(".rv-head > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out", scrollTrigger: st });
    gsap.from(".rv-card", { y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".rv-cards", start: "top 80%" } });
    gsap.from(".rv-row", { x: -24, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power3.out", scrollTrigger: { trigger: ".rv-box", start: "top 80%" } });
    // pin drops in with a bounce, then keeps a small idle hop
    const pin = gsap.timeline({ scrollTrigger: { trigger: ".rv-map", start: "top 80%" } });
    pin.from(".rv-pin", { y: -90, opacity: 0, duration: 1, ease: "bounce.out" })
      .from(".rv-label", { scale: 0.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)" }, "-=0.35")
      .from(".rv-siamo, .rv-arrow", { opacity: 0, duration: 0.4 }, "-=0.2")
      .to(".rv-pin", { y: -7, duration: 0.42, ease: "power1.out", yoyo: true, repeat: -1, repeatDelay: 1.6 });
  }, { scope: root });

  return (
    <section ref={root} id="recensioni" className="rv relative px-4 pb-16 pt-16 md:px-8 lg:px-0 lg:pb-[calc(var(--u)*36)] lg:pt-[calc(var(--u)*40)]" aria-labelledby="rv-title">
      <div className="rv-frame relative mx-auto">
        <header className="rv-head flex flex-col items-center text-center">
          <p className="rv-eye flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.04em]">
            <span aria-hidden className="rv-eline h-[1.5px] w-12 bg-ink" />Parlano di noi<span aria-hidden className="rv-eline h-[1.5px] w-12 bg-ink" />
          </p>
          <h2 id="rv-title" className="rv-title mt-2 w-[min(100%,560px)]">
            <span className="sr-only">Vanchiglia ci vuole bene.</span>
            <Title />
          </h2>
          <div className="rv-rate mt-1 flex items-center gap-2">
            <span className="rv-49 font-tanker text-[48px] leading-none">4,9</span>
            <span className="flex flex-col items-start">
              <span className="rv-stars flex text-[#A2CB10]" role="img" aria-label="5 stelle su 5">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="rv-star h-5 w-5" />)}</span>
              <span className="rv-g text-[13px] font-bold leading-none">su Google</span>
            </span>
          </div>
        </header>

        <ul className="rv-cards mt-8 grid gap-4 md:grid-cols-3 lg:mt-0 lg:block">
          {REVIEWS.map((r, i) => (
            <li key={r.n} className={`rv-card rv-card-${i} relative flex flex-col rounded-[10px] border-[1.5px] border-ink bg-[#F9EDDC] p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_0_-2px_#111] lg:block lg:p-0`}>
              <div className="flex items-center justify-between lg:contents">
                <span className="rv-badge flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[#D2FA52]"><Star className="rv-bstar h-[14px] w-[14px]" /></span>
                <span aria-hidden className="rv-dots flex gap-[3px]"><i className="rv-dot" /><i className="rv-dot" /><i className="rv-dot" /></span>
              </div>
              <blockquote className={`rv-q mt-4 text-[15.5px] leading-[1.32] lg:mt-0 ${r.hang ? "rv-hang" : ""}`}>
                {r.l.map((t, k) => <span key={k} className="lg:block">{t}{k < 2 && " "}</span>)}
              </blockquote>
              <div className="rv-who mt-4 flex items-center gap-3 lg:mt-0 lg:block">
                <span className="rv-av relative block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ink/30"><Image src={r.img} alt="" fill sizes="44px" className="object-cover" /></span>
                <span className="rv-meta flex flex-col">
                  <span className="rv-name font-tanker text-[15px] uppercase leading-none">{r.n}</span>
                  <span className="rv-area mt-1 text-[12.5px] leading-none text-[#8F887C]">{r.a}</span>
                </span>
              </div>
              <span className="sr-only">Valutazione: 5 stelle su 5.</span>
            </li>
          ))}
        </ul>

        <div id="dove" className="rv-box mt-8 flex scroll-mt-24 flex-col overflow-hidden rounded-[22px] bg-ink text-cream lg:mt-0 lg:block">
          <div className="rv-info p-6 md:p-8 lg:p-0">
            <p className="rv-ci flex items-center gap-2 font-tanker text-[17px] uppercase leading-none">
              <svg viewBox="0 0 12 16" aria-hidden className="rv-pinic h-4 w-3 text-[#D2FA52]"><path fill="currentColor" d="M6 0a6 6 0 0 0-6 6c0 4.2 6 10 6 10s6-5.8 6-10a6 6 0 0 0-6-6zm0 8.4A2.4 2.4 0 1 1 6 3.6a2.4 2.4 0 0 1 0 4.8z" /></svg>
              <span className="rv-cit pt-[0.1em]">Ci vediamo in</span>
            </p>
            <h3 className="rv-pz mt-3 font-display text-[50px] uppercase leading-[0.9] lg:mt-0">
              <span className="rv-pz1 block text-[#F7EEDD]">Piazza</span>
              <span className="rv-pz2 block text-[#D2FA52]">Santa Giulia</span>
            </h3>
            <p className="rv-addr mt-3 text-[14px] text-cream/90 lg:mt-0">{ADDRESS}, nel cuore di Vanchiglia.</p>
            <table className="rv-hours mt-4 w-full border-t border-cream/25 text-[13px] lg:mt-0">
              <caption className="sr-only">Orari di apertura</caption>
              <tbody>
                {HOURS_TABLE.map(([d, a, b]) => (
                  <tr key={d} className="rv-row border-b border-cream/20">
                    <th scope="row" className="rv-day py-[5px] text-left text-[12.5px] font-bold uppercase">{d}</th>
                    <td className="rv-s1 py-[5px] text-right tabular-nums text-cream/90">{a}</td>
                    <td className="rv-s2 py-[5px] pl-4 text-right tabular-nums text-cream/90">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="rv-go group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-[#D2FA52] px-7 font-tanker text-[20px] uppercase text-ink transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02] lg:mt-0 lg:flex">
              <span className="pt-[0.12em]">Portami da Sbrano</span>
              <svg viewBox="0 0 16 16" aria-hidden className="rv-goar h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><path d="M3 13L13 3M5 3h8v8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" /></svg>
              <span className="sr-only">(apre Google Maps)</span>
            </a>
          </div>
          <div className="rv-map relative h-[300px] overflow-hidden rounded-[16px] md:h-[380px] lg:h-auto">
            <MapArt />
          </div>
        </div>
      </div>
    </section>
  );
}
