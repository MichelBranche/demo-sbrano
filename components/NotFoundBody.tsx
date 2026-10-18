"use client";
import Image from "next/image";
import Link from "next/link";
import EllipseCta from "@/components/ui/EllipseCta";
import { useT } from "@/lib/i18n";

/** 404 body (client, so it follows the chosen language) */
export default function NotFoundBody() {
  const { t } = useT();
  return (
    <main className="p-2 md:p-3">
      <section className="grain relative flex min-h-[calc(100svh-16px)] flex-col items-center justify-center overflow-hidden rounded-[28px] bg-lime px-5 py-16 text-center text-ink md:min-h-[calc(100svh-24px)] md:rounded-[40px]" aria-labelledby="nf-title">
        <Link href="/" className="absolute left-4 top-4 flex h-12 items-center rounded-full bg-cream px-4" aria-label={t("SBRANO home")}>
          <Image src="/assets/brand/logo-compact.webp" alt="SBRANO" width={720} height={250} priority sizes="160px" className="h-8 w-auto" />
        </Link>
        <div className="relative">
          <h1 id="nf-title" className="font-display text-[clamp(7rem,4rem+22vw,20rem)] uppercase leading-[0.8]">404</h1>
          {/* mascot with its glasses knocked crooked: the whole sticker sits askew on the number */}
          <div className="absolute -right-[18%] -top-[22%] w-[clamp(110px,16vw,220px)] rotate-[18deg]">
            <Image src="/assets/stickers/mascot-wave.webp" alt={t("Mascotte SBRANO con gli occhiali storti")} width={300} height={276} priority className="h-auto w-full -scale-x-100 [transform-origin:center]" />
          </div>
        </div>
        <p className="mt-6 rotate-[-2deg] font-marker text-[clamp(1.6rem,1.2rem+1.6vw,2.8rem)] leading-none">{t("Ehi, ti sei perso. O peggio.")}</p>
        <p className="mt-5 max-w-[34rem] text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] font-medium leading-snug">
          {t("Hai aperto un link rotto, hai provato a fare l’hacker, o il sito è caduto")} <span className="font-marker">{t("(ne dubito)")}</span>{t(". Comunque ti sei beccato un 404.")}
        </p>
        <p className="mt-3 font-marker text-[clamp(1.3rem,1.1rem+0.8vw,1.9rem)] leading-none">{t("Torna a sbranare.")}</p>
        <EllipseCta href="/" size="lg" className="mt-10 text-ink">{t("Torna a casa")}</EllipseCta>
      </section>
    </main>
  );
}
