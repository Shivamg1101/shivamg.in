"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A conic-gradient border that lights up and rotates to point at the cursor.
 * Masked to the element's border box so only the 1px rim is painted.
 */
export function GlowingEffect({
  spread = 40,
  proximity = 64,
  borderWidth = 2,
  disabled = false,
}: {
  spread?: number;
  proximity?: number;
  borderWidth?: number;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const angle = useRef(0);

  const onMove = useCallback(
    (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const card = el.parentElement;
        if (!card) return;
        const r = card.getBoundingClientRect();

        const inside =
          e.clientX >= r.left - proximity &&
          e.clientX <= r.right + proximity &&
          e.clientY >= r.top - proximity &&
          e.clientY <= r.bottom + proximity;

        el.style.setProperty("--active", inside ? "1" : "0");
        if (!inside) return;

        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;

        // take the shortest way round so the sweep never spins the long way
        const delta = ((target - angle.current + 180) % 360) - 180;
        angle.current += delta;
        el.style.setProperty("--start", String(angle.current));
      });
    },
    [proximity]
  );

  useEffect(() => {
    if (disabled) return;
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("pointermove", onMove);
    };
  }, [onMove, disabled]);

  if (disabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity duration-300"
      style={
        {
          "--active": "0",
          "--start": "0",
          "--spread": String(spread),
          "--bw": `${borderWidth}px`,
          "--gradient": `conic-gradient(from calc((var(--start) - var(--spread)) * 1deg),
            transparent 0deg,
            hsl(var(--primary)) 20deg,
            #3b82f6 40deg,
            transparent calc(var(--spread) * 2deg))`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute rounded-[inherit] opacity-[var(--active)] transition-opacity duration-300"
        style={{
          inset: "calc(-1 * var(--bw))",
          border: "var(--bw) solid transparent",
          background: "var(--gradient)",
          WebkitMask:
            "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
}
