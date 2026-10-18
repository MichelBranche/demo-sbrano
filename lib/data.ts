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
  { id: "tonyptony", name: "TonyPTony", price: 15.9, img: "/assets/menu/tonyptony-burger-v2.webp", cutout: true, cats: ["manzo"], tag: "Special edition", tags: ["Novità"], special: true, desc: "Il Fuorilegge. Il panino che non chiede permesso.", },
  { id: "mordi-e-fuggi", name: "Mordi e Fuggi", price: 11.9, img: "/assets/menu/mordi-e-fuggi.webp", cutout: true, cats: ["manzo", "piccante"], tag: "Piccante", desc: "Piccante. Mordi, piangi, ritorna.", kcal: 890 },
  { id: "pollo-ruggente", name: "Pollo Ruggente", price: 10.9, img: "/assets/menu/pollo-ruggente.webp", cutout: true, cats: ["pollo"], tag: "Croccante", desc: "Croccante come un beat old school.", kcal: 860 },
  { id: "pollo-teriyaki", name: "Pollo Teriyaki", price: 11.5, img: "/assets/menu/pollo-teriyaki-extra.webp", cutout: true, cats: ["pollo"], tag: "Novità", desc: "Pollo con salsa teriyaki, bacon, pomodoro e cetrioli.", kcal: 910 },
  { id: "patatine", name: "Patatine Sbrano", price: 4.5, img: "/assets/packaging/fries.webp", cutout: true, cats: ["contorni"], tag: "Tagliate a mano", desc: "Patatine con sale grosso.", kcal: 420 },
  { id: "bibita", name: "Bibita", price: 3.5, img: "/assets/drinks/sbrano.webp", cutout: true, cats: ["bibite"], tag: "Bibite", desc: "Refill libero. Sì, puoi tornare al banco.", kcal: 180 },
];

/** the drops showcase ("burger del mese / edizioni speciali"): one cutout per drop over a torn lime paper panel */
export type Special = {
  id: string; name: string; price: number; kcal?: number;
  /** product image that travels to the cart */ img: string;
  /** transparent cutout shown in the showcase */ cut: string;
  alt: string; pill: string; d1: string; d2: string; thumb: [string, string]; tagline: string;
  /** widest title line in em (Lunar Blob), used to fit the title to its column */ fit: number; /** first line width in em, places the crown doodle */ w1: number;
  /** round sticker (two lines) and torn paper label */ stamp: [string, string]; torn: string; note?: string;
  acc: { t: string; chips: string[] }[];
};
export const SPECIALS: Special[] = [
  { id: "tonyptony", name: "TonyPTony", price: 15.9, img: "/assets/menu/tonyptony-burger-v2.webp", cut: "/assets/menu/tonyptony-burger-v2.webp",
    alt: "TonyPTony, il Fuorilegge: burger di manzo con Taleggio fuso, cialda di polenta, radicchio, cipolla caramellata e BBQ al vino rosso",
    pill: "Drop #03 / Fino a domenica", d1: "Fuori", d2: "Legge", thumb: ["Il", "Fuorilegge"], fit: 2.35, w1: 2.17, stamp: ["Special", "drop"], torn: "Edizione limitata", tagline: "Il panino che non chiede permesso.", note: "Special edition",
    acc: [{ t: "Ingredienti", chips: ["Potato bun tostato al burro", "180 g di manzo alla griglia", "35 g di Taleggio DOP fuso", "Cialda croccante di polenta", "Cipolla rossa caramellata", "Radicchio fresco", "Salsa BBQ artigianale al vino rosso, miele e aceto balsamico"] },
      { t: "Allergeni", chips: ["Glutine", "Latte", "Solfiti"] }] },
  { id: "diavolo", name: "Il Diavolo di Vanchiglia", price: 12.9, kcal: 1040, img: "/assets/menu/diavolo.webp", cut: "/assets/menu/diavolo.webp",
    alt: "Il Diavolo di Vanchiglia: cheeseburger piccante con bacon e jalapeño nella carta Sbrano",
    pill: "Drop #02 / Solo a ottobre", d1: "Diavolo", d2: "Vanchiglia", thumb: ["Il", "Diavolo"], fit: 4.75, w1: 3.18, stamp: ["Burger", "del mese"], torn: "Piccante vero", tagline: "Solo a ottobre, poi sparisce.", note: "Burger del mese",
    acc: [{ t: "Ingredienti", chips: ["Doppio smash", "Cheddar", "Bacon croccante", "Jalapeño", "Salsa spicy", "Brioche al sesamo"] }, { t: "Allergeni", chips: ["Glutine", "Latte", "Uova", "Sesamo", "Senape"] }] },
  { id: "pollo-teriyaki", name: "Pollo Teriyaki", price: 11.5, kcal: 910, img: "/assets/menu/pollo-teriyaki-extra.webp", cut: "/assets/menu/pollo-teriyaki-extra.webp",
    alt: "Pollo Teriyaki: pollo croccante glassato con salsa teriyaki, bacon, pomodoro e cetrioli",
    pill: "Drop #01 / Novità in menu", d1: "Pollo", d2: "Teriyaki", thumb: ["Pollo", "Teriyaki"], fit: 3.75, w1: 2.24, stamp: ["Nuovo", "drop"], torn: "Ora in menu", tagline: "Pollo con salsa teriyaki, bacon, pomodoro e cetrioli.",
    acc: [{ t: "Ingredienti", chips: ["Pollo", "Salsa teriyaki", "Bacon", "Pomodoro", "Cetrioli"] }] },
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
  { id: "taleggio", name: "Taleggio DOP", img: "/assets/ingredients/taleggio.webp", price: 1.5, kcal: 120, h: 14, w: 98, ratio: 2, group: "formaggi", desc: "Fuso e cremoso. Ha carattere, come te." },
  { id: "radicchio", name: "Radicchio", img: "/assets/ingredients/radicchio.webp", price: 0.4, kcal: 10, h: 16, w: 98, ratio: 2, group: "verdure", desc: "Fresco e amaro quanto basta." },
  { id: "cipolla-caramellata", name: "Cipolla caramellata", img: "/assets/ingredients/cipolla-caramellata.webp", price: 0.6, kcal: 45, h: 16, w: 88, ratio: 2, group: "verdure", desc: "Rossa, cotta piano. Dolce senza fretta." },
  { id: "polenta", name: "Cialda di polenta", img: "/assets/ingredients/polenta.webp", price: 1.2, kcal: 130, h: 22, w: 84, ratio: 2, group: "croccanti", desc: "Croccante fuori, la nonna approva." },
  { id: "bbq-vino", name: "BBQ al vino rosso", img: "/assets/ingredients/bbq-vino.webp", price: 0.7, kcal: 85, h: 10, w: 88, ratio: 3, group: "salse", desc: "Vino rosso, miele e balsamico. Da fuorilegge." },
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
  { id: "potato", name: "Potato bun al burro", desc: "Soffice, tostato al burro. Quello di Tony.", extra: 0.5, bottom: bun(BUN_BOTTOM, "bun-bottom-potato", B + "bun-bottom-potato.webp", 0.5, 30), top: bun(BUN_TOP, "bun-top-potato", B + "bun-top-potato.webp") },
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
