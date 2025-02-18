export interface Visualizer {
  audio: AudioProcessor;
  baseValsDefaults: BaseValsDefaults;
  shapeBaseValsDefaults: ShapeBaseValsDefaults;
  waveBaseValsDefaults: WaveBaseValsDefaults;
  renderer: Renderer;
  connectAudio: (audioNode: AudioNode) => void;
  disconnectAudio: (audioNode: AudioNode) => void;
  launchSongTitleAnim: (text: string) => void;
  loadExtraImages: (imageData: Record<string, string>) => void;
  loadPreset: (presetMap: PresetObject, time?: number) => void;
  render: () => void;
  setInternalMeshSize: (width: number, height: number) => void;
  setOutputAA: (useAA: boolean) => void;
  setRendererSize: (width: number, height: number) => void;
  toDataURL: () => string;
  warpBufferToDataURL: () => string;
}

interface AudioLevels {
  audio: AudioProcessor;
  starts: number[];
  stops: number[];
  val: Float32Array;
  imm: Float32Array;
}

interface BasicWaveform {
  gl: WebGL2RenderingContext;
  positions: Float32Array;
  positions2: Float32Array;
  oldPositions: Float32Array;
  oldPositions2: Float32Array;
}

interface BlendPattern {
  mesh_width: number;
  mesh_height: number;
  aspectx: number;
  aspecty: number;
  vertInfoA: Float32Array;
}

interface BlurShader {
  blurLevel: number;
  blurRatios: number[][];
  gl: WebGL2RenderingContext;
  texsizeX: number;
  texsizeY: number;
}

interface CompShader {
  gl: WebGL2RenderingContext;
  noise: Noise;
  image: ImageTextures;
  mesh_width: number;
  mesh_height: number;
}

interface CustomShape {
  gl: WebGL2RenderingContext;
  aspectx: number;
  aspecty: number;
  invAspectx: number;
  invAspecty: number;
}

interface CustomWaveform {
  gl: WebGL2RenderingContext;
  positions: Float32Array;
  positions2: Float32Array;
  oldPositions: Float32Array;
  oldPositions2: Float32Array;
  samples: number;
  meshWidth: number;
  meshHeight: number;
  aspectx: number;
  aspecty: number;
}

interface Border {
  gl: WebGL2RenderingContext;
  positions: Float32Array;
  aspectx: number;
  aspecty: number;
  invAspectx: number;
}

interface ImageTextures {
  gl: WebGL2RenderingContext;
  anisoExt: EXTTextureFilterAnisotropic;
  samplers: Record<string, unknown>;
  clouds2Image: HTMLImageElement;
  emptyImage: HTMLImageElement;
}

interface Noise {
  gl: WebGL2RenderingContext;
  anisoExt: EXTTextureFilterAnisotropic;
  noiseTexLQ: WebGLTexture;
  noiseTexLQLite: WebGLTexture;
  noiseTexMQ: WebGLTexture;
}

interface PresetEquationRunner {
  preset: PresetObject;
  texsizeX: number;
  texsizeY: number;
  mesh_width: number;
  mesh_height: number;
}

interface WaveBaseValsDefaults {
  a: number;
  additive: number;
  b: number;
  enabled: number;
  g: number;
  r: number;
  samples: number;
  scaling: number;
  sep: number;
  smoothing: number;
  spectrum: number;
  thick: number;
  usedots: number;
}

interface PresetObject {
  baseVals: Record<string, unknown>;
  waves: WaveBaseValsDefaults[];
  init_eqs: (preset: PresetObject) => void;
  frame_eqs: (preset: PresetObject) => void;
  pixel_eqs: (preset: PresetObject) => void;
}

interface Renderer {
  // WebGL Context and Extensions
  gl: WebGL2RenderingContext;
  anisoExt: EXTTextureFilterAnisotropic;

  // Dimensions and Ratios
  width: number;
  height: number;
  mesh_width: number;
  mesh_height: number;
  aspectx: number;
  aspecty: number;
  invAspectx: number;
  invAspecty: number;
  texsizeX: number;
  texsizeY: number;
  textureRatio: number;
  pixelRatio: number;

  // Time and Frame Management
  time: number;
  lastTime: number;
  frameNum: number;
  fps: number;
  presetTime: number;
  timeHist: number[];
  timeHistMax: number;

  // Audio Processing
  audio: AudioProcessor;
  audioLevels: AudioLevels;

  // Render Components
  basicWaveform: BasicWaveform;
  motionVectors: MotionVectors;
  customWaveforms: CustomWaveform[];
  customShapes: CustomShape[];
  darkenCenter: CustomShape;
  innerBorder: Border;
  outerBorder: Border;

  // Shaders
  blurShader1: BlurShader;
  blurShader2: BlurShader;
  blurShader3: BlurShader;
  compShader: CompShader;
  outputShader: OutputShader;
  resampleShader: ResampleShader;
  warpShader: WarpShader;

  // Textures and Framebuffers
  compTexture: WebGLTexture;
  prevTexture: WebGLTexture;
  targetTexture: WebGLTexture;
  blurTexture1: WebGLTexture;
  blurTexture2: WebGLTexture;
  blurTexture3: WebGLTexture;
  compFrameBuffer: WebGLFramebuffer;
  prevFrameBuffer: WebGLFramebuffer;
  targetFrameBuffer: WebGLFramebuffer;

  // Blending Properties
  blending: boolean;
  blendProgress: number;
  blendDuration: number;
  blendStartTime: number;
  blendPattern: BlendPattern;
  blurRatios: number[][];
  numBlurPasses: number;

  // Preset Management
  preset: PresetObject;
  prevPreset: PresetObject;
  presetEquationRunner: PresetEquationRunner;
  prevPresetEquationRunner: PresetEquationRunner;

  // Variables and State
  qs: string[];
  ts: string[];
  regs: string[];
  regVars: Record<string, unknown>;
  globalVars: Record<string, unknown>;

  // Output Configuration
  outputFXAA: boolean;

  // Arrays and Buffers
  warpUVs: Float32Array;
  warpColor: Float32Array;

  // UI Elements
  supertext: { startTime: number };
  titleText: TitleText;
}

interface BaseValsDefaults {
  decay: number;
  gammaadj: number;
  echo_zoom: number;
  echo_alpha: number;
  echo_orient: number;
}

interface ShapeBaseValsDefaults {
  enabled: number;
  sides: number;
  additive: number;
  thickoutline: number;
  textured: number;
}
