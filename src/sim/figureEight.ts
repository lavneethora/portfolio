/**
 * Ported from github.com/lavneethora/three-body (src/catalog/presets.ts).
 */
import { K_GAUSS } from "./constants";
import type { BodySpec } from "./types";

/** Period of the figure-eight in dimensionless units, widely circulated. */
export const FIGURE_EIGHT_T_DIMENSIONLESS = 6.32591398;
export const FIGURE_EIGHT_PERIOD_DAYS = FIGURE_EIGHT_T_DIMENSIONLESS / K_GAUSS;

/**
 * No close encounters on the figure eight, so a fixed step keeps the
 * integrator strictly symplectic and this delicate periodic solution holds
 * its shape indefinitely. Adaptive stepping would slowly smear it out.
 */
export const FIGURE_EIGHT_DT = FIGURE_EIGHT_PERIOD_DAYS / 4000;

/**
 * Chenciner-Montgomery figure eight.
 *
 * Three equal masses chasing each other around a single closed figure-eight
 * path. Published in Annals of Mathematics 152 (2000) 881, found numerically
 * by Moore in 1993. The initial conditions below are Montgomery's with both
 * coordinate signs flipped, which is a symmetry of the solution.
 *
 * Already in the centre-of-mass frame: positions sum to zero and so do
 * velocities.
 */
export function figureEight(): BodySpec[] {
  const x = 0.97000436;
  const y = -0.24308753;
  const v3x = -0.93240737 * K_GAUSS;
  const v3y = -0.86473146 * K_GAUSS;

  return [
    { name: "a", mass: 1, position: [x, y, 0], velocity: [-v3x / 2, -v3y / 2, 0] },
    { name: "b", mass: 1, position: [-x, -y, 0], velocity: [-v3x / 2, -v3y / 2, 0] },
    { name: "c", mass: 1, position: [0, 0, 0], velocity: [v3x, v3y, 0] },
  ];
}
