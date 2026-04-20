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
