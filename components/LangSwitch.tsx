"use client";
import { useEffect, useRef, useState } from "react";
import { LANGS, useT, type Lang } from "@/lib/i18n";

/** compact "IT ▾" pill with a 3-language dropdown, Sbrano style (ink border, lime pick, springy pop) */
export default function LangSwitch({ variant = "dark", className = "" }: { variant?: "dark" | "lime" | "light"; className?: string }) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLButtonElement>("[data-lang-btn]")?.focus(); } };
    addEventListener("pointerdown", off); addEventListener("keydown", key);
    root.current?.querySelector<HTMLButtonElement>(`[data-lang-opt="${lang}"]`)?.focus();
    return () => { removeEventListener("pointerdown", off); removeEventListener("keydown", key); };
  }, [open, lang]);
  const pick = (l: Lang) => { setOpen(false); if (l !== lang) { setBump((b) => b + 1); setLang(l); } };
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const btns = [...(root.current?.querySelectorAll<HTMLButtonElement>("[data-lang-opt]") ?? [])];
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    btns[(i + (e.key === "ArrowDown" ? 1 : btns.length - 1)) % btns.length]?.focus();
  };
  const cur = LANGS.find((l) => l.id === lang)!;
  const pill = variant === "lime" ? "bg-lime text-ink" : variant === "light" ? "bg-cream text-ink border-2 border-ink" : "bg-ink text-[#D7F64E]";
  return (
    <div ref={root} className={`sb-lang relative ${className}`} data-lang-switch>
      <button type="button" data-lang-btn onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}
        aria-label={`${t("Lingua")}: ${cur.label}`}
        className={`sb-lift group flex h-full min-h-10 items-center gap-1 rounded-full px-3 font-tanker text-[15px] uppercase leading-none transition-transform active:scale-95 ${pill}`}>
        <span key={bump} className="sb-lang-flip inline-block pt-[0.12em]">{cur.short}</span>
        <svg aria-hidden viewBox="0 0 10 6" className={`h-[6px] w-[10px] transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] ${open ? "rotate-180" : "group-hover:translate-y-[1px]"}`}><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul role="menu" aria-label={t("Scegli la lingua")} onKeyDown={onListKey}
          className="sb-lang-menu absolute right-0 top-[calc(100%+8px)] z-[95] w-[168px] rounded-[18px] border-2 border-ink bg-cream p-1.5 text-ink shadow-[4px_5px_0_#111]">
          {LANGS.map((l, i) => {
            const on = l.id === lang;
            return (
              <li key={l.id} role="none" style={{ ["--i" as string]: i } as React.CSSProperties} className="sb-lang-item">
                <button type="button" role="menuitemradio" aria-checked={on} lang={l.id} data-lang-opt={l.id} onClick={() => pick(l.id)}
                  className={`flex w-full items-center gap-2.5 rounded-full px-2.5 py-2 text-left transition-[background-color,translate] duration-200 hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-ink ${on ? "bg-lime" : "hover:bg-ink/[0.07]"}`}>
                  <span className={`flex h-7 w-9 shrink-0 items-center justify-center rounded-full font-tanker text-[14px] leading-none ${on ? "bg-ink text-lime" : "border-2 border-ink"}`}><span className="pt-[0.12em]">{l.short}</span></span>
                  <span className="flex-1 text-[14px] font-bold">{l.label}</span>
                  {on && <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
