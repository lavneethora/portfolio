import { describe, expect, it } from "vitest";
import { K_GAUSS } from "../constants";
import { totalEnergy } from "../diagnostics";
import { FIGURE_EIGHT_PERIOD_DAYS, figureEight } from "../figureEight";
import { YOSHIDA_W0, YOSHIDA_W1 } from "../integrators";
import { MAX_FLICK_SPEED, OrbitSim } from "../orbit";
import { stateFromSpecs } from "../types";

describe("integrator coefficients", () => {
  it("Yoshida weights sum to one", () => {
    expect(Math.abs(2 * YOSHIDA_W1 + YOSHIDA_W0 - 1)).toBeLessThan(1e-15);
  });
});

describe("figure-eight initial conditions", () => {
  it("start in the centre-of-mass frame", () => {
    const s = stateFromSpecs(figureEight());
    for (let k = 0; k < 3; k++) {
      let x = 0;
      let p = 0;
      for (let i = 0; i < s.n; i++) {
        x += s.mass[i] * s.pos[i * 3 + k];
        p += s.mass[i] * s.vel[i * 3 + k];
      }
      expect(Math.abs(x)).toBeLessThan(1e-12);
      expect(Math.abs(p)).toBeLessThan(1e-12);
    }
  });
});

describe("untouched orbit", () => {
  it("returns to its starting configuration after one period", () => {
    const sim = new OrbitSim();
    const start = new Float64Array(sim.state.pos);
    sim.advance(FIGURE_EIGHT_PERIOD_DAYS, Infinity);

    expect(sim.state.steps).toBe(4000);
    let worst = 0;
    for (let i = 0; i < start.length; i++) {
      worst = Math.max(worst, Math.abs(sim.state.pos[i] - start[i]));
    }
    // Orbit spans about 2 AU, so this is closure to better than 1 part in 10^5.
    expect(worst).toBeLessThan(2e-5);
  });

  it("holds energy over ten periods", () => {
    const sim = new OrbitSim();
    sim.advance(10 * FIGURE_EIGHT_PERIOD_DAYS, Infinity);
    expect(sim.drift()).toBeLessThan(1e-9);
    expect(sim.status.kind).toBe("stable");
  });

  it("reports the drift that totalEnergy actually measures", () => {
    const sim = new OrbitSim();
    const e0 = totalEnergy(sim.state, 0);
    sim.advance(3 * FIGURE_EIGHT_PERIOD_DAYS, Infinity);
    const e1 = totalEnergy(sim.state, 0);
    expect(sim.drift()).toBe(Math.abs((e1 - e0) / e0));
  });
});

describe("flicking a body", () => {
  it("marks the system perturbed and re-zeroes the drift reference", () => {
    const sim = new OrbitSim();
    sim.advance(50, Infinity);
    sim.flick(0, 0.2 * K_GAUSS, 0.1 * K_GAUSS);
    expect(sim.status.kind).toBe("perturbed");
    expect(sim.drift()).toBe(0);
  });

  it("clamps the kick to the maximum flick speed", () => {
    const sim = new OrbitSim();
    // Measured against another body, so the recentring does not matter.
    const before = sim.state.vel[0] - sim.state.vel[3];
    sim.flick(0, 100, 0);
    expect(sim.state.vel[0] - sim.state.vel[3] - before).toBeCloseTo(MAX_FLICK_SPEED, 12);
  });

  it("leaves the system with no net momentum, so it stays on the page", () => {
    const sim = new OrbitSim();
    sim.advance(80, Infinity);
    sim.flick(2, 0.7 * MAX_FLICK_SPEED, -0.4 * MAX_FLICK_SPEED);
    for (let k = 0; k < 2; k++) {
      let p = 0;
      for (let i = 0; i < sim.state.n; i++) p += sim.state.mass[i] * sim.state.vel[i * 3 + k];
      expect(Math.abs(p)).toBeLessThan(1e-15);
    }
  });

  it("keeps energy error small through the chaos that follows", () => {
    const sim = new OrbitSim();
    sim.flick(1, 0.3 * K_GAUSS, -0.2 * K_GAUSS);
    for (let i = 0; i < 400; i++) sim.advance(1, Infinity);
    expect(sim.drift()).toBeLessThan(1e-4);
  });

  it("names the body that a hard throw ejects", () => {
    const sim = new OrbitSim();
    // Body a sits at the right-hand end of the eight. Throw it further right.
    sim.flick(0, MAX_FLICK_SPEED, 0);
    for (let i = 0; i < 3000 && sim.status.kind !== "ejected"; i++) {
      sim.advance(1, Infinity);
    }
    expect(sim.status).toEqual({ kind: "ejected", body: 0 });
  });

  it("reset puts the figure eight back", () => {
    const sim = new OrbitSim();
    const start = new Float64Array(sim.state.pos);
    sim.flick(2, MAX_FLICK_SPEED, 0);
    sim.advance(100, Infinity);
    sim.reset();
    expect(sim.status.kind).toBe("stable");
    expect(Array.from(sim.state.pos)).toEqual(Array.from(start));
  });
});
