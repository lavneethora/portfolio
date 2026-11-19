"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A red-pen mark around a number that was measured, not estimated.
 *
 * The paths are drawn by hand in a 100 x 40 box and stretched over the
 * text. `vector-effect: non-scaling-stroke` (in globals.css) keeps the pen
 * the same thickness however far the box is stretched.
 *
 * The circle goes round once and then a little further, the way someone
 * circling a number on paper does not stop exactly where they started.
 *
 * The underline sags slightly in the middle but stays flat end to end. An
 * earlier one rose six units to the right, which lifted its tail into the
 * descenders of the last few letters and read as a line stopping short.
 */
const PATHS = {
  circle:
    "M93 9C85 3 62 0 41 3 17 6 2 13 4 22c2 9 24 17 50 17 25 0 43-7 42-16C95 14 77 7 56 6",
  underline: "M2 36.8c16 .8 34 1.2 50 .6 15-.6 31-.2 46-1",
} as const;

export function Mark({
  kind = "circle",
  children,
}: {
  kind?: keyof typeof PATHS;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  /*
   * The pen draws itself the first time the mark scrolls into view, and then
   * stays drawn.
   *
   * The stroke is hidden and revealed with stroke-dashoffset, and the dash
   * has to be exactly as long as the stroke or the line stops short of its
   * own end. `pathLength="100"` is the usual way to get that for free, but
   * it does not survive `vector-effect: non-scaling-stroke`: the stroke, and
   * with it the dash pattern, is measured in screen pixels after the box has
   * been stretched over the text, while pathLength normalises the path's own
   * units. A dash of 100 then covers 100px of a stroke rendering 146px long,
   * which left the underline ending about two thirds of the way through the
   * words. So the length is measured here, in screen pixels, and handed to
   * CSS. It is measured again whenever the mark changes size, since the box
   * is stretched to whatever the text happens to be.
   *
   * This also used to be a CSS `view()` timeline, which tied how much was
   * drawn to the exact scroll position and ran backwards on the way up.
   * The mark is drawn in the HTML, because --draw defaults to 0, so it is
   * there with no JavaScript and under reduced motion. It is only wiped to
   * animate it, and only while it is still off screen.
   */
  useEffect(() => {
    const el = ref.current;
    const path = el?.querySelector("path");
    if (!el || !path) return;

    /** The stroke's length on screen, which is what the dash is measured in. */
    function measure() {
      const ctm = path!.getScreenCTM();
      if (!ctm) return;
      const total = path!.getTotalLength();
      const steps = 160;
      let len = 0;
      let px = 0;
      let py = 0;
      for (let i = 0; i <= steps; i++) {
        const p = path!.getPointAtLength((total * i) / steps);
        const x = p.x * ctm.a + p.y * ctm.c + ctm.e;
        const y = p.x * ctm.b + p.y * ctm.d + ctm.f;
        if (i > 0) len += Math.hypot(x - px, y - py);
        px = x;
        py = y;
      }
      // Rounded up, so the dash is never a fraction of a pixel short.
      el!.style.setProperty("--pen-len", `${Math.ceil(len)}px`);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => ro.disconnect();
    }

    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      return () => ro.disconnect();
    }

    el.classList.add("pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        // Drawing it is the point; the animation is a bonus. If a fast scroll
        // carried the mark past the top of the window before it ever counted
        // as on screen, put the pen down anyway rather than leave a number
        // with nothing around it.
        const missed = entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !missed) return;
        el.classList.remove("pending");
        el.classList.add("drawn");
        io.disconnect();
      },
      // A little past the bottom edge, so the pen starts once the line it
      // belongs to is properly in the page rather than clipped by the fold.
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <span className="mark" ref={ref}>
      {children}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d={PATHS[kind]} />
      </svg>
    </span>
  );
}
