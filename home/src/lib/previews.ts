import fs from "node:fs";
import path from "node:path";
import { PROJECTS, type Project } from "@/constants/projects";

const PREVIEWS_DIR = path.join(process.cwd(), "public", "projects", "previews");

/**
 * Server-only: strips preview.video from projects whose clip files don't
 * exist yet, so BentoCard never renders a <video> that would 404. Evaluated
 * per-request in dev and at build time in production — drop clips into
 * public/projects/previews/ and rebuild (or just refresh in dev).
 */
export function getProjectsWithPreviews(): Project[] {
  let existing: ReadonlySet<string>;
  try {
    existing = new Set(fs.readdirSync(PREVIEWS_DIR));
  } catch {
    existing = new Set();
  }

  return PROJECTS.map((project) => {
    const video = project.preview?.video;
    if (!video) return project;

    const base = path.basename(video, ".webm");
    const hasClip = existing.has(`${base}.webm`) || existing.has(`${base}.mp4`);
    if (hasClip) return project;

    return { ...project, preview: { ...project.preview, video: undefined } };
  });
}
