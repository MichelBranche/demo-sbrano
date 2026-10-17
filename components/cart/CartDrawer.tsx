"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./CartProvider";
import { euro } from "@/lib/data";

export default function CartDrawer() {
  const { lines, total, open, setOpen, setQty, clear, count } = useCart();
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [order, setOrder] = useState("");

  useEffect(() => {
    if (open) window.__lenis?.stop(); else window.__lenis?.start();
    if (!open) { const t = setTimeout(() => setStep((s) => (s === "done" ? "cart" : s === "checkout" ? "cart" : s)), 400); return () => clearTimeout(t); }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrder("SB-" + Math.floor(1000 + Math.random() * 9000));
    setStep("done"); clear();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Carrello">
          <motion.div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: "105%" }} animate={{ x: 0 }} exit={{ x: "105%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-hidden bg-cream sm:right-3 sm:top-3 sm:h-[calc(100%-24px)] sm:rounded-[32px]" data-lenis-prevent>
            <div className="flex items-center justify-between bg-ink px-6 py-5 text-cream">
              <div>
                <p className="font-display text-3xl uppercase text-lime">Il tuo ordine</p>
                <p className="text-sm text-cream/60">{count} {count === 1 ? "pezzo" : "pezzi"} nel sacchetto</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Chiudi" className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-xl font-bold text-ink transition-transform hover:rotate-90">✕</button>
            </div>

            {step === "done" ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="relative h-48 w-48 rounded-full bg-lime">
                  <Image src="/assets/mascot/crown-thumbs-up.webp" alt="Mascotte SBRANO col pollice in su" fill sizes="192px" className="object-contain p-4" />
                </div>
                <p className="font-display text-4xl uppercase leading-none">Ordine ricevuto. Fame brutta in arrivo.</p>
                <p className="text-ink/70">Ordine <b>{order}</b>. Passa in Piazza Santa Giulia, ti chiamiamo per nome. È una demo: nessun burger è stato maltrattato.</p>
                <button onClick={() => setOpen(false)} className="rounded-full bg-ink px-6 py-3 font-bold uppercase tracking-wider text-lime">Torna a sbavare</button>
              </motion.div>
            ) : lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="relative h-40 w-40 rounded-full bg-lime">
                  <Image src="/assets/mascot/waving.webp" alt="" fill sizes="160px" className="object-contain p-4" />
                </div>
                <p className="font-display text-3xl uppercase">Sacchetto vuoto. Tristezza.</p>
                <a href="#menu" onClick={() => setOpen(false)} className="rounded-full bg-ink px-6 py-3 font-bold uppercase tracking-wider text-lime">Vai al menu</a>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto p-5">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li key={l.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex items-center gap-3 rounded-3xl bg-white/70 p-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-lime">
                          <Image src={l.img} alt="" fill sizes="64px" className="object-contain p-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{l.name}</p>
                          {l.note && <p className="truncate text-xs text-ink/60">{l.note}</p>}
                          <p className="text-sm tabular-nums">{euro(l.price)}</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-lime">
                          <button aria-label="Meno" onClick={() => setQty(l.id, l.qty - 1)} className="h-8 w-8 rounded-full font-bold hover:bg-lime hover:text-ink">−</button>
                          <span className="w-6 text-center tabular-nums">{l.qty}</span>
                          <button aria-label="Più" onClick={() => setQty(l.id, l.qty + 1)} className="h-8 w-8 rounded-full font-bold hover:bg-lime hover:text-ink">+</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-4 border-t-2 border-dashed border-ink/20 p-5">
                  {step === "checkout" ? (
                    <form onSubmit={submit} className="space-y-3">
                      <input required placeholder="Come ti chiamiamo?" className="h-12 w-full rounded-full border-2 border-ink bg-transparent px-5 outline-none focus:bg-white" />
                      <select className="h-12 w-full rounded-full border-2 border-ink bg-transparent px-5 outline-none" defaultValue="asap" aria-label="Orario ritiro">
                        <option value="asap">Ritiro appena pronto (15 min)</option><option>Ritiro alle 20:00</option><option>Ritiro alle 21:00</option>
                      </select>
                      <button type="submit" className="flex h-14 w-full items-center justify-between rounded-full bg-ink px-6 font-bold uppercase tracking-wider text-lime">Conferma e paga <span className="tabular-nums">{euro(total)}</span></button>
                      <button type="button" onClick={() => setStep("cart")} className="w-full text-sm underline">Indietro</button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-end justify-between"><span className="font-bold uppercase tracking-wider text-ink/60">Totale</span><span className="font-display text-4xl tabular-nums">{euro(total)}</span></div>
                      <button onClick={() => setStep("checkout")} className="flex h-14 w-full items-center justify-center rounded-full bg-ink font-bold uppercase tracking-wider text-lime transition-transform hover:scale-[1.02]">Vai alla cassa ↗</button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
