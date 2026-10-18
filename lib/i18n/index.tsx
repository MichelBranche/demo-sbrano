"use client";
import { createContext, Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import it from "./it";
import en from "./en";
import fr from "./fr";

/**
 * Lightweight client-side i18n. Italian is the source language: every string in the code is the
 * Italian copy and doubles as its key; en.ts / fr.ts map it to the translation (missing keys fall
 * back to Italian). The choice lives in localStorage ("sb-lang"); the inline head script applies
 * <html lang> before first paint, the provider switches the copy in a layout effect (before paint).
 */
export type Lang = "it" | "en" | "fr";
export const LANGS: { id: Lang; short: string; label: string }[] = [
  { id: "it", short: "IT", label: "Italiano" },
  { id: "en", short: "EN", label: "English" },
  { id: "fr", short: "FR", label: "Français" },
];
const DICTS: Record<Lang, Record<string, string>> = { it, en, fr };
export const LANG_KEY = "sb-lang";
const TITLES: Record<Lang, string> = { it: "SBRANO | Smash burger a Torino", en: "SBRANO | Smash burgers in Turin", fr: "SBRANO | Smash burgers à Turin" };

type Vars = Record<string, string | number>;
export function translate(lang: Lang, s: string, vars?: Vars) {
  let o = DICTS[lang][s] ?? s;
  if (vars) o = o.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return o;
}
/** cart line names are stored in the language they were added in (Italian for menu items):
 * translate known names and the "Bibita X" / "Menu X" patterns at display time */
export function translateName(lang: Lang, name: string) {
  const d = translate(lang, name);
  if (d !== name) return d;
  const m = name.match(/^(Bibita|Menu) (.+)$/);
  return m ? translate(lang, `${m[1]} {x}`, { x: translate(lang, m[2]) }) : name;
}
/** current language for code outside React (toasts, generated names) */
let current: Lang = "it";
export const getLang = () => current;
export const tr = (s: string, vars?: Vars) => translate(current, s, vars);
export const trName = (n: string) => translateName(current, n);

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string, vars?: Vars) => string; tn: (name: string) => string };
const I18n = createContext<Ctx>({ lang: "it", setLang: () => {}, t: (s, v) => translate("it", s, v), tn: (n) => n });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, set] = useState<Lang>("it");
  const apply = useCallback((l: Lang) => {
    current = l; set(l);
    document.documentElement.lang = l;
    document.title = TITLES[l];
  }, []);
  useLayoutEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch {}
    if (saved === "en" || saved === "fr") apply(saved);
  }, [apply]);
  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem(LANG_KEY, l); } catch {}
    apply(l);
    window.dispatchEvent(new CustomEvent("sbrano:lang", { detail: l }));
  }, [apply]);
  const t = useCallback((s: string, vars?: Vars) => translate(lang, s, vars), [lang]);
  const tn = useCallback((n: string) => translateName(lang, n), [lang]);
  const v = useMemo(() => ({ lang, setLang, t, tn }), [lang, setLang, t, tn]);
  return <I18n.Provider value={v}>{children}</I18n.Provider>;
}
export const useT = () => useContext(I18n);

/** remounts the page sections when the language changes, so GSAP / SplitText rebuild on the new copy */
export function LangKey({ children }: { children: React.ReactNode }) {
  const { lang } = useT();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);
  return <Fragment key={lang}>{children}</Fragment>;
}
