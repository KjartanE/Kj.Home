declare module "butterchurn" {
  import { Visualizer } from "@/components/butterchurn/types";

  interface VisualizerOptions {
    width: number;
    height: number;
    meshWidth?: number;
    meshHeight?: number;
    pixelRatio?: number;
    textureRatio?: number;
  }

  interface Butterchurn {
    createVisualizer(audioContext: AudioContext, canvas: HTMLCanvasElement, options: VisualizerOptions): Visualizer;
  }

  const butterchurn: Butterchurn;
  export default butterchurn;
}

declare module "butterchurn/lib/isSupported.min" {
  const isSupported: () => boolean;
  export default isSupported;
}

declare module "butterchurn-presets" {
  interface ButterchurnPresets {
    getPresets(): Record<string, Record<string, unknown>>;
  }

  const presets: ButterchurnPresets;
  export default presets;
}
