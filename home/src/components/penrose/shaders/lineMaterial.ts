import * as THREE from "three";

export const fadeVertexShader = `
    precision highp float;
    attribute float width;
    varying float vWidth;
    varying vec3 vPosition;
    void main() {
      vWidth = width;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

export const fadeFragmentShader = `
    precision highp float;
    varying float vWidth;
    varying vec3 vPosition;
    uniform float themeColor;
    uniform float baseWidth;
    uniform float distanceScale;
    void main() {
      // Calculate distance from center (0,0,0) more precisely
      float distanceFromCenter = sqrt(vPosition.x * vPosition.x + vPosition.y * vPosition.y);
      
      // Adjust width based on distance from center with clamping to avoid extreme values
      // The further from center, the wider the line
      float scaleFactor = clamp(distanceScale * 2.0, 0.01, 5.0);
      float adjustedWidth = baseWidth * (14.0 + distanceFromCenter * scaleFactor);
      
      // Make sure the color value is properly calculated
      float color = mix(0.0, 1.0, themeColor);
      // Apply the width with more consistent calculation
      float intensity = clamp(adjustedWidth, 0.0, 1.0);
      gl_FragColor = vec4(intensity * color, intensity * color, intensity * color, 1.0);
    }
  `;

export const shadeLineMaterial = (themeColor: number) => {
  return new THREE.ShaderMaterial({
    vertexShader: fadeVertexShader,
    fragmentShader: fadeFragmentShader,
    uniforms: {
      themeColor: { value: themeColor },
      baseWidth: { value: 0.01 },
      distanceScale: { value: 0.1 }
    }
  });
};
