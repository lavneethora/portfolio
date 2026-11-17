"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A picture taped into the notebook.
 *
 * The first time it scrolls into view the picture drops onto the page and
 * the tape gets pressed down over it. Everything about how that looks is in
 * globals.css under `.shot`. This component only decides when.
 *
 * The picture is in the HTML and visible by default. It is only hidden to
 * wait for its entrance if it is still below the fold when the page loads,
 * so nothing disappears without scripts, on a jump straight to a later
 * section, or with reduced motion on.
 */
export function Taped({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen, or already scrolled past: leave it taped up.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.tape = "waiting";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.tape = "on";
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="shot">
      <span className="tape" aria-hidden="true" />
      {children}
    </figure>
  );
}
