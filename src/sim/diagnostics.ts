/**
 * Ported from github.com/lavneethora/three-body (src/physics/diagnostics.ts
 * and src/physics/outcomes.ts), trimmed to what the hero orbit needs.
 */
import { G } from "./constants";
import type { SimState } from "./types";

/**
 * Total energy, using the SOFTENED potential.
 *
 * This matters: the quantity actually conserved by softened forces is the
 * softened Hamiltonian. Measuring drift against the bare 1/r potential
 * would report a spurious error that grows during close passes.
 */
export function totalEnergy(s: SimState, softening: number): number {
  const { n, mass, pos, vel, alive } = s;
  const eps2 = softening * softening;
  let ke = 0;
  let pe = 0;

  for (let i = 0; i < n; i++) {
    if (!alive[i]) continue;
    const i3 = i * 3;
    const vx = vel[i3];
    const vy = vel[i3 + 1];
    const vz = vel[i3 + 2];
    ke += 0.5 * mass[i] * (vx * vx + vy * vy + vz * vz);

    for (let j = i + 1; j < n; j++) {
      if (!alive[j]) continue;
      const j3 = j * 3;
      const dx = pos[i3] - pos[j3];
      const dy = pos[i3 + 1] - pos[j3 + 1];
      const dz = pos[i3 + 2] - pos[j3 + 2];
      pe -= (G * mass[i] * mass[j]) / Math.sqrt(dx * dx + dy * dy + dz * dz + eps2);
    }
  }

  return ke + pe;
}

export interface EscapeInfo {
  index: number;
  /** Distance from the centre of mass of every OTHER live body, AU. */
  distance: number;
  /** Specific energy against that remainder. Positive means unbound. */
  specificEnergy: number;
  /** Positive means moving away. */
  radialVelocity: number;
  unbound: boolean;
}

/**
 * Test one body against the combined remainder of the system.
 *
 * Measuring against the rest as a single lump, rather than body by body, is
 * what makes this correct when the remainder is a tight binary: a binary's
 * own orbital motion is fast, and comparing a member of it to the others
 * individually wrongly reports it as unbound.
 */
export function escapeInfo(s: SimState, i: number): EscapeInfo {
  let mRest = 0;
  const c = [0, 0, 0];
  const vc = [0, 0, 0];

  for (let j = 0; j < s.n; j++) {
    if (j === i || !s.alive[j]) continue;
    mRest += s.mass[j];
    for (let k = 0; k < 3; k++) {
      c[k] += s.mass[j] * s.pos[j * 3 + k];
      vc[k] += s.mass[j] * s.vel[j * 3 + k];
    }
  }

  if (mRest === 0) {
    return { index: i, distance: 0, specificEnergy: 0, radialVelocity: 0, unbound: false };
  }
  for (let k = 0; k < 3; k++) {
    c[k] /= mRest;
    vc[k] /= mRest;
  }

  const i3 = i * 3;
  const dx = s.pos[i3] - c[0];
  const dy = s.pos[i3 + 1] - c[1];
  const dz = s.pos[i3 + 2] - c[2];
  const dvx = s.vel[i3] - vc[0];
  const dvy = s.vel[i3 + 1] - vc[1];
  const dvz = s.vel[i3 + 2] - vc[2];

  const r = Math.hypot(dx, dy, dz);
  const v2 = dvx * dvx + dvy * dvy + dvz * dvz;
  const energy = v2 / 2 - (G * mRest) / r;
  const radial = (dx * dvx + dy * dvy + dz * dvz) / r;

  return {
    index: i,
    distance: r,
    specificEnergy: energy,
    radialVelocity: radial,
    unbound: energy > 0,
  };
}
