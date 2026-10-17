export type Cat = "manzo" | "pollo" | "piccante" | "contorni" | "bibite";

export type MenuItem = {
  id: string; name: string; price: number; img: string; cutout: boolean;
  cats: Cat[]; tag: string; desc: string; kcal: number;
};

export const MENU: MenuItem[] = [
  { id: "sbranatore", name: "Sbranatore", price: 12.5, img: "/assets/menu/sbranatore.webp", cutout: true, cats: ["manzo"], tag: "Best seller", desc: "Doppio smash, cheddar fuso, bacon, cetrioli, cipolla rossa. Il re della piazza.", kcal: 980 },
  { id: "mordi-e-fuggi", name: "Mordi e Fuggi", price: 11.9, img: "/assets/menu/mordi-e-fuggi.webp", cutout: false, cats: ["manzo", "piccante"], tag: "Piccante", desc: "Smash, bacon, jalapeño e salsa spicy. Morsi veloci, lacrime vere.", kcal: 890 },
  { id: "pollo-ruggente", name: "Pollo Ruggente", price: 10.9, img: "/assets/menu/pollo-ruggente.webp", cutout: true, cats: ["pollo"], tag: "Croccante", desc: "Pollo fritto croccante, cheddar, bacon, cetrioli. Fa rumore.", kcal: 860 },
  { id: "pollo-teriyaki", name: "Pollo Teriyaki", price: 11.5, img: "/assets/menu/pollo-teriyaki-extra.webp", cutout: true, cats: ["pollo"], tag: "Novità", desc: "Pollo glassato teriyaki, bacon, pomodoro, cetrioli. Torino incontra Tokyo.", kcal: 910 },
  { id: "patatine", name: "Patatine Sbrano", price: 4.5, img: "/assets/packaging/fries.webp", cutout: true, cats: ["contorni"], tag: "Tagliate a mano", desc: "Patate vere, doppia frittura, sale grosso. Dipendenza garantita.", kcal: 420 },
  { id: "bibita", name: "Bibita Sbrano", price: 3.5, img: "/assets/packaging/cup.webp", cutout: true, cats: ["bibite"], tag: "Ghiacciata", desc: "Bibita alla spina nel bicchierone lime. Ghiaccio a volontà.", kcal: 180 },
];

export const FILTERS: { id: Cat; label: string }[] = [
  { id: "manzo", label: "Manzo" },
  { id: "pollo", label: "Pollo" },
  { id: "piccante", label: "Piccante" },
  { id: "contorni", label: "Contorni" },
  { id: "bibite", label: "Bibite" },
];

export type Ingredient = {
  id: string; name: string; img: string; price: number; kcal: number;
  /** visual thickness in px at 100% width (stack step) */
  h: number; /** rendered width as % of stack width */ w: number; ratio: number;
  spicy?: boolean;
};

export const INGREDIENTS: Ingredient[] = [
  { id: "patty", name: "Smash di manzo", img: "/assets/ingredients/patty.webp", price: 3, kcal: 280, h: 30, w: 92, ratio: 1.5 },
  { id: "chicken", name: "Pollo croccante", img: "/assets/ingredients/chicken.webp", price: 3, kcal: 310, h: 34, w: 96, ratio: 2.29 },
  { id: "cheddar", name: "Cheddar", img: "/assets/ingredients/cheddar.webp", price: 1, kcal: 110, h: 14, w: 96, ratio: 1.5 },
  { id: "bacon", name: "Bacon", img: "/assets/ingredients/bacon.webp", price: 1.5, kcal: 140, h: 16, w: 92, ratio: 2 },
  { id: "lettuce", name: "Insalata", img: "/assets/ingredients/lettuce.webp", price: 0.3, kcal: 5, h: 18, w: 104, ratio: 2 },
  { id: "tomato", name: "Pomodoro", img: "/assets/ingredients/tomato.webp", price: 0.4, kcal: 10, h: 16, w: 82, ratio: 1.5 },
  { id: "red-onion", name: "Cipolla rossa", img: "/assets/ingredients/red-onion.webp", price: 0.3, kcal: 15, h: 14, w: 90, ratio: 2 },
  { id: "pickles", name: "Cetrioli", img: "/assets/ingredients/pickles.webp", price: 0.4, kcal: 5, h: 14, w: 86, ratio: 1.5 },
  { id: "onion-ring", name: "Onion ring", img: "/assets/ingredients/onion-ring.webp", price: 1.2, kcal: 120, h: 22, w: 80, ratio: 1.5 },
  { id: "jalapeno", name: "Jalapeño", img: "/assets/ingredients/jalapeno.webp", price: 0.6, kcal: 10, h: 14, w: 84, ratio: 2, spicy: true },
  { id: "mayo", name: "Maionese", img: "/assets/ingredients/mayo.webp", price: 0.5, kcal: 90, h: 10, w: 86, ratio: 3 },
  { id: "sauce-spicy", name: "Salsa spicy", img: "/assets/ingredients/sauce-spicy.webp", price: 0.6, kcal: 80, h: 10, w: 86, ratio: 3, spicy: true },
  { id: "teriyaki", name: "Teriyaki", img: "/assets/ingredients/teriyaki.webp", price: 0.6, kcal: 70, h: 10, w: 86, ratio: 3 },
];

export const BUN_BOTTOM: Ingredient = { id: "bun-bottom", name: "Pane sotto", img: "/assets/ingredients/bun-bottom.webp", price: 1.5, kcal: 150, h: 34, w: 100, ratio: 1.5 };
export const BUN_TOP: Ingredient = { id: "bun-top", name: "Pane sopra", img: "/assets/ingredients/bun-top.webp", price: 1.5, kcal: 170, h: 0, w: 102, ratio: 1.5 };

export const euro = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
