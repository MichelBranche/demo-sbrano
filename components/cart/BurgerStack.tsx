/* eslint-disable @next/next/no-img-element */
import { BUN_TOP } from "@/lib/data";
import { ingById, stackLayout, STACK_W } from "@/lib/stack";

/** Static, tiny rendering of a composed burger from its layer ids (fallback when no snapshot). */
export default function BurgerStack({ ids, size = 64 }: { ids: string[]; size?: number }) {
  const ings = ids.map(ingById).filter((i): i is NonNullable<typeof i> => !!i);
  const body = ings.filter((i) => i.id !== BUN_TOP.id);
  const hasTop = ings.length !== body.length;
  const { offsets, top, height } = stackLayout(body);
  const s = Math.min(size / (STACK_W * 1.1), size / Math.max(1, height + 20));
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <div className="absolute bottom-1 left-1/2 origin-bottom" style={{ width: STACK_W, height: height + 20, transform: `translateX(-50%) scale(${s})` }}>
        {body.map((l, i) => (
          <img key={i} src={l.img} alt="" className="absolute bottom-0 left-1/2 object-contain object-bottom" style={{ width: `${l.w}%`, aspectRatio: l.ratio, transform: `translate(-50%, ${-offsets[i]}px)`, zIndex: i + 1 }} />
        ))}
        {hasTop && <img src={BUN_TOP.img} alt="" className="absolute bottom-0 left-1/2 object-contain object-bottom" style={{ width: `${BUN_TOP.w}%`, aspectRatio: BUN_TOP.ratio, transform: `translate(-50%, ${-top}px)`, zIndex: 99 }} />}
      </div>
    </div>
  );
}
