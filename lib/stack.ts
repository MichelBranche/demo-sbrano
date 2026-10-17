import { BUN_BOTTOM, BUN_TOP, INGREDIENTS, type Ingredient } from "./data";

/** Logical stack width (px) the layout math is based on. */
export const STACK_W = 260;
const K = (STACK_W / 300) * 1.15;

export const ingById = (id: string): Ingredient | undefined =>
  id === BUN_BOTTOM.id ? BUN_BOTTOM : id === BUN_TOP.id ? BUN_TOP : INGREDIENTS.find((i) => i.id === id);

/** Bottom offsets (px from the plate) of every layer, the top-bun offset and the visual height. */
export function stackLayout(layers: Ingredient[]) {
  let acc = 0;
  const offsets = layers.map((l) => { const o = acc * K; acc += l.h; return o; });
  const top = layers.length ? Math.max(0, (acc - 6) * K + 14) : 0;
  const bunTopH = (STACK_W * (BUN_TOP.w / 100)) / BUN_TOP.ratio;
  const height = top + bunTopH * 0.7;
  return { offsets, top, height, bunTopH };
}

const cache = new Map<string, Promise<HTMLImageElement>>();
function load(src: string) {
  if (!cache.has(src)) {
    cache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    }));
  }
  return cache.get(src)!;
}

/**
 * Render the assembled burger (bun-bottom ... fillings ... bun-top) to a canvas and
 * return a compact WebP/PNG data URL that can live in localStorage.
 */
export async function composeBurger(ids: string[], size = 320): Promise<string> {
  const ings = ids.map(ingById).filter(Boolean) as Ingredient[];
  const body = ings.filter((i) => i.id !== BUN_TOP.id);
  const hasTop = ings.some((i) => i.id === BUN_TOP.id);
  const { offsets, top } = stackLayout(body);
  const imgs = await Promise.all(ings.map((i) => load(i.img)));
  const boxH = (i: Ingredient) => (STACK_W * i.w) / 100 / i.ratio;
  // logical bounds
  let maxY = 0;
  body.forEach((l, i) => { maxY = Math.max(maxY, offsets[i] + boxH(l)); });
  if (hasTop) maxY = Math.max(maxY, top + boxH(BUN_TOP));
  const lw = STACK_W * 1.1, lh = maxY + 8;
  const scale = Math.min(size / lw, size / lh);
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  const ox = (size - lw * scale) / 2, oy = (size - lh * scale) / 2;
  const draw = (ing: Ingredient, im: HTMLImageElement, off: number) => {
    const w = (STACK_W * ing.w) / 100, h = w / ing.ratio;
    // object-contain + object-bottom inside the w x h box
    const r = Math.min(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * r, dh = im.naturalHeight * r;
    const x = (lw - dw) / 2, y = lh - 4 - off - dh;
    ctx.drawImage(im, ox + x * scale, oy + y * scale, dw * scale, dh * scale);
  };
  body.forEach((l, i) => draw(l, imgs[ings.indexOf(l)], offsets[i]));
  if (hasTop) draw(BUN_TOP, imgs[ings.findIndex((i) => i.id === BUN_TOP.id)], top);
  const webp = c.toDataURL("image/webp", 0.82);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/png");
}
