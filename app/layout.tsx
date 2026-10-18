import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider, LangKey } from "@/lib/i18n";
import { CartProvider } from "@/components/cart/CartProvider";
import SmoothScroll from "@/components/SmoothScroll";
import CartToast from "@/components/cart/CartToast";
import Micro from "@/components/Micro";
import CartDrawer from "@/components/cart/LazyCartDrawer";
import Preloader from "@/components/Preloader";
import CookieLine from "@/components/CookieLine";

// display font: Latin subset WOFF2 (390 KB TTF -> 67 KB), preloaded; metric-matched fallback limits FOUT jumps
const lunar = localFont({
  src: "./fonts/LunarBlob-Regular.woff2",
  variable: "--font-lunar",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Arial Black", "Impact", "sans-serif"],
});
const excon = localFont({
  src: [
    { path: "./fonts/Excon-Regular.woff2", weight: "400" },
    { path: "./fonts/Excon-Medium.woff2", weight: "500" },
    { path: "./fonts/Excon-Bold.woff2", weight: "700" },
    { path: "./fonts/Excon-Black.woff2", weight: "900" },
  ],
  variable: "--font-excon",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

// Tanker: condensed uppercase display (names, nav, footer, day bar). Comico: hand-lettered marker caps for accents (stickers, notes, 404). Both Fontshare / ITF FFL, self-hosted.
const tanker = localFont({
  src: "./fonts/Tanker-Regular.woff2",
  variable: "--font-tanker-src",
  display: "swap",
  preload: true,
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});
const marker = localFont({
  src: "./fonts/Comico-Regular.woff2",
  variable: "--font-marker-src",
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["Comic Sans MS", "cursive"],
});

/** preloader sticker pile: [src, w, h, burst x, burst y, rotation] (burst in vmax) */
const PILE: [string, number, number, number, number, number, number, number][] = [
  // [file, w, h, pile x %, pile y %, burst x vmax, burst y vmax, rotation]
  ["fame-brutta", 300, 169, -30, -24, -60, -40, -14],
  ["vanchiglia", 300, 301, 30, -26, 62, -46, 12],
  ["smash", 300, 302, -30, 22, -66, 34, 9],
  ["prezzi-giusti", 300, 198, 30, 24, 58, 42, -8],
  ["sbrana", 300, 302, 2, -34, 4, -70, -6],
  ["mascot-wave", 300, 276, -4, 32, -10, 72, 7],
  ["mascot-crown", 300, 344, 0, 0, 0, 0, -3],
];

export const metadata: Metadata = {
  metadataBase: new URL("https://demo-sbrano.vercel.app"),
  title: "SBRANO | Smash burger a Torino",
  description:
    "SBRANO, concept di street burger ambientato in Piazza Santa Giulia, Vanchiglia, Torino. Smash burger, pollo croccante e patatine. Progetto demo di Michel Branche.",
  openGraph: { title: "SBRANO | Street burger a Torino", images: ["/assets/brand/case-study.webp"] },
};
export const viewport: Viewport = { themeColor: "#111111" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning className={`${lunar.variable} ${excon.variable} ${tanker.variable} ${marker.variable}`}>
      <head>
        <link rel="preload" as="image" href="/assets/brand/logo-compact.webp" fetchPriority="high" />
        {/* preloader only on the first visit of the session, never with reduced motion: decided before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement;if(sessionStorage.getItem("sb-pre")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("sb-nopre");else sessionStorage.setItem("sb-pre","1")}catch(e){}` }} />
        {/* saved language: <html lang> before first paint (the copy itself switches in I18nProvider) */}
        <script dangerouslySetInnerHTML={{ __html: `try{var l=localStorage.getItem("sb-lang");if(l==="en"||l==="fr")document.documentElement.lang=l}catch(e){}` }} />
      </head>
      <body>
        <div id="sb-preloader" className="sb-preloader" role="button" tabIndex={-1} aria-label="Salta intro" suppressHydrationWarning>
          <div className="sb-pile" aria-hidden="true">
            {PILE.map(([n, w, h, px, py, x, y, r], i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={n} src={`/assets/stickers/${n}.webp`} alt="" width={w} height={h} decoding="async"
                style={{ ["--i" as string]: i, left: `${50 + px}%`, top: `${50 + py}%`, ["--x" as string]: `${x}vmax`, ["--y" as string]: `${y}vmax`, ["--r" as string]: `${r}deg` } as React.CSSProperties} />
            ))}
          </div>
          <p className="sb-pre-copy" aria-hidden="true"><span data-pre="0" suppressHydrationWarning>Scaldo la piastra...</span><span data-pre="1" suppressHydrationWarning>Pronto. Sbrana.</span></p>
          <span className="sb-pre-skip" data-pre="2" suppressHydrationWarning>Tocca per saltare</span>
        </div>
        {/* preloader copy in the saved language, swapped before it is painted */}
        <script dangerouslySetInnerHTML={{ __html: `try{var L={en:["Heating the grill...","Ready. Go wild.","Tap to skip","Skip intro"],fr:["Je chauffe la plancha...","Prêt. Croque.","Touche pour passer","Passer l'intro"]}[localStorage.getItem("sb-lang")];if(L){document.querySelectorAll("[data-pre]").forEach(function(e){e.textContent=L[+e.getAttribute("data-pre")]});var p=document.getElementById("sb-preloader");p&&p.setAttribute("aria-label",L[3])}}catch(e){}` }} />
        <I18nProvider>
        <CartProvider>
          <Preloader />
          <SmoothScroll />
          <LangKey>{children}</LangKey>
          <CartDrawer />
          <CartToast />
          <Micro />
          <CookieLine />
        </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
