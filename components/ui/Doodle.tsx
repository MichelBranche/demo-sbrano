/** Hand-sprayed doodles (two sheets by Michel: "k-" black spray, "l-" lime marker), sliced into alpha masks.
 * Rendered as a CSS mask over currentColor, so any doodle can be tinted lime, cream or ink with a text colour class. */
export type DoodleName = "k-crown-rays" | "k-crown-tall" | "k-crown-burst" | "k-bolt" | "k-burst-arc" | "k-drip" | "k-burst" | "k-drip-wide" | "k-rays" | "k-arrow" | "k-arrow-long" | "k-swoosh" | "k-star" | "k-star-solid" | "l-crown" | "l-crown-tall" | "l-crown-burst" | "l-drip-wide" | "l-drip" | "l-rays-l" | "l-burst" | "l-rays-r" | "l-arrow" | "l-arrow-up" | "l-bolt" | "l-star" | "l-star-solid" | "l-swoosh";
const RATIO: Record<DoodleName, number> = { "k-crown-rays": 1.552, "k-crown-tall": 1.134, "k-crown-burst": 1.398, "k-bolt": 0.394, "k-burst-arc": 1.719, "k-drip": 0.75, "k-burst": 0.85, "k-drip-wide": 1.072, "k-rays": 1.228, "k-arrow": 1.374, "k-arrow-long": 2.161, "k-swoosh": 8.0, "k-star": 0.918, "k-star-solid": 0.903, "l-crown": 1.166, "l-crown-tall": 1.056, "l-crown-burst": 1.376, "l-drip-wide": 1.297, "l-drip": 0.758, "l-rays-l": 0.986, "l-burst": 1.184, "l-rays-r": 0.977, "l-arrow": 3.163, "l-arrow-up": 1.637, "l-bolt": 0.653, "l-star": 0.928, "l-star-solid": 0.807, "l-swoosh": 7.027 };

export default function Doodle({ name, className = "", style }: { name: DoodleName; className?: string; style?: React.CSSProperties }) {
  const url = `url(/assets/doodles/${name}.webp)`;
  return (
    <span aria-hidden className={`pointer-events-none block bg-current ${className}`}
      style={{ aspectRatio: RATIO[name], WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", ...style }} />
  );
}
