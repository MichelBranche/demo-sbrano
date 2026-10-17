export type Cat = "manzo" | "pollo" | "piccante" | "contorni" | "bibite";

export type MenuItem = {
  id: string; name: string; price: number; img: string; cutout: boolean;
  cats: Cat[]; tag: string; desc: string; kcal?: number;
  /** limited run: shows the Special edition tag and travels to the cart with that note */
  special?: boolean;
  /** extra small tags shown next to the main one (e.g. "Novità") */
  tags?: string[];
};

export const MENU: MenuItem[] = [
  { id: "sbranatore", name: "Sbranatore", price: 12.5, img: "/assets/menu/sbranatore.webp", cutout: true, cats: ["manzo"], tag: "Il più scelto", desc: "Doppio smash, cheddar che cola, bacon. Per chi ha fame brutta davvero.", kcal: 980 },
  { id: "tonyptony", name: "TonyPTony", price: 15.9, img: "/assets/menu/tonyptony.webp", cutout: false, cats: ["manzo"], tag: "Special edition", tags: ["Novità"], special: true, desc: "Il Fuorilegge. Il panino che non chiede permesso.", },
  { id: "mordi-e-fuggi", name: "Mordi e Fuggi", price: 11.9, img: "/assets/menu/mordi-e-fuggi.webp", cutout: true, cats: ["manzo", "piccante"], tag: "Piccante", desc: "Piccante. Mordi, piangi, ritorna.", kcal: 890 },
  { id: "pollo-ruggente", name: "Pollo Ruggente", price: 10.9, img: "/assets/menu/pollo-ruggente.webp", cutout: true, cats: ["pollo"], tag: "Croccante", desc: "Croccante come un beat old school.", kcal: 860 },
  { id: "pollo-teriyaki", name: "Pollo Teriyaki", price: 11.5, img: "/assets/menu/pollo-teriyaki-extra.webp", cutout: true, cats: ["pollo"], tag: "Novità", desc: "Pollo con salsa teriyaki, bacon, pomodoro e cetrioli.", kcal: 910 },
  { id: "patatine", name: "Patatine Sbrano", price: 4.5, img: "/assets/packaging/fries.webp", cutout: true, cats: ["contorni"], tag: "Tagliate a mano", desc: "Patatine con sale grosso.", kcal: 420 },
  { id: "bibita", name: "Bibita", price: 3.5, img: "/assets/drinks/sbrano.webp", cutout: true, cats: ["bibite"], tag: "Bibite", desc: "Refill libero. Sì, puoi tornare al banco.", kcal: 180 },
];

/** the two specials sharing the "burger del mese" section: one photo each, a clean switch between them */
export type Special = {
  id: string; name: string; l1: string; l2: string; price: number; kcal?: number; img: string; photo: string; poster?: boolean;
  alt: string; eyebrow: string; tab: string; tagline?: string; tags?: string[]; note: string; sticker?: string; overlay?: string;
  acc: { t: string; chips: string[] }[];
};
export const SPECIALS: Special[] = [
  { id: "diavolo", name: "Il Diavolo di Vanchiglia", l1: "Il Diavolo", l2: "di Vanchiglia", price: 12.9, kcal: 1040, img: "/assets/promo/burger-mese.webp", photo: "/assets/promo/burger-mese.webp",
    alt: "Il Diavolo di Vanchiglia: cheeseburger piccante con bacon e jalapeño", eyebrow: "La proposta del mese", tab: "Burger del mese", note: "Burger del mese",
    sticker: "Solo a ottobre, poi sparisce.", overlay: "Diavolo",
    acc: [{ t: "Ingredienti", chips: ["Doppio smash", "Cheddar", "Bacon croccante", "Jalapeño", "Salsa spicy", "Brioche al sesamo"] }, { t: "Allergeni", chips: ["Glutine", "Latte", "Uova", "Sesamo", "Senape"] }] },
  { id: "tonyptony", name: "TonyPTony", l1: "TonyPTony", l2: "Il Fuorilegge", price: 15.9, img: "/assets/menu/tonyptony.webp", photo: "/assets/promo/tonyptony.webp", poster: true,
    alt: "Poster di TonyPTony, il Fuorilegge: burger di manzo con Taleggio, cialda di polenta, radicchio e cipolla caramellata", eyebrow: "Special edition", tab: "Special edition",
    tagline: "Il panino che non chiede permesso.", tags: ["Novità"], note: "Special edition",
    acc: [{ t: "Ingredienti", chips: ["Potato bun tostato al burro", "180 g di manzo alla griglia", "35 g di Taleggio DOP fuso", "Cialda croccante di polenta", "Cipolla rossa caramellata", "Radicchio fresco", "Salsa BBQ artigianale al vino rosso, miele e aceto balsamico"] },
      { t: "Allergeni", chips: ["Glutine", "Latte", "Solfiti"] }] },
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
  group: IngGroup;
  /** short line for the builder card */
  desc?: string;
};

export type IngGroup = "base" | "formaggi" | "salse" | "verdure" | "croccanti";
export const ING_GROUPS: { id: IngGroup; label: string; hint: string }[] = [
  { id: "base", label: "Base / Proteine", hint: "Proteine" },
  { id: "formaggi", label: "Formaggi", hint: "Formaggi" },
  { id: "salse", label: "Salse", hint: "Salse" },
  { id: "verdure", label: "Verdure", hint: "Verdure" },
  { id: "croccanti", label: "Extra croccanti", hint: "Extra croccanti" },
];

export const INGREDIENTS: Ingredient[] = [
  { id: "patty", name: "Smash di manzo", img: "/assets/ingredients/patty.webp", price: 3, kcal: 280, h: 30, w: 92, ratio: 1.5, group: "base", desc: "Manzo pressato sulla piastra." },
  { id: "chicken", name: "Pollo croccante", img: "/assets/ingredients/chicken.webp", price: 3, kcal: 310, h: 34, w: 96, ratio: 2.29, group: "base", desc: "Pollo impanato e fritto." },
  { id: "cheddar", name: "Cheddar", img: "/assets/ingredients/cheddar.webp", price: 1, kcal: 110, h: 14, w: 96, ratio: 1.5, group: "formaggi", desc: "Fetta fusa e filante." },
  { id: "bacon", name: "Bacon", img: "/assets/ingredients/bacon.webp", price: 1.5, kcal: 140, h: 16, w: 92, ratio: 2, group: "croccanti", desc: "Croccante e affumicato." },
  { id: "lettuce", name: "Insalata", img: "/assets/ingredients/lettuce.webp", price: 0.3, kcal: 5, h: 18, w: 104, ratio: 2, group: "verdure", desc: "Iceberg fresca e croccante." },
  { id: "tomato", name: "Pomodoro", img: "/assets/ingredients/tomato.webp", price: 0.4, kcal: 10, h: 16, w: 82, ratio: 1.5, group: "verdure", desc: "Fetta matura e succosa." },
  { id: "red-onion", name: "Cipolla rossa", img: "/assets/ingredients/red-onion.webp", price: 0.3, kcal: 15, h: 14, w: 90, ratio: 2, group: "verdure", desc: "Anelli crudi, gusto deciso." },
  { id: "pickles", name: "Cetrioli", img: "/assets/ingredients/pickles.webp", price: 0.4, kcal: 5, h: 14, w: 86, ratio: 1.5, group: "verdure", desc: "Cetriolini in agrodolce." },
  { id: "onion-ring", name: "Onion ring", img: "/assets/ingredients/onion-ring.webp", price: 1.2, kcal: 120, h: 22, w: 80, ratio: 1.5, group: "croccanti", desc: "Anello dorato e croccante." },
  { id: "jalapeno", name: "Jalapeño", img: "/assets/ingredients/jalapeno.webp", price: 0.6, kcal: 10, h: 14, w: 84, ratio: 2, spicy: true, group: "verdure", desc: "Rondelle piccanti." },
  { id: "mayo", name: "Maionese", img: "/assets/ingredients/mayo.webp", price: 0.5, kcal: 90, h: 10, w: 86, ratio: 3, group: "salse", desc: "Cremosa e delicata." },
  { id: "sauce-spicy", name: "Salsa spicy", img: "/assets/ingredients/sauce-spicy.webp", price: 0.6, kcal: 80, h: 10, w: 86, ratio: 3, spicy: true, group: "salse", desc: "Salsa cremosa piccante." },
  { id: "teriyaki", name: "Teriyaki", img: "/assets/ingredients/teriyaki.webp", price: 0.6, kcal: 70, h: 10, w: 86, ratio: 3, group: "salse", desc: "Dolce, salata e lucida." },
];

export const BUN_BOTTOM: Ingredient = { id: "bun-bottom", name: "Pane sotto", img: "/assets/ingredients/bun-bottom.webp", price: 1.5, kcal: 150, h: 34, w: 100, ratio: 1.5, group: "base" };
export const BUN_TOP: Ingredient = { id: "bun-top", name: "Pane sopra", img: "/assets/ingredients/bun-top.webp", price: 1.5, kcal: 170, h: 0, w: 102, ratio: 1.5, group: "base" };

/** builder bread choice: a bottom + top pair. The surcharge sits on the bottom half. Ids starting with "bun-top" are always a top. */
export type Bread = { id: string; name: string; desc: string; extra: number; bottom: Ingredient; top: Ingredient };
const B = "/assets/ingredients/breads/";
const bun = (base: Ingredient, id: string, img: string, extra = 0, kcal = 0): Ingredient => ({ ...base, id, img, price: base.price + extra, kcal: base.kcal + kcal });
export const BREADS: Bread[] = [
  { id: "classico", name: "Brioche classico", desc: "Soffice e dorato, incluso.", extra: 0, bottom: bun(BUN_BOTTOM, "bun-bottom-classico", B + "bun-bottom-classico.webp"), top: bun(BUN_TOP, "bun-top-classico", B + "bun-top-classico.webp") },
  { id: "sesamo", name: "Brioche al sesamo", desc: "Brioche con semi di sesamo.", extra: 0.5, bottom: bun(BUN_BOTTOM, "bun-bottom-sesamo", B + "bun-bottom-classico.webp", 0.5), top: bun(BUN_TOP, "bun-top-sesamo", B + "bun-top-sesamo.webp") },
  { id: "carbone", name: "Brioche al carbone", desc: "Impasto nero al carbone vegetale.", extra: 0.5, bottom: bun(BUN_BOTTOM, "bun-bottom-carbone", B + "bun-bottom-carbone.webp", 0.5), top: bun(BUN_TOP, "bun-top-carbone", B + "bun-top-carbone.webp") },
  { id: "rustico", name: "Pane rustico", desc: "Crosta piena, mollica soffice.", extra: 0.5, bottom: bun(BUN_BOTTOM, "bun-bottom-rustico", B + "bun-bottom-rustico.webp", 0.5, 20), top: bun(BUN_TOP, "bun-top-rustico", B + "bun-top-rustico.webp", 0, 20) },
];
/** every bun the cart can meet, including the legacy ids of carts saved before the bread choice */
export const BUNS: Ingredient[] = [...BREADS.flatMap((b) => [b.bottom, b.top]), BUN_BOTTOM, BUN_TOP];
export const isTop = (id: string) => id.startsWith("bun-top");

/** "Fallo menu": burger + Patatine Sbrano + a drink of choice */
export const MENU_UPGRADE = 3.5;
export const MENU_FRIES = { name: "Patatine Sbrano", img: "/assets/packaging/fries.webp" };
/** "Fallo menu" fries choice (same menu price for all three) */
export const FRIES: { id: string; name: string; full: string; desc: string; img: string }[] = [
  { id: "classiche", name: "Classiche", full: "Patatine classiche", desc: "Tagliate a mano, sale grosso.", img: "/assets/packaging/fries.webp" },
  { id: "curly", name: "Curly", full: "Patatine curly", desc: "A spirale, speziate.", img: "/assets/packaging/fries-curly.webp" },
  { id: "rustiche", name: "Rustiche", full: "Patatine rustiche", desc: "Spicchi con la buccia.", img: "/assets/packaging/fries-rustiche.webp" },
];
/** available sodas (first = default). The lidded Sbrano cup is only the generic "Bibita" image. */
export const DRINKS: { id: string; name: string; img: string; tint: string }[] = [
  { id: "pepsi", name: "Pepsi", img: "/assets/drinks/pepsi.webp", tint: "#f6ebd7" },
  { id: "fanta", name: "Fanta", img: "/assets/drinks/fanta.webp", tint: "#f6ebd7" },
  { id: "sprite", name: "Sprite", img: "/assets/drinks/sprite.webp", tint: "#f6ebd7" },
];

export const euro = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
