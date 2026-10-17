"use client";
import { forwardRef } from "react";

type Props = {
  children: React.ReactNode; href?: string; onClick?: () => void;
  variant?: "dark" | "lime" | "cream"; icon?: React.ReactNode; className?: string; type?: "button" | "submit";
};
const styles = {
  dark: "bg-ink text-lime",
  lime: "bg-lime text-ink",
  cream: "bg-cream text-ink",
};

/** Pill + circle button (Zumit style). Circle rotates and pill shifts on hover. */
const PillButton = forwardRef<HTMLAnchorElement & HTMLButtonElement, Props>(function PillButton(
  { children, href, onClick, variant = "dark", icon = "↗", className = "", type = "button" }, ref) {
  const inner = (
    <>
      <span className={`flex h-12 items-center rounded-full px-6 text-[13px] font-bold uppercase tracking-[0.08em] transition-transform duration-300 group-hover:-translate-x-0.5 md:h-14 md:px-7 ${styles[variant]}`}>{children}</span>
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-transform duration-500 ease-[cubic-bezier(.2,1.6,.4,1)] group-hover:translate-x-1 group-hover:rotate-45 md:h-14 md:w-14 ${styles[variant]}`}>{icon}</span>
    </>
  );
  const cls = `group inline-flex items-center gap-1 select-none ${className}`;
  if (href) return <a ref={ref} href={href} className={cls} onClick={onClick} data-mag="0.18">{inner}</a>;
  return <button ref={ref} type={type} className={cls} onClick={onClick} data-mag="0.18">{inner}</button>;
});
export default PillButton;
