import * as THREE from "three";

export const kaleidoscopeVertexShader = /* glsl */ `
  precision highp float;
  attribute float width;
  varying float vWidth;
  varying vec2 vWorldXY;
  void main() {
    vWidth = width;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldXY = world.xy;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const kaleidoscopeFragmentShader = /* glsl */ `
  precision highp float;
  varying float vWidth;
  varying vec2 vWorldXY;

  uniform vec3 layerColor;
  uniform float distanceScale;
  uniform float layerAlpha;
  uniform float time;
  uniform vec3 pulse;   // (x, y, startTime); unused if startTime < 0
  uniform float pulseSpeed;
  uniform float pulseLifetime;

  void main() {
    float d = length(vWorldXY);
    float scale = max(distanceScale * 3.0, 0.2);
    float fade = clamp(vWidth * d * scale * 20.0, 0.0, 1.0);

    float boost = 0.0;
    if (pulse.z >= 0.0) {
      float age = time - pulse.z;
      if (age > 0.0 && age < pulseLifetime) {
        float ringR = age * pulseSpeed;
        float dC = length(vWorldXY - pulse.xy);
        float ringD = dC - ringR;
        // tight ring in front (young) broadens as it ages
        float width = 20.0 + age * 80.0;
        float gauss = exp(-ringD * ringD / (width * width));
        float decay = 1.0 - age / pulseLifetime;
        boost = gauss * decay;
      }
    }

    vec3 col = layerColor * (fade + boost * 1.5);
    float a = clamp(fade * layerAlpha + boost * 0.8, 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`;

export interface KaleidoscopeUniforms {
  layerColor: { value: THREE.Color };
  distanceScale: { value: number };
  layerAlpha: { value: number };
  time: { value: number };
  pulse: { value: THREE.Vector3 };
  pulseSpeed: { value: number };
  pulseLifetime: { value: number };
}

export function createKaleidoscopeMaterial(color: THREE.Color, distanceScale: number, layerAlpha: number) {
  const uniforms: KaleidoscopeUniforms = {
    layerColor: { value: color },
    distanceScale: { value: distanceScale },
    layerAlpha: { value: layerAlpha },
    time: { value: 0 },
    pulse: { value: new THREE.Vector3(0, 0, -1) },
    pulseSpeed: { value: 180 },
    pulseLifetime: { value: 2.4 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: kaleidoscopeVertexShader,
    fragmentShader: kaleidoscopeFragmentShader,
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}
