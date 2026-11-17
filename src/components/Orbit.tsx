"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FIGURE_EIGHT_PERIOD_DAYS } from "@/sim/figureEight";
import { MAX_FLICK_SPEED, OrbitSim } from "@/sim/orbit";

/** Simulated days per real second. One lap of the eight takes about 9 seconds. */
const DAYS_PER_SECOND = 40;

/** How much history each body's ink trail keeps, in simulated days. */
const TRAIL_STABLE = FIGURE_EIGHT_PERIOD_DAYS * 0.3;
const TRAIL_PERTURBED = FIGURE_EIGHT_PERIOD_DAYS * 1.1;

/** The figure eight's extent in AU, with a little air around it. */
const ORBIT_WIDTH_AU = 2.45;
const ORBIT_HEIGHT_AU = 1.1;

/** How many alpha steps a trail fades through. Each one is a canvas stroke. */
const FADE_STEPS = 14;

/** Pixels. How close a pointer has to be to pick a body up. */
const GRAB_MOUSE = 30;
const GRAB_TOUCH = 46;

/** Pixels of drag that give the hardest allowed throw. */
const FULL_THROW_PX = 170;

/** After an ejection the hero would sit empty, so it resets itself. */
const RESET_AFTER_EJECT_MS = 12_000;

/** Same if every body has wandered off the page. */
const RESET_AFTER_EMPTY_MS = 4_000;

const PERIOD_LABEL = `${FIGURE_EIGHT_PERIOD_DAYS.toFixed(1)} days`;

interface Trail {
  x: number[];
  y: number[];
  t: number[];
}

/** One period of the untouched orbit, as the pencil guide under the ink. */
function traceGuide(): Float32Array {
  const sim = new OrbitSim();
  const samples = 240;
  const out = new Float32Array((samples + 1) * 2);
  for (let i = 0; i <= samples; i++) {
    out[i * 2] = sim.state.pos[0];
    out[i * 2 + 1] = sim.state.pos[1];
    sim.advance(FIGURE_EIGHT_PERIOD_DAYS / samples, Infinity);
  }
  return out;
}

function formatDrift(drift: number): string {
  return drift === 0 ? "0" : drift.toExponential(1);
}

/**
 * The hero. A figure-eight three-body orbit drawn as ink on the page, which
 * a visitor can pick up and throw.
 *
 * `children` is the server-rendered name and intro. Everything animated is
 * drawn on the canvas or written straight into DOM nodes through refs, so
 * React never re-renders while the simulation runs.
 */
export function Orbit({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const throwRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !stage || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sim = new OrbitSim();
    const guide = traceGuide();
    const trails: Trail[] = sim.names.map(() => ({ x: [], y: [], t: [] }));

    const view = { w: 0, h: 0, cx: 0, cy: 0, scale: 1 };
    const colors = { ink: "#000", graphite: "#666", red: "#c00" };
    let labelFont = "500 12px monospace";
    let drag: { body: number; x: number; y: number } | null = null;
    let raf = 0;
    let running = false;
    let onScreen = true;
    let last = 0;
    let lastReadout = 0;
    let ejectedAt = 0;
    let emptySince = 0;

    const sx = (x: number) => view.cx + x * view.scale;
    const sy = (y: number) => view.cy - y * view.scale;

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      colors.ink = cs.getPropertyValue("--ink").trim() || colors.ink;
      colors.graphite = cs.getPropertyValue("--graphite").trim() || colors.graphite;
      colors.red = cs.getPropertyValue("--red").trim() || colors.red;
      // Read once here. Asking for computed style inside draw() would force
      // a style recalculation on every frame.
      labelFont = `500 12px ${getComputedStyle(canvas!).fontFamily}`;
    }

    function resize() {
      const rect = section!.getBoundingClientRect();
      const box = stage!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = rect.width;
      view.h = rect.height;
      // The orbit goes in the middle of the stage box, as large as fits.
      view.cx = box.left - rect.left + box.width / 2;
      view.cy = box.top - rect.top + box.height / 2;
      view.scale = Math.min(box.width / ORBIT_WIDTH_AU, box.height / ORBIT_HEIGHT_AU);
      section!.style.setProperty("--orbit-drop", `${(ORBIT_HEIGHT_AU / 3) * view.scale}px`);
      // Hang the graph paper off the orbit's own centre, so a major line runs
      // through the crossing of the eight and the two lobes mirror each other
      // across it. Rounded, so the 1px rules stay crisp.
      section!.style.setProperty("--grid-x", `${Math.round(view.cx)}px`);
      section!.style.setProperty("--grid-y", `${Math.round(view.cy)}px`);
      canvas!.width = Math.round(rect.width * dpr);
      canvas!.height = Math.round(rect.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function clearTrails() {
      for (const tr of trails) {
        tr.x.length = 0;
        tr.y.length = 0;
        tr.t.length = 0;
      }
    }

    function sample() {
      const now = sim.state.time;
      const keep = sim.status.kind === "stable" ? TRAIL_STABLE : TRAIL_PERTURBED;
      trails.forEach((tr, i) => {
        tr.x.push(sim.state.pos[i * 3]);
        tr.y.push(sim.state.pos[i * 3 + 1]);
        tr.t.push(now);
        while (tr.t.length > 2 && now - tr.t[0] > keep) {
          tr.x.shift();
          tr.y.shift();
          tr.t.shift();
        }
      });
    }

    function draw() {
      const c = ctx!;
      c.clearRect(0, 0, view.w, view.h);
      c.lineCap = "round";
      c.lineJoin = "round";

      // Pencil: where the orbit is supposed to be.
      c.strokeStyle = colors.graphite;
      c.globalAlpha = 0.45;
      c.lineWidth = 1;
      c.setLineDash([1, 5]);
      c.beginPath();
      for (let i = 0; i < guide.length; i += 2) {
        if (i === 0) c.moveTo(sx(guide[i]), sy(guide[i + 1]));
        else c.lineTo(sx(guide[i]), sy(guide[i + 1]));
      }
      c.stroke();
      c.setLineDash([]);

      // Ink: where the bodies have actually been. Older ink is fainter.
      c.strokeStyle = colors.ink;
      c.lineWidth = 1.7;
      for (const tr of trails) {
        const n = tr.x.length;
        // A fixed number of strokes per trail, however long it gets.
        const chunk = Math.max(4, Math.ceil(n / FADE_STEPS));
        for (let start = 0; start < n - 1; start += chunk) {
          const end = Math.min(start + chunk, n - 1);
          c.globalAlpha = Math.pow((end + 1) / n, 1.7);
          c.beginPath();
          c.moveTo(sx(tr.x[start]), sy(tr.y[start]));
          for (let k = start + 1; k <= end; k++) c.lineTo(sx(tr.x[k]), sy(tr.y[k]));
          c.stroke();
        }
      }

      // The bodies, lettered like points in a diagram.
      c.globalAlpha = 1;
      c.font = labelFont;
      for (let i = 0; i < sim.state.n; i++) {
        const x = sx(sim.state.pos[i * 3]);
        const y = sy(sim.state.pos[i * 3 + 1]);
        c.fillStyle = colors.ink;
        c.beginPath();
        c.arc(x, y, 5.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = colors.graphite;
        c.fillText(sim.names[i], x + 10, y - 9);
      }

      // Red pen: the throw being lined up.
      if (drag) {
        const x0 = sx(sim.state.pos[drag.body * 3]);
        const y0 = sy(sim.state.pos[drag.body * 3 + 1]);
        const dx = drag.x - x0;
        const dy = drag.y - y0;
        const len = Math.hypot(dx, dy);
        if (len > 6) {
          const ux = dx / len;
          const uy = dy / len;
          c.strokeStyle = colors.red;
          c.lineWidth = 1.7;
          c.beginPath();
          c.moveTo(x0, y0);
          c.lineTo(drag.x, drag.y);
          c.moveTo(drag.x, drag.y);
          c.lineTo(drag.x - ux * 11 - uy * 5, drag.y - uy * 11 + ux * 5);
          c.moveTo(drag.x, drag.y);
          c.lineTo(drag.x - ux * 11 + uy * 5, drag.y - uy * 11 - ux * 5);
          c.stroke();
        }
      }
    }

    function writeReadout() {
      if (driftRef.current) driftRef.current.textContent = formatDrift(sim.drift());
      const s = sim.status;
      const text =
        s.kind === "stable"
          ? "stable"
          : s.kind === "perturbed"
            ? "perturbed"
            : `star ${sim.names[s.body]} ejected`;
      if (statusRef.current && statusRef.current.textContent !== text) {
        statusRef.current.textContent = text;
      }
      if (resetRef.current) resetRef.current.hidden = s.kind === "stable";
    }

    function anyBodyOnPage(): boolean {
      for (let i = 0; i < sim.state.n; i++) {
        const x = sx(sim.state.pos[i * 3]);
        const y = sy(sim.state.pos[i * 3 + 1]);
        if (x > 0 && x < view.w && y > 0 && y < view.h) return true;
      }
      return false;
    }

    function reset() {
      sim.reset();
      clearTrails();
      ejectedAt = 0;
      emptySince = 0;
      writeReadout();
      draw();
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Time stands still while a star is held, so it can be aimed.
      if (!drag) {
        sim.advance(dt * DAYS_PER_SECOND);
        sample();
      }
      draw();

      if (now - lastReadout > 200) {
        lastReadout = now;
        writeReadout();
      }

      if (sim.status.kind === "ejected") {
        if (!ejectedAt) ejectedAt = now;
        else if (now - ejectedAt > RESET_AFTER_EJECT_MS) reset();
      }
      if (sim.status.kind !== "stable" && !anyBodyOnPage()) {
        if (!emptySince) emptySince = now;
        else if (now - emptySince > RESET_AFTER_EMPTY_MS) reset();
      } else {
        emptySince = 0;
      }
    }

    function start() {
      if (running || !onScreen || document.hidden || reducedMotion.matches) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /** With motion off: one still frame of the orbit, partway round. */
    function drawStill() {
      sim.reset();
      clearTrails();
      const steps = 120;
      for (let i = 0; i < steps; i++) {
        sim.advance(TRAIL_STABLE / steps, Infinity);
        sample();
      }
      draw();
      writeReadout();
    }

    function local(e: { clientX: number; clientY: number }) {
      const rect = section!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function bodyNear(x: number, y: number, radius: number): number {
      let best = -1;
      let bestD = radius;
      for (let i = 0; i < sim.state.n; i++) {
        const d = Math.hypot(sx(sim.state.pos[i * 3]) - x, sy(sim.state.pos[i * 3 + 1]) - y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    }

    function markTouched() {
      section!.setAttribute("data-touched", "");
    }

    function onPointerDown(e: PointerEvent) {
      if (reducedMotion.matches || !e.isPrimary) return;
      const p = local(e);
      const body = bodyNear(p.x, p.y, e.pointerType === "mouse" ? GRAB_MOUSE : GRAB_TOUCH);
      if (body < 0) return;
      e.preventDefault();
      try {
        section!.setPointerCapture(e.pointerId);
      } catch {
        // Capture is a nicety. Without it the drag still works inside the hero.
      }
      drag = { body, x: p.x, y: p.y };
      section!.style.cursor = "grabbing";
    }

    function onPointerMove(e: PointerEvent) {
      const p = local(e);
      if (drag) {
        drag.x = p.x;
        drag.y = p.y;
      } else if (e.pointerType === "mouse" && !reducedMotion.matches) {
        section!.style.cursor = bodyNear(p.x, p.y, GRAB_MOUSE) >= 0 ? "grab" : "";
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!drag) return;
      const x0 = sx(sim.state.pos[drag.body * 3]);
      const y0 = sy(sim.state.pos[drag.body * 3 + 1]);
      const dx = drag.x - x0;
      const dy = drag.y - y0;
      if (Math.hypot(dx, dy) > 6) {
        // Screen y points down, simulation y points up.
        sim.flick(
          drag.body,
          (dx / FULL_THROW_PX) * MAX_FLICK_SPEED,
          (-dy / FULL_THROW_PX) * MAX_FLICK_SPEED,
        );
        ejectedAt = 0;
        markTouched();
      }
      drag = null;
      section!.style.cursor = "";
      if (section!.hasPointerCapture(e.pointerId)) section!.releasePointerCapture(e.pointerId);
      writeReadout();
    }

    /** The browser took the gesture back. Let go without throwing. */
    function onPointerCancel() {
      drag = null;
      section!.style.cursor = "";
    }

    /** A finger that lands on a star is throwing, not scrolling. */
    function onTouchStart(e: TouchEvent) {
      if (reducedMotion.matches || e.touches.length !== 1) return;
      const p = local(e.touches[0]);
      if (bodyNear(p.x, p.y, GRAB_TOUCH) >= 0) e.preventDefault();
    }

    /** The keyboard and screen-reader route to the same toy. */
    function throwOne() {
      const body = Math.floor(Math.random() * sim.state.n);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.45 + Math.random() * 0.45) * MAX_FLICK_SPEED;
      sim.flick(body, Math.cos(angle) * speed, Math.sin(angle) * speed);
      ejectedAt = 0;
      markTouched();
      writeReadout();
    }

    function onMotionChange() {
      stop();
      if (reducedMotion.matches) drawStill();
      else {
        reset();
        start();
      }
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    const throwBtn = throwRef.current;
    const resetBtn = resetRef.current;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);
    resizeObserver.observe(stage);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(section);

    const themeObserver = new MutationObserver(() => {
      readColors();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      draw();
    };

    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerup", onPointerUp);
    section.addEventListener("pointercancel", onPointerCancel);
    section.addEventListener("touchstart", onTouchStart, { passive: false });
    throwBtn?.addEventListener("click", throwOne);
    resetBtn?.addEventListener("click", reset);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    scheme.addEventListener("change", onScheme);

    readColors();
    resize();
    if (reducedMotion.matches) drawStill();
    else start();
    // The mono face may land after the first frame. Redraw the labels once it has.
    document.fonts?.ready.then(() => {
      readColors();
      draw();
    });

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerup", onPointerUp);
      section.removeEventListener("pointercancel", onPointerCancel);
      section.removeEventListener("touchstart", onTouchStart);
      throwBtn?.removeEventListener("click", throwOne);
      resetBtn?.removeEventListener("click", reset);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
      scheme.removeEventListener("change", onScheme);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" aria-label="Introduction">
      <canvas ref={canvasRef} className="readout" aria-hidden="true" />

      <div ref={stageRef} className="orbit-stage">
        <p className="orbit-hint" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 44C30 42 14 34 9 8" />
            <path d="M3 17l6-10 9 7" />
          </svg>
          <span>
            grab a star
            <br />
            and throw it
          </span>
        </p>
      </div>

      <div className="hero-inner">
        <div>{children}</div>

        <div className="orbit-panel readout">
          <dl>
            <dt>orbit</dt>
            <dd>figure eight, 3 equal masses</dd>
            <dt>period</dt>
            <dd>{PERIOD_LABEL}</dd>
            <dt>energy drift</dt>
            <dd ref={driftRef} className="measured">
              0
            </dd>
            <dt>status</dt>
            <dd>
              <span ref={statusRef} role="status">
                stable
              </span>
            </dd>
          </dl>
          <div className="orbit-controls">
            <button ref={throwRef} type="button">
              Throw a star
            </button>
            <button ref={resetRef} type="button" hidden>
              Put it back
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
