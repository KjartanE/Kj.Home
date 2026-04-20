"use client";

import { useCallback, useEffect, useState } from "react";
import SpirographScene from "@/components/spirograph/SpirographScene";
import { Controls } from "@/components/spirograph/Controls";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";
import { DEFAULT_PARAMS, type SpirographParams } from "@/components/spirograph/types";
import { BUILT_IN_PRESETS } from "@/components/spirograph/presets";
import {
  getSaveable,
  loadSavedPresets,
  saveSavedPresets,
  type SavedPresets
} from "@/components/spirograph/storage";
import { downloadGCode } from "@/components/spirograph/gcode";

export default function Page() {
  const [params, setParams] = useState<SpirographParams>(DEFAULT_PARAMS);
  const [savedPresets, setSavedPresets] = useState<SavedPresets>({});

  // Load saved presets after mount (localStorage is client-only).
  useEffect(() => {
    setSavedPresets(loadSavedPresets());
  }, []);

  const onChange = useCallback(<K extends keyof SpirographParams>(key: K, value: SpirographParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onLoadPreset = useCallback(
    (name: string) => {
      const preset = BUILT_IN_PRESETS[name] ?? savedPresets[name];
      if (!preset) return;
      setParams((prev) => ({ ...prev, ...preset }));
    },
    [savedPresets]
  );

  const onSavePreset = useCallback(() => {
    const name = typeof window !== "undefined" ? window.prompt("Preset name:") : null;
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = { ...savedPresets, [trimmed]: getSaveable(params) };
    setSavedPresets(next);
    saveSavedPresets(next);
  }, [params, savedPresets]);

  const onDeletePreset = useCallback(() => {
    const names = Object.keys(savedPresets);
    if (names.length === 0) {
      window.alert("No saved presets.");
      return;
    }
    const name = window.prompt(`Delete which preset?\n\n${names.join("\n")}`);
    if (!name) return;
    if (!(name in savedPresets)) {
      window.alert("Preset not found.");
      return;
    }
    const next = { ...savedPresets };
    delete next[name];
    setSavedPresets(next);
    saveSavedPresets(next);
  }, [savedPresets]);

  const onExportJSON = useCallback(() => {
    const json = JSON.stringify(getSaveable(params), null, 2);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(json).catch(() => {
        window.prompt("Copy settings JSON:", json);
      });
    } else {
      window.prompt("Copy settings JSON:", json);
    }
  }, [params]);

  const onImportJSON = useCallback(() => {
    const input = window.prompt("Paste settings JSON:");
    if (!input) return;
    try {
      const parsed = JSON.parse(input) as Partial<SpirographParams>;
      setParams((prev) => ({ ...prev, ...parsed }));
    } catch {
      window.alert("Invalid JSON.");
    }
  }, []);

  const onExportGCode = useCallback(() => {
    downloadGCode(params);
  }, [params]);

  return (
    <ProjectPageLayout slug="spirograph">
      <SpirographScene params={params} />
      <Controls
        params={params}
        onChange={onChange}
        savedPresets={savedPresets}
        onLoadPreset={onLoadPreset}
        onSavePreset={onSavePreset}
        onDeletePreset={onDeletePreset}
        onExportJSON={onExportJSON}
        onImportJSON={onImportJSON}
        onExportGCode={onExportGCode}
      />
    </ProjectPageLayout>
  );
}
