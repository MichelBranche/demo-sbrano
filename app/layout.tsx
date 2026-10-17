import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import SmoothScroll from "@/components/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";

const lunar = localFont({
  src: "./fonts/LunarBlob-Regular.ttf",
  variable: "--font-lunar",
  display: "swap",
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
});

export const metadata: Metadata = {
  title: "SBRANO | Fame brutta. Prezzi giusti. | Street burger Torino",
  description:
    "SBRANO, street burger in Piazza Santa Giulia, Vanchiglia, Torino. Smash burger, pollo croccante, patatine. Demo concept di Michel Branche.",
  openGraph: { title: "SBRANO, street burger Torino", images: ["/assets/brand/case-study.webp"] },
};
export const viewport: Viewport = { themeColor: "#111111" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${lunar.variable} ${excon.variable}`}>
      <body>
        <CartProvider>
          <SmoothScroll />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
