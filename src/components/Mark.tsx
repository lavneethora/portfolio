import type { ReactNode } from "react";

/**
 * A red-pen mark around a number that was measured, not estimated.
 *
 * The paths are drawn by hand in a 100 x 40 box and stretched over the
 * text. `vector-effect: non-scaling-stroke` (in globals.css) keeps the pen
 * the same thickness however far the box is stretched.
 *
 * The circle goes round once and then a little further, the way someone
 * circling a number on paper does not stop exactly where they started.
 * `pathLength="100"` normalises both paths so one dash rule traces either.
 */
const PATHS = {
  circle:
    "M93 9C85 3 62 0 41 3 17 6 2 13 4 22c2 9 24 17 50 17 25 0 43-7 42-16C95 14 77 7 56 6",
  underline: "M2 36c16-3 34-4 50-3 15 1 31 0 46-3",
} as const;

export function Mark({
  kind = "circle",
  children,
}: {
  kind?: keyof typeof PATHS;
  children: ReactNode;
}) {
  return (
    <span className="mark">
      {children}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d={PATHS[kind]} pathLength={100} />
      </svg>
    </span>
  );
}
