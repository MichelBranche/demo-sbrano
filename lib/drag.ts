"use client";
import { gsap, reduced } from "./gsap";

/**
 * Makes `[data-drag]` stickers inside `scope` draggable with inertia (GSAP Draggable + InertiaPlugin,
 * free since 3.13). Only on real mouse devices: on touch they stay plain tappable stickers so page
 * scroll is never hijacked. Plugins are loaded lazily, so touch devices never download them.
 * Each sticker keeps its own fixed rotation on an inner element; Draggable only moves x/y.
 * Links still work: a press without movement is a normal click, a drag never triggers it.
 */
export function useDragStickers(scope: React.RefObject<HTMLElement | null>, bounds?: string) {
  return () => {
    if (typeof window === "undefined") return () => {};
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
    let dead = false;
    let list: { kill: () => void }[] = [];
    Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]).then(([{ Draggable }, { InertiaPlugin }]) => {
      if (dead || !scope.current) return;
      gsap.registerPlugin(Draggable, InertiaPlugin);
      const els = Array.from(scope.current.querySelectorAll<HTMLElement>("[data-drag]"));
      let z = 40;
      list = els.map((el) => Draggable.create(el, {
        type: "x,y",
        bounds: bounds ? (scope.current!.querySelector(bounds) ?? scope.current!) : scope.current!,
        inertia: !reduced(),
        edgeResistance: 0.75,
        dragClickables: true,
        minimumMovement: 4,
        zIndexBoost: false,
        onPress() { el.style.zIndex = String(++z); el.classList.add("is-grab"); },
        onRelease() { el.classList.remove("is-grab"); },
        onDragStart() { el.dataset.dragged = "1"; },
      })[0]);
      els.forEach((el) => el.classList.add("is-draggable"));
    });
    return () => { dead = true; list.forEach((d) => d.kill()); };
  };
}
