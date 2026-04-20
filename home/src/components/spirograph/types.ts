export type AnimationMode = "Draw" | "Complete" | "Animate Phase" | "Animate Offset" | "Animate Scale" | "Animate All";

export type LoopMode = "Once" | "Loop" | "Ping-Pong";

export interface Arm {
  radius: number;
  speed: number;
  phase: number;
}

export interface SpirographParams {
  // Arms
  arm1Radius: number;
  arm1Speed: number;
  arm1Phase: number;

  arm2Radius: number;
  arm2Speed: number;
  arm2Phase: number;

  arm3Enabled: boolean;
  arm3Radius: number;
  arm3Speed: number;
  arm3Phase: number;

  arm4Enabled: boolean;
  arm4Radius: number;
  arm4Speed: number;
  arm4Phase: number;

  // Static drift
  radialOffset: number;
  phaseOffset: number;
  scaleOffset: number;

  // Animation
  animationMode: AnimationMode;
  animLoopMode: LoopMode;
  holdAtEnd: number;
  duration: number; // seconds
  paused: boolean;

  animPhaseFrom: number;
  animPhaseTo: number;
  animOffsetFrom: number;
  animOffsetTo: number;
  animScaleFrom: number;
  animScaleTo: number;

  // General
  rotations: number;

  // Visual
  lineWidth: number;
  lineColor: string;
  bgColor: string;
  showMechanism: boolean;
  mechanismAlpha: number;
  gradientLine: boolean;
  glowEffect: boolean;

  // G-code export
  gcodeWidth: number;
  gcodeHeight: number;
  gcodeFeedRate: number;
  gcodeTravelSpeed: number;
  gcodePenUpZ: number;
  gcodePenDownZ: number;
  gcodeMargin: number;
  gcodeOptimize: boolean;
  gcodePointSkip: number;
}

export const DEFAULT_PARAMS: SpirographParams = {
  arm1Radius: 300,
  arm1Speed: 1,
  arm1Phase: 0,

  arm2Radius: 180,
  arm2Speed: -5,
  arm2Phase: 0,

  arm3Enabled: true,
  arm3Radius: 90,
  arm3Speed: 13,
  arm3Phase: 0,

  arm4Enabled: false,
  arm4Radius: 45,
  arm4Speed: -21,
  arm4Phase: 0,

  radialOffset: 0,
  phaseOffset: 0,
  scaleOffset: 0,

  animationMode: "Draw",
  animLoopMode: "Once",
  holdAtEnd: 0.3,
  duration: 20,
  paused: false,

  animPhaseFrom: 0,
  animPhaseTo: Math.PI * 2,
  animOffsetFrom: 0,
  animOffsetTo: 10,
  animScaleFrom: 0,
  animScaleTo: 0.03,

  rotations: 1,

  lineWidth: 1.5,
  lineColor: "#1a1a2e",
  bgColor: "#f5f0e8",
  showMechanism: true,
  mechanismAlpha: 0.5,
  gradientLine: false,
  glowEffect: false,

  gcodeWidth: 200,
  gcodeHeight: 200,
  gcodeFeedRate: 1000,
  gcodeTravelSpeed: 3000,
  gcodePenUpZ: 3,
  gcodePenDownZ: 0,
  gcodeMargin: 10,
  gcodeOptimize: true,
  gcodePointSkip: 5
};

export const SAVEABLE_KEYS: ReadonlyArray<keyof SpirographParams> = [
  "arm1Radius",
  "arm1Speed",
  "arm1Phase",
  "arm2Radius",
  "arm2Speed",
  "arm2Phase",
  "arm3Enabled",
  "arm3Radius",
  "arm3Speed",
  "arm3Phase",
  "arm4Enabled",
  "arm4Radius",
  "arm4Speed",
  "arm4Phase",
  "radialOffset",
  "phaseOffset",
  "scaleOffset",
  "animationMode",
  "animLoopMode",
  "holdAtEnd",
  "duration",
  "animPhaseFrom",
  "animPhaseTo",
  "animOffsetFrom",
  "animOffsetTo",
  "animScaleFrom",
  "animScaleTo",
  "rotations",
  "lineWidth",
  "lineColor",
  "bgColor",
  "showMechanism",
  "mechanismAlpha",
  "gradientLine",
  "glowEffect",
  "gcodeWidth",
  "gcodeHeight",
  "gcodeFeedRate",
  "gcodeTravelSpeed",
  "gcodePenUpZ",
  "gcodePenDownZ",
  "gcodeMargin",
  "gcodeOptimize",
  "gcodePointSkip"
];
