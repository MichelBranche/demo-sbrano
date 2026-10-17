import Image from "next/image";

export type BadgeIcon = "bolt" | "mascot" | "crown" | "fire" | "pin" | "star";

const Bolt = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="M13.5 2 4 13.5h6.2L9 22l10-12.5h-6.4L13.5 2Z" fill="currentColor" /></svg>
);
const Crown = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7Z" fill="currentColor" /></svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" /></svg>
);
const Star = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6L12 2Z" fill="currentColor" /></svg>
);
const Fire = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-4 2.2-5 .1 1.6.8 2.8 2 3.3C11 7.6 12 2 12 2Zm0 20a7 7 0 0 1-7-7c0-1 .2-2 .6-2.9A7 7 0 0 0 12 22Z" fill="currentColor" /></svg>
);

/**
 * Sticker-style section eyebrow: tilted lime badge, black outline, hard offset shadow,
 * small icon or mascot head. Copy should avoid apostrophes and em dashes (Lunar Blob).
 */
export default function Badge({ children, icon = "bolt", tilt = -3, dark = false, className = "" }: {
  children: React.ReactNode; icon?: BadgeIcon; tilt?: number; dark?: boolean; className?: string;
}) {
  return (
    <span className={`sb-badge inline-block ${className}`}>
      <span
        className={`inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-lime py-1 pl-1 pr-4 font-display text-[15px] uppercase leading-none text-ink md:text-[17px] ${dark ? "shadow-[3px_3px_0_#F6EBD7]" : "shadow-[3px_3px_0_#111]"}`}
        style={{ transform: `rotate(${tilt}deg)` }}>
        <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ${icon === "mascot" ? "border-2 border-ink bg-cream" : "bg-ink text-lime"}`}>
          {icon === "mascot" ? <Image src="/assets/mascot/eating-burger-filled.webp" alt="" width={40} height={27} className="h-auto w-[30px] max-w-none" /> :
            icon === "crown" ? <Crown /> : icon === "pin" ? <Pin /> : icon === "star" ? <Star /> : icon === "fire" ? <Fire /> : <Bolt />}
        </span>
        <span className="pt-[3px] sm:whitespace-nowrap">{children}</span>
      </span>
    </span>
  );
}
