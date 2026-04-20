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

// Shared orbit-texture geometry. Keep these in sync with the shader
// constants in MandelbrotBackground.tsx.
export const ORBIT_TEX_W = 4096;
export const ORBIT_TEX_H = 16;

// ── BLA (Bivariate Linear Approximation) layout ────────────────────────
//
// A BLA entry at (level l, index e) summarises 2^l perturbation steps
// starting from orbit iteration e * 2^l as a pair of complex coefficients:
//
//   ε_{n + step} ≈ A · ε_n + B · δc        (linearisation)
//
// with a validity radius r (so the approximation only fires while
// |ε_n|² < r²). Entries are densely packed per level into a 2D
// RGBA32F texture. Row layout is level-major with fixed row budgets
// per level — not space-optimal but easy to index from both sides.

export const BLA_TEX_W = 4096;
export const BLA_MAX_LEVELS = 8;
// Rows per level at MAX_ITER = 65536: 16, 8, 4, 2, 1, 1, 1, 1 → 34 total.
export const BLA_ROW_OFFSETS: readonly number[] = [0, 16, 24, 28, 30, 31, 32, 33];
export const BLA_TEX_H = 34;
// Same tolerance as the shader's glitch criterion. The linearisation
// breaks down under the same condition perturbation does: γ ≈ 10⁻³.
const BLA_GAMMA_SQ = 1e-6;
// Clamp |A|² to something representable. Entries above this magnitude
// would blow up float32 anyway; we mark them invalid via rSq = 0.
const BLA_A_MAX_SQ = 1e30;

export interface BLABuffers {
  /** Packed (A.re, A.im, B.re, B.im) per entry. Length = BLA_TEX_W·BLA_TEX_H·4. */
  ab: Float32Array;
  /** rSq per entry packed in .r; other channels unused. Same length as ab. */
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
  const { ab, r, numEntries } = out;

  // Level 0 — one entry per orbit step.
  for (let n = 0; n < orbitLength; n++) {
    const base = n * 4;
    const Zre = orbitReQS[base] + orbitReQS[base + 1] + orbitReQS[base + 2] + orbitReQS[base + 3];
    const Zim = orbitImQS[base] + orbitImQS[base + 1] + orbitImQS[base + 2] + orbitImQS[base + 3];
    const ZabsSq = Zre * Zre + Zim * Zim;

    const idx = blaTexelIndex(0, n) * 4;
    ab[idx + 0] = 2 * Zre; // A.re
    ab[idx + 1] = 2 * Zim; // A.im
    ab[idx + 2] = 1; // B.re
    ab[idx + 3] = 0; // B.im
    r[idx + 0] = BLA_GAMMA_SQ * ZabsSq; // rSq
  }
  numEntries[0] = orbitLength;

  // Higher levels — merge pairs of adjacent lower-level entries.
  for (let level = 1; level < BLA_MAX_LEVELS; level++) {
    const step = 1 << level;
    const count = Math.floor(orbitLength / step);
    numEntries[level] = count;

    for (let e = 0; e < count; e++) {
      const li = blaTexelIndex(level - 1, 2 * e) * 4;
      const ri = blaTexelIndex(level - 1, 2 * e + 1) * 4;

      const lA_re = ab[li + 0],
        lA_im = ab[li + 1],
        lB_re = ab[li + 2],
        lB_im = ab[li + 3];
      const rA_re = ab[ri + 0],
        rA_im = ab[ri + 1],
        rB_re = ab[ri + 2],
        rB_im = ab[ri + 3];
      const lRSq = r[li + 0],
        rRSq = r[ri + 0];

      // A_merged = rA · lA   (complex multiply)
      const A_re = rA_re * lA_re - rA_im * lA_im;
      const A_im = rA_re * lA_im + rA_im * lA_re;
      // B_merged = rA · lB + rB
      const B_re = rA_re * lB_re - rA_im * lB_im + rB_re;
      const B_im = rA_re * lB_im + rA_im * lB_re + rB_im;

      // r²_merged = min(lRSq, rRSq / |lA|²). |lA|² could be 0 near minibrot
      // centers — treat that as "no restriction from second half", so fall
      // back to lRSq alone.
      const lAabsSq = lA_re * lA_re + lA_im * lA_im;
      let rSq = lRSq;
      if (lAabsSq > 0) {
        const scaled = rRSq / lAabsSq;
        if (scaled < rSq) rSq = scaled;
      }

      // Overflow guard: float32 tops out around 3.4×10³⁸; any A beyond
      // BLA_A_MAX_SQ gets its validity radius zeroed so the shader skips it.
      const mergedAabsSq = A_re * A_re + A_im * A_im;
      if (!Number.isFinite(mergedAabsSq) || mergedAabsSq > BLA_A_MAX_SQ) {
        rSq = 0;
      }

      const oi = blaTexelIndex(level, e) * 4;
      ab[oi + 0] = A_re;
      ab[oi + 1] = A_im;
      ab[oi + 2] = B_re;
      ab[oi + 3] = B_im;
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
