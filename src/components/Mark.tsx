import type { ReactNode } from "react";

/**
 * A red-pen mark around a number that was measured, not estimated.
 *
 * The paths are drawn by hand in a 100 x 40 box and stretched over the
 * text. `vector-effect: non-scaling-stroke` (in globals.css) keeps the pen
 * the same thickness however far the box is stretched.
 */
const PATHS = {
  circle:
    "M9 24C4 12 28 3 56 3c26 0 41 7 40 18-1 12-22 17-48 17C24 38 5 34 4 23c-1-9 12-16 30-18",
  underline: "M2 37c16-3 34-4 50-3 15 1 31 0 46-3",
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
        <path d={PATHS[kind]} />
      </svg>
    </span>
  );
}
