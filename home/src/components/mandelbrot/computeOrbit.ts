/**
 * Double-Double (DD) arithmetic and reference orbit computation.
 *
 * A DD number is [hi, lo] where both are float64, hi + lo = true value.
 * Effective precision: ~30 decimal digits.
 *
 * This module also exports utility conversions (DD→QS, DD→DS) and DD
 * arithmetic so that MandelbrotControls can use the same functions.
 */

export type DD = [number, number];

// ── Error-free float64 transforms ──────────────────────────────────────

export function twoSum(a: number, b: number): DD {
  const s = a + b;
  const v = s - a;
  return [s, a - (s - v) + (b - v)];
}

export function split(a: number): DD {
  const t = 134217729 * a; // 2^27 + 1
  const hi = t - (t - a);
  return [hi, a - hi];
}

export function twoProduct(a: number, b: number): DD {
  const p = a * b;
  const [aHi, aLo] = split(a);
  const [bHi, bLo] = split(b);
  return [p, aHi * bHi - p + aHi * bLo + aLo * bHi + aLo * bLo];
}

// ── DD arithmetic ──────────────────────────────────────────────────────

export function ddAdd(a: DD, b: DD): DD {
  const [s, e] = twoSum(a[0], b[0]);
  return twoSum(s, e + a[1] + b[1]);
}

export function ddSub(a: DD, b: DD): DD {
  return ddAdd(a, [-b[0], -b[1]]);
}

export function ddMul(a: DD, b: DD): DD {
  const [p, e] = twoProduct(a[0], b[0]);
  return twoSum(p, e + a[0] * b[1] + a[1] * b[0]);
}

export function ddMulFloat(a: DD, b: number): DD {
  const [p, e] = twoProduct(a[0], b);
  return twoSum(p, e + a[1] * b);
}

/**
 * Bailey-style DD division. Good to ~30 decimal digits, which is enough
 * for Newton corrections at the zoom levels this code targets.
 */
export function ddDiv(a: DD, b: DD): DD {
  const q1 = a[0] / b[0];
  const p = ddMulFloat(b, q1);
  const r = ddSub(a, p);
  const q2 = (r[0] + r[1]) / b[0];
  return twoSum(q1, q2);
}

export function ddFrom(x: number): DD {
  return [x, 0];
}

// ── Conversions ────────────────────────────────────────────────────────

/** Convert float64 to float32 DS pair */
export function toDS(x: number): [number, number] {
  const hi = Math.fround(x);
  const lo = Math.fround(x - hi);
  return [hi, lo];
}

/** Convert DD to QS (4 float32 values) for GPU upload */
export function ddToQS(a: DD): [number, number, number, number] {
  const f0 = Math.fround(a[0]);
  const r0 = a[0] - f0;
  const f1 = Math.fround(r0 + a[1]);
  const r1 = r0 + a[1] - f1;
  const f2 = Math.fround(r1);
  const r2 = r1 - f2;
  const f3 = Math.fround(r2);
  return [f0, f1, f2, f3];
}

// ── Reference orbit computation ────────────────────────────────────────

// Canonical orbit-capacity constant. All texture geometry below derives
// from this; callers who want more iteration headroom only need to bump
// MAX_ITER (and keep it a multiple of ORBIT_TEX_W so texture rows align
// exactly). MandelbrotControls re-exports this for backward compatibility.
export const MAX_ITER = 131072;

// Orbit texture is a 2D RGBA32F array of MAX_ITER entries, 4096 per row.
export const ORBIT_TEX_W = 4096;
export const ORBIT_TEX_H = Math.ceil(MAX_ITER / ORBIT_TEX_W);

// ── BLA (Bivariate Linear Approximation) layout ────────────────────────
//
// A BLA entry at (level l, index e) summarises 2^l perturbation steps
// starting from orbit iteration e * 2^l as a pair of complex coefficients:
//
//   ε_{n + step} ≈ A · ε_n + B · δc        (linearisation)
//
// with a validity radius r (so the approximation only fires while
// |ε_n|² < r²). Entries are densely packed per level into a 2D
// RGBA32F texture. Row layout is level-major: level l sits at rows
// [offsets[l], offsets[l+1]), indexed from (row, col) = (offsets[l] +
// floor(e / BLA_TEX_W), e mod BLA_TEX_W).

export const BLA_TEX_W = 4096;
export const BLA_MAX_LEVELS = 8;

// Derive row offsets and total texture height from MAX_ITER. Level l has
// up to floor(MAX_ITER / 2^l) entries, packed 4096 per row, ceiling rounded.
function computeBLAGeometry(maxIter: number): { offsets: readonly number[]; height: number } {
  const offsets: number[] = [];
  let cursor = 0;
  for (let level = 0; level < BLA_MAX_LEVELS; level++) {
    offsets.push(cursor);
    const entries = Math.floor(maxIter / (1 << level));
    const rows = Math.max(1, Math.ceil(entries / BLA_TEX_W));
    cursor += rows;
  }
  return { offsets, height: cursor };
}

const _blaGeom = computeBLAGeometry(MAX_ITER);
export const BLA_ROW_OFFSETS: readonly number[] = _blaGeom.offsets;
export const BLA_TEX_H = _blaGeom.height;
// Same tolerance as the shader's glitch criterion. The linearisation
// breaks down under the same condition perturbation does: γ ≈ 10⁻³.
const BLA_GAMMA_SQ = 1e-6;
// Clamp |A|² to something representable. Entries above this magnitude
// would blow up float32 anyway; we mark them invalid via rSq = 0.
const BLA_A_MAX_SQ = 1e30;

export interface BLABuffers {
  /** High float32 limb of (A.re, A.im, B.re, B.im) per entry. */
  ab: Float32Array;
  /** Low float32 limb — together with ab forms a DS (2× float32) pair,
   *  roughly doubling effective precision of the BLA coefficients. */
  abLo: Float32Array;
  /** rSq per entry packed in .r; other channels unused. */
  r: Float32Array;
  /** Valid entry count per level (≤ orbitLength / 2^level). */
  numEntries: number[];
}

/** Linear texel index for BLA entry (level, e). */
function blaTexelIndex(level: number, e: number): number {
  const col = e & (BLA_TEX_W - 1); // e % BLA_TEX_W
  const rowInLevel = (e - col) / BLA_TEX_W; // Math.floor(e / BLA_TEX_W)
  const row = BLA_ROW_OFFSETS[level] + rowInLevel;
  return row * BLA_TEX_W + col;
}

/**
 * Build BLA tables from a reference orbit. Level 0 stores the single-step
 * perturbation coefficients (A = 2Z_n, B = 1); higher levels merge pairs
 * of entries bottom-up. Writes into caller-supplied buffers.
 *
 * The QS-stored orbit is collapsed to float64 (sum of four float32) for
 * BLA coefficient math — BLA accuracy is bounded by the linearisation
 * error, not the orbit precision, so plain f64 is more than enough.
 */
export function buildBLA(orbitLength: number, orbitReQS: Float32Array, orbitImQS: Float32Array, out: BLABuffers): void {
  const { ab, abLo, r, numEntries } = out;

  // Split a float64 into (hi, lo) float32s. hi = f32(x), lo = f32(x − hi).
  // Together hi + lo reproduce x to ~14 decimal digits when round-tripped
  // through two float32 texture samples.
  const writePair = (idx: number, val: number) => {
    const hi = Math.fround(val);
    ab[idx] = hi;
    abLo[idx] = Math.fround(val - hi);
  };

  // Level 0 — one entry per orbit step. A = 2Z, B = 1 + 0i.
  for (let n = 0; n < orbitLength; n++) {
    const base = n * 4;
    const Zre = orbitReQS[base] + orbitReQS[base + 1] + orbitReQS[base + 2] + orbitReQS[base + 3];
    const Zim = orbitImQS[base] + orbitImQS[base + 1] + orbitImQS[base + 2] + orbitImQS[base + 3];
    const ZabsSq = Zre * Zre + Zim * Zim;

    const idx = blaTexelIndex(0, n) * 4;
    writePair(idx + 0, 2 * Zre);
    writePair(idx + 1, 2 * Zim);
    writePair(idx + 2, 1);
    writePair(idx + 3, 0);
    r[idx + 0] = BLA_GAMMA_SQ * ZabsSq;
  }
  numEntries[0] = orbitLength;

  // Higher levels — merge pairs. Critical: reconstruct the full float64 value
  // (hi + lo) from the DS pair before arithmetic, so merges run at f64
  // precision and only the final round-trip back to hi/lo is lossy.
  for (let level = 1; level < BLA_MAX_LEVELS; level++) {
    const step = 1 << level;
    const count = Math.floor(orbitLength / step);
    numEntries[level] = count;

    for (let e = 0; e < count; e++) {
      const li = blaTexelIndex(level - 1, 2 * e) * 4;
      const ri = blaTexelIndex(level - 1, 2 * e + 1) * 4;

      const lA_re = ab[li + 0] + abLo[li + 0];
      const lA_im = ab[li + 1] + abLo[li + 1];
      const lB_re = ab[li + 2] + abLo[li + 2];
      const lB_im = ab[li + 3] + abLo[li + 3];
      const rA_re = ab[ri + 0] + abLo[ri + 0];
      const rA_im = ab[ri + 1] + abLo[ri + 1];
      const rB_re = ab[ri + 2] + abLo[ri + 2];
      const rB_im = ab[ri + 3] + abLo[ri + 3];
      const lRSq = r[li + 0],
        rRSq = r[ri + 0];

      // A_merged = rA · lA   (complex multiply)
      const A_re = rA_re * lA_re - rA_im * lA_im;
      const A_im = rA_re * lA_im + rA_im * lA_re;
      // B_merged = rA · lB + rB
      const B_re = rA_re * lB_re - rA_im * lB_im + rB_re;
      const B_im = rA_re * lB_im + rA_im * lB_re + rB_im;

      // r²_merged = min(lRSq, rRSq / |lA|²). |lA|² can be 0 near a minibrot
      // centre; treat that as "no restriction from second half".
      const lAabsSq = lA_re * lA_re + lA_im * lA_im;
      let rSq = lRSq;
      if (lAabsSq > 0) {
        const scaled = rRSq / lAabsSq;
        if (scaled < rSq) rSq = scaled;
      }

      // Overflow guard — a blown-up |A|² can't round-trip through float32,
      // so zero the radius and the shader will skip the entry.
      const mergedAabsSq = A_re * A_re + A_im * A_im;
      if (!Number.isFinite(mergedAabsSq) || mergedAabsSq > BLA_A_MAX_SQ) {
        rSq = 0;
      }

      const oi = blaTexelIndex(level, e) * 4;
      writePair(oi + 0, A_re);
      writePair(oi + 1, A_im);
      writePair(oi + 2, B_re);
      writePair(oi + 3, B_im);
      r[oi + 0] = rSq;
    }
  }
}

/**
 * Compute the Mandelbrot reference orbit at DD center (cx, cy).
 * Writes up to `targetIter` iterations into reOut/imOut as QS (4× float32).
 * Returns the number of valid entries; may be < targetIter if the reference
 * escapes early. Callers should pass pre-allocated buffers sized for the
 * largest orbit they'll ever request (texture capacity) so this function
 * can be called hot without GC churn.
 */
export function computeReferenceOrbitQS(
  cx: DD,
  cy: DD,
  targetIter: number,
  reOut: Float32Array,
  imOut: Float32Array
): number {
  let Z: [DD, DD] = [
    [0, 0],
    [0, 0]
  ];
  let length = targetIter;

  for (let i = 0; i < targetIter; i++) {
    const reQS = ddToQS(Z[0]);
    const imQS = ddToQS(Z[1]);
    const base = i * 4;
    reOut[base + 0] = reQS[0];
    reOut[base + 1] = reQS[1];
    reOut[base + 2] = reQS[2];
    reOut[base + 3] = reQS[3];
    imOut[base + 0] = imQS[0];
    imOut[base + 1] = imQS[1];
    imOut[base + 2] = imQS[2];
    imOut[base + 3] = imQS[3];

    // Z = Z² + C
    const re2 = ddMul(Z[0], Z[0]);
    const im2 = ddMul(Z[1], Z[1]);
    const reim = ddMul(Z[0], Z[1]);
    Z = [ddAdd(ddSub(re2, im2), cx), ddAdd(ddAdd(reim, reim), cy)];

    if (Z[0][0] * Z[0][0] + Z[1][0] * Z[1][0] > 4.0) {
      length = i + 1;
      break;
    }
  }

  return length;
}

// ── Minibrot-seeking reference orbit ──────────────────────────────────
//
// At deep zoom the best reference is a periodic point (a minibrot centre):
// its orbit returns to 0 and never escapes, so we get the full iteration
// budget AND a favourable |Z_n| profile for BLA. We find one in two steps:
//
//   1. Atom-period detection — along the orbit of (cx, cy), the index
//      k minimising |z_k| is the period of the nearest minibrot (assuming
//      the orbit doesn't escape first).
//   2. Newton iteration on F(c) = z_period(c) — converges to a nearby c
//      where z_period(c) = 0 exactly. Uses DD throughout so the solution
//      is accurate at 10¹⁵+ zoom.
//
// Both steps are cheap compared with the full orbit + BLA build, and either
// can reject ("no nearby minibrot" / "Newton didn't converge"), in which
// case callers should fall back to the view centre.

// Below this zoom the view centre is already a fine reference; skip the
// seek to avoid wasted work and unnecessary Newton drift.
const MINIBROT_ZOOM_GATE = 1000;
const MINIBROT_NEWTON_MAX_ITER = 40;
// Converged when |delta|² dips below this. 1e-60 ≈ 10⁻³⁰ in magnitude,
// which is well inside the precision of DD.
const MINIBROT_NEWTON_TOL_SQ = 1e-60;
// If the minimum |z_k| along the orbit isn't at least this close to 0,
// there's no periodic point nearby worth converging to.
const MINIBROT_MIN_DEPTH = 0.5;

export interface MinibrotResult {
  cx: DD;
  cy: DD;
  period: number;
}

/**
 * Atom-period detection: iterate z←z²+c in DD and record argmin |z_k|.
 * Returns -1 if the orbit escapes (no minibrot to seek) or if the min
 * depth is too shallow.
 */
function detectPeriod(cx: DD, cy: DD, maxIter: number): number {
  let Zre: DD = [0, 0];
  let Zim: DD = [0, 0];
  let minAbsSq = Infinity;
  let bestK = -1;

  for (let i = 1; i <= maxIter; i++) {
    const re2 = ddMul(Zre, Zre);
    const im2 = ddMul(Zim, Zim);
    const reim = ddMul(Zre, Zim);
    Zre = ddAdd(ddSub(re2, im2), cx);
    Zim = ddAdd(ddAdd(reim, reim), cy);

    const absSq = Zre[0] * Zre[0] + Zim[0] * Zim[0];
    if (absSq > 4.0) return -1;
    if (absSq < minAbsSq) {
      minAbsSq = absSq;
      bestK = i;
    }
  }

  if (minAbsSq > MINIBROT_MIN_DEPTH * MINIBROT_MIN_DEPTH) return -1;
  return bestK;
}

/**
 * Newton iteration on F(c) = z_period(c). Computes z_period and its
 * derivative dz_period/dc jointly in DD, applies c ← c − F/F′ until the
 * update is negligible. Returns null on singular derivative, failure
 * to converge within MINIBROT_NEWTON_MAX_ITER steps, or runaway drift
 * past maxRadius from the starting point.
 */
function newtonMinibrot(cx0: DD, cy0: DD, period: number, maxRadius: number): MinibrotResult | null {
  let cx = cx0;
  let cy = cy0;
  const maxDriftSq = maxRadius * maxRadius * 4; // 2× the viewport radius, squared

  for (let step = 0; step < MINIBROT_NEWTON_MAX_ITER; step++) {
    let Zre: DD = [0, 0];
    let Zim: DD = [0, 0];
    let dZre: DD = [0, 0];
    let dZim: DD = [0, 0];

    // Forward sweep: z and dz/dc together for `period` steps.
    for (let i = 0; i < period; i++) {
      // dz_new = 2·z·dz + 1    (complex)
      const ndZre = ddAdd(ddSub(ddMulFloat(ddMul(Zre, dZre), 2), ddMulFloat(ddMul(Zim, dZim), 2)), ddFrom(1));
      const ndZim = ddAdd(ddMulFloat(ddMul(Zre, dZim), 2), ddMulFloat(ddMul(Zim, dZre), 2));

      // z_new = z² + c
      const re2 = ddMul(Zre, Zre);
      const im2 = ddMul(Zim, Zim);
      const reim = ddMul(Zre, Zim);
      const nZre = ddAdd(ddSub(re2, im2), cx);
      const nZim = ddAdd(ddAdd(reim, reim), cy);

      Zre = nZre;
      Zim = nZim;
      dZre = ndZre;
      dZim = ndZim;
    }

    // Newton step: delta = Z / dZ  (complex division)
    const dZabsSq = ddAdd(ddMul(dZre, dZre), ddMul(dZim, dZim));
    if (dZabsSq[0] < 1e-300) return null; // derivative too small to invert safely

    const num_re = ddAdd(ddMul(Zre, dZre), ddMul(Zim, dZim));
    const num_im = ddSub(ddMul(Zim, dZre), ddMul(Zre, dZim));
    const delta_re = ddDiv(num_re, dZabsSq);
    const delta_im = ddDiv(num_im, dZabsSq);

    cx = ddSub(cx, delta_re);
    cy = ddSub(cy, delta_im);

    // Drift check — if we've wandered too far from the view, it's either a
    // Newton divergence or we're chasing a minibrot that's outside the user's
    // viewport. Either way: bail.
    const dx = cx[0] - cx0[0];
    const dy = cy[0] - cy0[0];
    if (dx * dx + dy * dy > maxDriftSq) return null;

    const deltaAbsSq = delta_re[0] * delta_re[0] + delta_im[0] * delta_im[0];
    if (deltaAbsSq < MINIBROT_NEWTON_TOL_SQ) {
      // |delta|² small is necessary but not sufficient — an ill-conditioned
      // |dZ| can make any Z look like a root. Re-sweep at the converged c
      // and reject if |z_period(c)|² isn't itself tiny.
      let vZre: DD = [0, 0];
      let vZim: DD = [0, 0];
      for (let i = 0; i < period; i++) {
        const re2 = ddMul(vZre, vZre);
        const im2 = ddMul(vZim, vZim);
        const reim = ddMul(vZre, vZim);
        vZre = ddAdd(ddSub(re2, im2), cx);
        vZim = ddAdd(ddAdd(reim, reim), cy);
      }
      const verifySq = vZre[0] * vZre[0] + vZim[0] * vZim[0];
      if (verifySq > 1e-20) return null; // not actually at a root

      return { cx, cy, period };
    }
  }

  return null;
}

/**
 * Try to replace the view centre with a nearby minibrot centre so the
 * perturbation reference never escapes and has a favourable |Z_n| profile.
 * Returns null when the seek isn't worth attempting (zoom too shallow) or
 * fails (no nearby minibrot, Newton rejects). Callers should then use the
 * view centre directly as the reference.
 */
export function findNearbyMinibrot(viewCx: DD, viewCy: DD, zoom: number, maxIter: number): MinibrotResult | null {
  if (zoom < MINIBROT_ZOOM_GATE) return null;
  const period = detectPeriod(viewCx, viewCy, maxIter);
  if (period < 1) return null;

  const viewRadius = 2 / zoom;
  return newtonMinibrot(viewCx, viewCy, period, viewRadius);
}
