/**
 * Ported from github.com/lavneethora/three-body (src/physics/constants.ts).
 *
 * Unit system: length in AU, mass in solar masses, time in days.
 *
 * Chosen so that the gravitational constant is the square of the Gaussian
 * gravitational constant, an IAU-defined value. It also makes the published
 * dimensionless three-body solutions (G = 1, m = 1) convertible by scaling
 * velocities by K_GAUSS and dividing times by it.
 */

/** Gaussian gravitational constant, AU^1.5 / (day * sqrt(Msun)). */
export const K_GAUSS = 0.01720209895;

/** G in AU^3 / (Msun * day^2). Equals 2.9591220828559115e-4. */
export const G = K_GAUSS * K_GAUSS;
