"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A conic-gradient border that lights up and rotates to point at the cursor.
 * Masked to the element's border box so only the 1px rim is painted.
 */
export function GlowingEffect({
  spread = 80,
  proximity = 64,
  borderWidth = 3,
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
        const target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;

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
          // four-colour sweep: pink, gold, green, blue
          "--gradient": `
            radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
            radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
            radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%),
            radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
            repeating-conic-gradient(
              from 236.84deg at 50% 50%,
              #dd7bbb 0%,
              #d79f1e calc(25% / 5),
              #5a922c calc(50% / 5),
              #4c7894 calc(75% / 5),
              #dd7bbb calc(100% / 5)
            )`,
        } as React.CSSProperties
      }
    >
      {/* Two mask layers intersected: the first (clipped to padding-box) knocks
          out the card interior, the second is a conic wedge aimed at the cursor.
          What survives is a slice of the rim. */}
      <div
        className="absolute rounded-[inherit] opacity-[var(--active)] transition-opacity duration-300"
        style={
          {
            inset: "calc(-1 * var(--bw))",
            border: "var(--bw) solid transparent",
            background: "var(--gradient)",
            backgroundAttachment: "fixed",
            maskClip: "padding-box, border-box",
            maskComposite: "intersect",
            maskImage: `linear-gradient(#0000, #0000),
              conic-gradient(from calc((var(--start) - var(--spread)) * 1deg),
                #00000000 0deg, #fff, #00000000 calc(var(--spread) * 2deg))`,
            WebkitMaskClip: "padding-box, border-box",
            WebkitMaskComposite: "source-in",
            WebkitMaskImage: `linear-gradient(#0000, #0000),
              conic-gradient(from calc((var(--start) - var(--spread)) * 1deg),
                #00000000 0deg, #fff, #00000000 calc(var(--spread) * 2deg))`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
