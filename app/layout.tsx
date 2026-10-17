import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import SmoothScroll from "@/components/SmoothScroll";
import CartToast from "@/components/cart/CartToast";
import Micro from "@/components/Micro";
import CartDrawer from "@/components/cart/LazyCartDrawer";
import Preloader from "@/components/Preloader";

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
    <html lang="it" className={`${lunar.variable} ${excon.variable}`}>
      <head>
        <link rel="preload" as="image" href="/assets/brand/logo-compact.webp" fetchPriority="high" />
      </head>
      <body>
        <div id="sb-preloader" className="sb-preloader" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/logo-compact.webp" alt="" width={720} height={250} fetchPriority="high" />
          <span className="sb-preloader-bar"><i /></span>
        </div>
        <CartProvider>
          <Preloader />
          <SmoothScroll />
          {children}
          <CartDrawer />
          <CartToast />
          <Micro />
        </CartProvider>
      </body>
    </html>
  );
}
