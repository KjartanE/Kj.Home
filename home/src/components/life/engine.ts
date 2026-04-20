// Sparse-set Game of Life engine. Grid is effectively unbounded:
// x, y ∈ [-2^31, 2^31). Step cost scales with live-cell count.

const OFFSET = 0x80000000; // 2^31, to map int32 → uint32 for packing

export function packKey(x: number, y: number): bigint {
  return (BigInt((x + OFFSET) >>> 0) << 32n) | BigInt((y + OFFSET) >>> 0);
}

export function unpackKey(key: bigint): [number, number] {
  const y = Number(key & 0xffffffffn) - OFFSET;
  const x = Number((key >> 32n) & 0xffffffffn) - OFFSET;
  return [x, y];
}

export type PatternCategory = "Still life" | "Oscillator" | "Spaceship" | "Gun" | "Methuselah";

export interface Pattern {
  name: string;
  category: PatternCategory;
  description?: string;
  cells: ReadonlyArray<readonly [number, number]>;
  width: number;
  height: number;
}

function parsePattern(rows: string[]): { cells: Array<[number, number]>; width: number; height: number } {
  const cells: Array<[number, number]> = [];
  let width = 0;
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    width = Math.max(width, row.length);
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "#" || ch === "O" || ch === "*") cells.push([x, y]);
    }
  }
  return { cells, width, height: rows.length };
}

function mkPattern(name: string, category: PatternCategory, rows: string[], description?: string): Pattern {
  return { name, category, description, ...parsePattern(rows) };
}

export const PATTERNS: Pattern[] = [
  // Still lifes
  mkPattern("Block", "Still life", ["##", "##"]),
  mkPattern("Beehive", "Still life", [".##.", "#..#", ".##."]),
  mkPattern("Loaf", "Still life", [".##.", "#..#", ".#.#", "..#."]),

  // Oscillators
  mkPattern("Blinker", "Oscillator", ["###"], "Period 2"),
  mkPattern("Toad", "Oscillator", [".###", "###."], "Period 2"),
  mkPattern("Beacon", "Oscillator", ["##..", "##..", "..##", "..##"], "Period 2"),
  mkPattern(
    "Pulsar",
    "Oscillator",
    [
      "..###...###..",
      ".............",
      "#....#.#....#",
      "#....#.#....#",
      "#....#.#....#",
      "..###...###..",
      ".............",
      "..###...###..",
      "#....#.#....#",
      "#....#.#....#",
      "#....#.#....#",
      ".............",
      "..###...###.."
    ],
    "Period 3"
  ),

  // Spaceships
  mkPattern("Glider", "Spaceship", [".#.", "..#", "###"], "Travels diagonally at c/4"),
  mkPattern("LWSS", "Spaceship", [".#..#", "#....", "#...#", "####."], "Lightweight spaceship"),

  // Guns
  mkPattern(
    "Gosper gun",
    "Gun",
    [
      "........................#...........",
      "......................#.#...........",
      "............##......##............##",
      "...........#...#....##............##",
      "##........#.....#...##..............",
      "##........#...#.##....#.#...........",
      "..........#.....#.......#...........",
      "...........#...#....................",
      "............##......................"
    ],
    "Emits a glider every 30 generations"
  ),

  // Methuselahs
  mkPattern("R-pentomino", "Methuselah", [".##", "##.", ".#."], "Stabilizes after 1103 generations"),
  mkPattern("Acorn", "Methuselah", [".#.....", "...#...", "##..###"], "Stabilizes after 5206 generations"),
  mkPattern("Diehard", "Methuselah", ["......#.", "##......", ".#...###"], "Dies after 130 generations")
];

export class Life {
  alive: Set<bigint> = new Set();
  generation: number = 0;

  get population(): number {
    return this.alive.size;
  }

  has(x: number, y: number): boolean {
    return this.alive.has(packKey(x, y));
  }

  set(x: number, y: number, value: boolean): void {
    const k = packKey(x, y);
    if (value) this.alive.add(k);
    else this.alive.delete(k);
  }

  toggle(x: number, y: number): void {
    const k = packKey(x, y);
    if (this.alive.has(k)) this.alive.delete(k);
    else this.alive.add(k);
  }

  clear(): void {
    this.alive.clear();
    this.generation = 0;
  }

  step(): void {
    const counts = new Map<bigint, number>();
    for (const cell of this.alive) {
      const [x, y] = unpackKey(cell);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const k = packKey(x + dx, y + dy);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
    }
    const next = new Set<bigint>();
    for (const [k, n] of counts) {
      if (n === 3 || (n === 2 && this.alive.has(k))) next.add(k);
    }
    this.alive = next;
    this.generation++;
  }

  randomize(xMin: number, yMin: number, xMax: number, yMax: number, density: number = 0.3): void {
    this.alive.clear();
    this.generation = 0;
    for (let x = xMin; x < xMax; x++) {
      for (let y = yMin; y < yMax; y++) {
        if (Math.random() < density) this.alive.add(packKey(x, y));
      }
    }
  }

  stamp(pattern: Pattern, x0: number, y0: number): void {
    for (const [dx, dy] of pattern.cells) {
      this.alive.add(packKey(x0 + dx, y0 + dy));
    }
  }
}
