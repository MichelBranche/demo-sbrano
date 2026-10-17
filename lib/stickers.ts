/** Brand stickers (transparent WebP from tools/import-stickers.py). Add new ones here after importing. */
export const STICKERS = {
  corona: { src: "/assets/stickers/corona.webp", w: 640, h: 613 },
  asterisco: { src: "/assets/stickers/asterisco.webp", w: 536, h: 640 },
} as const;
export type StickerName = keyof typeof STICKERS;
