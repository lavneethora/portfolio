/**
 * Ported from github.com/lavneethora/three-body (src/physics/types.ts),
 * trimmed to what the hero orbit needs.
 */

/** A body as authored, before it enters the simulation. */
export interface BodySpec {
  name: string;
  /** Solar masses. */
  mass: number;
  /** AU. */
  position: [number, number, number];
  /** AU/day. */
  velocity: [number, number, number];
}

/**
 * Mutable simulation state, laid out as flat typed arrays.
 *
 * This is deliberately not a list of objects: it is read every frame by the
 * renderer and stepped thousands of times per second, so it lives in
 * Float64Arrays that are mutated in place and never enter React state.
 *
 * Positions and velocities are packed xyz, so body i occupies [3i, 3i+2].
 */
export interface SimState {
  n: number;
  /** Solar masses, length n. */
  mass: Float64Array;
  /** AU, length 3n. */
  pos: Float64Array;
  /** AU/day, length 3n. */
  vel: Float64Array;
  /** 1 if the body still exists. Kept so the ported force code runs unchanged. */
  alive: Uint8Array;
  /** Simulation time in days since load. */
  time: number;
  /** Steps taken since load. */
  steps: number;
}

export type IntegratorName = "verlet" | "yoshida4";

/** Allocate state for n bodies. */
export function allocState(n: number): SimState {
  return {
    n,
    mass: new Float64Array(n),
    pos: new Float64Array(n * 3),
    vel: new Float64Array(n * 3),
    alive: new Uint8Array(n).fill(1),
    time: 0,
    steps: 0,
  };
}

/** Build simulation state from authored specs. */
export function stateFromSpecs(specs: BodySpec[]): SimState {
  const s = allocState(specs.length);
  specs.forEach((b, i) => {
    s.mass[i] = b.mass;
    for (let k = 0; k < 3; k++) {
      s.pos[i * 3 + k] = b.position[k];
      s.vel[i * 3 + k] = b.velocity[k];
    }
  });
  return s;
}
