// Records hover-preview clips for the auto-animating project pages by driving a
// real (headed = real GPU for WebGL) browser to each /projects/<slug> route.
// Outputs raw, named clips into public/projects/previews/.raw — compress them
// with scripts/encode-previews.sh (bun run previews:encode).
//
// Usage:
//   bun run dev                  # one terminal, serves :4444
//   bun run previews:record      # another terminal
//
// waveform + butterchurn need real audio behind a "Start Audio Capture" click,
// so record those two by hand (Cmd+Shift+5) into the same .raw dir. To match the
// chrome-free look, click "Start Audio Capture" first, then paste this in the
// console to strip the UI before you start the screen recording:
//   {const s=document.createElement('style');s.textContent='body *{visibility:hidden!important}body canvas{visibility:visible!important}';document.head.append(s)}
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:4444";
const PREVIEWS = path.resolve("public/projects/previews");
const RAW = path.join(PREVIEWS, ".raw"); // named source clips, encoded later
const TMP = path.resolve(".preview-tmp"); // Playwright's auto-named recordings (discarded)
// Capture full-HD so the visualization fills the frame; override with WIDTH/HEIGHT.
const SIZE = { width: Number(process.env.WIDTH ?? 1920), height: Number(process.env.HEIGHT ?? 1080) };
const DURATION = Number(process.env.DURATION ?? 7000); // ms captured per clip

const SLUGS = ["penrose", "mandelbrot", "pendulum", "chladni", "spirograph", "life", "solar", "cube"];

// Strip ALL page UI — the site header, the per-project control panels, and the
// info panel — so each clip is pure visualization. Every scene renders to a
// <canvas>, so hide everything under <body> and re-show only the canvas. (The
// `body canvas` selector outranks `body *` on specificity, so the canvas wins.)
const HIDE_CHROME = `body *{visibility:hidden !important}body canvas{visibility:visible !important}`;

// Warm-up gestures for pages that are static until you interact.
const GESTURES = {
  mandelbrot: async (p) => {
    await p.mouse.move(SIZE.width / 2, SIZE.height / 2);
    for (let i = 0; i < 40; i++) await p.mouse.wheel(0, -30);
  },
  pendulum: async (p) => {
    await p.mouse.move(SIZE.width / 2, 120);
    await p.mouse.move(SIZE.width / 2 + 200, 280, { steps: 20 });
  }
};

await rm(TMP, { recursive: true, force: true });
await mkdir(RAW, { recursive: true });
await mkdir(TMP, { recursive: true });

const browser = await chromium.launch({ headless: false });
for (const slug of SLUGS) {
  const ctx = await browser.newContext({ viewport: SIZE, recordVideo: { dir: TMP, size: SIZE } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/${slug}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE_CHROME });
  await page.waitForTimeout(1500); // let the scene spin up
  await GESTURES[slug]?.(page);
  await page.waitForTimeout(DURATION);
  const video = page.video();
  await ctx.close(); // finalizes the webm
  await video.saveAs(path.join(RAW, `${slug}.webm`));
  console.log(`✓ recorded ${slug}`);
}
await browser.close();
await rm(TMP, { recursive: true, force: true });
console.log(`\nDone → ${RAW}\nNext: bun run previews:encode`);
