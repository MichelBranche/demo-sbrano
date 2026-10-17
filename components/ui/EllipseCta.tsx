/**
 * Marker-ellipse CTA: Tanker label inside a hand-drawn loop that redraws itself on hover (~0.4s)
 * and tips forward a little. Pure CSS (stroke-dashoffset on a tiny SVG + transform).
 */
export default function EllipseCta({ href, children, className = "", size = "md", onClick, label }: {
  href: string; children: React.ReactNode; className?: string; size?: "sm" | "md" | "lg"; onClick?: () => void; label?: string;
}) {
  const s = size === "sm" ? "h-7 px-3 text-[15px]" : size === "lg" ? "h-16 px-9 text-[34px]" : "h-12 px-6 text-[24px]";
  return (
    <a href={href} onClick={onClick} aria-label={label} className={`sb-ell group relative inline-flex items-center justify-center font-tanker uppercase leading-none ${s} ${className}`}>
      <span className="sb-ell-t relative z-10 pt-[0.08em]">{children}</span>
      <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-[10%] -inset-y-[22%] h-[144%] w-[120%] overflow-visible">
        <path pathLength={1} d="M30 56 C 4 40, 30 10, 100 8 C 170 6, 198 26, 192 44 C 186 64, 140 74, 92 73 C 44 72, 8 60, 12 40 C 15 26, 40 16, 62 13"
          fill="none" stroke="currentColor" strokeWidth={size === "sm" ? 2.2 : 3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </a>
  );
}
