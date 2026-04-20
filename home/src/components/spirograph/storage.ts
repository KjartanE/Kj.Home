import type { SpirographParams } from "./types";
import { SAVEABLE_KEYS } from "./types";
import type { Preset } from "./presets";

const STORAGE_KEY = "spirograph-presets-v2";

export type SavedPresets = Record<string, Preset>;

export function loadSavedPresets(): SavedPresets {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPresets) : {};
  } catch {
    return {};
  }
}

export function saveSavedPresets(presets: SavedPresets) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // quota or JSON failure — ignore; presets are non-critical.
  }
}

export function getSaveable(params: SpirographParams): Preset {
  const out: Preset = {};
  for (const key of SAVEABLE_KEYS) {
    (out[key] as unknown) = params[key];
  }
  return out;
}
