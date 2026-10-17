"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  id: string; name: string; price: number; img: string; qty: number; note?: string;
  /** custom builder burger: layer ids bottom→top (incl. buns) and readable ingredient names */
  layers?: string[]; ingredients?: string[];
};
type Ctx = {
  lines: CartLine[]; count: number; total: number; open: boolean; bump: number;
  setOpen: (o: boolean) => void;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "sbrano-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setLines(JSON.parse(raw)); } catch {}
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
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p))));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
    return { lines, count, total, open, setOpen, add, setQty, clear, bump };
  }, [lines, open, add, setQty, clear, bump]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
