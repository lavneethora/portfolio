"use client";

/**
 * Lights on, lights off.
 *
 * Both labels are in the markup and CSS shows the right one, so the server
 * and the browser always agree and nothing flashes on load. The choice is
 * kept in localStorage and applied by the inline script in layout.tsx.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode. The page still switches, it just will not remember.
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="when-light">Lights off</span>
      <span className="when-dark">Lights on</span>
    </button>
  );
}
