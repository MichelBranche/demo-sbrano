"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tr, trName } from "@/lib/i18n";

export type CartLine = {
  id: string; name: string; price: number; img: string; qty: number; note?: string;
  /** custom builder burger: layer ids bottom→top (incl. buns) and readable ingredient names */
  layers?: string[]; ingredients?: string[];
  /** builder "Fallo menu": fries + chosen drink */
  menu?: { fries: string; drink: string; drinkImg: string; friesImg: string };
};
export type Notice = { key: number; title: string; sub: string; img: string; /** show the "Apri" cart button (default true) */ cta?: boolean };
type Ctx = {
  lines: CartLine[]; count: number; total: number; open: boolean; bump: number;
  notice: Notice | null; announce: (n: Omit<Notice, "key"> | null) => void;
  setOpen: (o: boolean) => void;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};
/** old carts: "Bibita Sbrano" was a flavor; it no longer exists, so it becomes Pepsi (the default soda) */
const PEPSI = { name: "Pepsi", img: "/assets/drinks/pepsi.webp" };
function migrate(raw: CartLine[]): CartLine[] {
  const out: CartLine[] = [];
  for (const l0 of Array.isArray(raw) ? raw : []) {
    let l = l0;
    if (l.id === "bibita") l = { ...l, id: "bibita-pepsi", name: `Bibita ${PEPSI.name}`, img: PEPSI.img };
    if (l.menu && /sbrano/i.test(l.menu.drink + l.menu.drinkImg))
      l = { ...l, id: l.id.replace(/-menu-sbrano$/, "-menu-pepsi"), menu: { ...l.menu, drink: PEPSI.name, drinkImg: PEPSI.img } };
    const ex = out.find((o) => o.id === l.id);
    if (ex) ex.qty += l.qty; else out.push({ ...l });
  }
  return out;
}
const CartCtx = createContext<Ctx | null>(null);
const KEY = "sbrano-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const announce = useCallback((n: Omit<Notice, "key"> | null) => setNotice(n ? { ...n, key: Date.now() } : null), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setLines(migrate(JSON.parse(raw))); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, ready]);

  const add = useCallback((l: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const ex = prev.find((p) => p.id === l.id);
      if (ex) return prev.map((p) => (p.id === l.id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { ...l, qty }];
    });
    setBump((b) => b + 1);
    // default confirmation sticker; callers can override right after with announce()
    setNotice({ key: Date.now(), title: tr("Preso!"), sub: tr("{name} è nel carrello.", { name: trName(l.name) }), img: l.img });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p))));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
    return { lines, count, total, open, setOpen, add, setQty, clear, bump, notice, announce };
  }, [lines, open, add, setQty, clear, bump, notice, announce]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
