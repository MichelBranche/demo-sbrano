"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });

/** The drawer (and Motion) is only downloaded when idle or when the cart is first opened. */
export default function LazyCartDrawer() {
  const { open } = useCart();
  const [load, setLoad] = useState(false);
  useEffect(() => {
    if (open) { setLoad(true); return; }
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setLoad(true)) : window.setTimeout(() => setLoad(true), 2500);
    return () => { if (!w.requestIdleCallback) clearTimeout(id); };
  }, [open]);
  return load ? <CartDrawer /> : null;
}
