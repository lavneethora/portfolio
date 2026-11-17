import { K_GAUSS } from "./constants";
import { escapeInfo, totalEnergy } from "./diagnostics";
import { FIGURE_EIGHT_DT, figureEight } from "./figureEight";
import { adaptiveDt, computeAccel } from "./forces";
import { integrate } from "./integrators";
import { stateFromSpecs, type SimState } from "./types";

export type OrbitStatus =
  | { kind: "stable" }
  | { kind: "perturbed" }
  | { kind: "ejected"; body: number };

/**
 * Softening used once a visitor has thrown a body. The untouched figure
 * eight has no close encounters and runs with none, but a perturbed system
 * does, and a point-mass close pass would fling a body off at absurd speed.
 */
const PERTURBED_SOFTENING = 2e-3;
const ETA = 0.01;
const DT_MIN = 1e-5;

/**
 * AU. A body is called ejected once it is unbound and this far out, which is
 * about where it leaves the edge of the hero on a laptop screen.
 */
const ESCAPE_DISTANCE = 3;

/** Largest kick a flick can give, as a multiple of the orbit's own speed scale. */
export const MAX_FLICK_SPEED = 3 * K_GAUSS;

/**
 * The hero orbit: a figure eight that runs untouched on a fixed symplectic
 * step, and switches to an adaptive step the moment someone throws a body.
 *
 * No rendering and no DOM in here, so the whole thing is unit tested.
 */
export class OrbitSim {
  state!: SimState;
  status: OrbitStatus = { kind: "stable" };
  readonly names = figureEight().map((b) => b.name);

  private accel = new Float64Array(9);
  private softening = 0;
  private fixedStep = true;
  private e0 = 0;
  private owed = 0;

  constructor() {
    this.reset();
  }

  /** Back to the untouched figure eight. */
  reset(): void {
    this.state = stateFromSpecs(figureEight());
    this.softening = 0;
    this.fixedStep = true;
    this.owed = 0;
    this.e0 = totalEnergy(this.state, this.softening);
    this.status = { kind: "stable" };
  }

  /**
   * Advance by up to `days` of simulated time.
   *
   * Work is capped at `maxSteps`. If a close encounter needs more than that,
   * the leftover time is dropped and the simulation runs slow for a moment
   * instead of freezing the page.
   */
  advance(days: number, maxSteps = 3000): void {
    this.owed += days;
    let steps = 0;

    if (this.fixedStep) {
      // Whole steps only. A shortened final step would quietly break the
      // fixed-step property that keeps this orbit closed.
      while (this.owed >= FIGURE_EIGHT_DT * (1 - 1e-9) && steps < maxSteps) {
        integrate(this.state, FIGURE_EIGHT_DT, 0, this.accel, "yoshida4");
        this.owed -= FIGURE_EIGHT_DT;
        steps++;
      }
    } else {
      while (this.owed > 1e-9 && steps < maxSteps) {
        computeAccel(this.state, this.softening, this.accel);
        const dt = Math.min(
          adaptiveDt(this.state, this.accel, ETA, DT_MIN, FIGURE_EIGHT_DT),
          this.owed,
        );
        integrate(this.state, dt, this.softening, this.accel, "yoshida4");
        this.owed -= dt;
        steps++;
      }
      this.updateStatus();
    }

    if (steps >= maxSteps) this.owed = 0;
  }

  /**
   * Add a velocity kick to one body, in AU/day.
   *
   * A kick gives the whole system net momentum, which on screen would carry
   * all three bodies off the page together. So the kick is followed by a
   * shift back into the centre-of-mass frame: the thrown body goes one way
   * and the other two recoil the other way, as seen from the system itself.
   *
   * The energy reference is re-measured afterwards, so the drift readout
   * reports integration error since the throw and not the throw itself.
   */
  flick(body: number, dvx: number, dvy: number): void {
    const speed = Math.hypot(dvx, dvy);
    const scale = speed > MAX_FLICK_SPEED ? MAX_FLICK_SPEED / speed : 1;
    const { n, mass, vel } = this.state;
    vel[body * 3] += dvx * scale;
    vel[body * 3 + 1] += dvy * scale;

    let m = 0;
    let px = 0;
    let py = 0;
    for (let i = 0; i < n; i++) {
      m += mass[i];
      px += mass[i] * vel[i * 3];
      py += mass[i] * vel[i * 3 + 1];
    }
    for (let i = 0; i < n; i++) {
      vel[i * 3] -= px / m;
      vel[i * 3 + 1] -= py / m;
    }

    this.fixedStep = false;
    this.softening = PERTURBED_SOFTENING;
    this.owed = 0;
    this.e0 = totalEnergy(this.state, this.softening);
    this.status = { kind: "perturbed" };
  }

  /** Relative energy error since the last reset or flick. Zero is perfect. */
  drift(): number {
    return Math.abs((totalEnergy(this.state, this.softening) - this.e0) / this.e0);
  }

  private updateStatus(): void {
    if (this.status.kind !== "perturbed") return;
    for (let i = 0; i < this.state.n; i++) {
      const info = escapeInfo(this.state, i);
      if (info.unbound && info.radialVelocity > 0 && info.distance > ESCAPE_DISTANCE) {
        this.status = { kind: "ejected", body: i };
        return;
      }
    }
  }
}
