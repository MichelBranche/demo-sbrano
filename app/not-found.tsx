import type { Metadata } from "next";
import NotFoundBody from "@/components/NotFoundBody";

export const metadata: Metadata = { title: "404 | SBRANO", robots: { index: false } };

export default function NotFound() {
  return <NotFoundBody />;
}
