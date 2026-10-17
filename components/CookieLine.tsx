"use client";
import { useEffect, useState } from "react";
import { onSiteReady } from "./Preloader";

/**
 * Cookie line in Sbrano voice. The demo sets no tracking cookies (only the cart in localStorage),
 * so every choice just records the answer and closes; "Impostazioni" says exactly that.
 */
export default function CookieLine() {
  const [show, setShow] = useState(false);
  const [more, setMore] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem("sb-cookie")) return; } catch { return; }
    let t = 0;
    const off = onSiteReady(() => { t = window.setTimeout(() => setShow(true), 900); });
    return () => { off(); clearTimeout(t); };
  }, []);
  const answer = (v: string) => { try { localStorage.setItem("sb-cookie", v); } catch {} setShow(false); };
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Cookie" data-cookie
      className="sb-cookie fixed bottom-3 left-3 right-3 z-[90] rounded-[22px] border-2 border-ink bg-cream p-4 text-ink shadow-[5px_6px_0_#111] sm:right-auto sm:w-[380px]">
      <p className="text-[15px] font-medium leading-snug">
        <span className="font-marker text-[18px]">Entri qui e ti diamo quello che ti spetta.</span> Pure i cookie.
      </p>
      {more && <p className="mt-2 text-[13px] leading-snug text-ink/70">Questa demo usa solo il salvataggio locale del carrello. Niente tracciamento, niente pubblicità.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => answer("ok")} className="h-10 rounded-full bg-ink px-4 font-tanker text-[17px] uppercase leading-none text-lime">Va bene</button>
        <button type="button" onClick={() => answer("no")} className="h-10 rounded-full border-2 border-ink px-4 font-tanker text-[17px] uppercase leading-none">No grazie</button>
        <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="h-10 px-2 font-tanker text-[17px] uppercase leading-none underline decoration-2 underline-offset-4">Impostazioni</button>
      </div>
    </div>
  );
}
