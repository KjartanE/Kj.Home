import * as THREE from "three";

export const fadeVertexShader = `
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
    varying float vWidth;
    varying vec3 vPosition;
    uniform float themeColor;
    uniform float baseWidth;
    uniform float distanceScale;
    void main() {
      // Calculate distance from center (0,0,0)
      float distanceFromCenter = length(vPosition.xy);
      
      // Adjust width based on distance from center
      // The further from center, the wider the line
      float adjustedWidth = baseWidth * (25.0 + distanceFromCenter * distanceScale * 2.0);
      
      float color = mix(0.0, 1.0, themeColor);
      gl_FragColor = vec4(adjustedWidth * color, adjustedWidth * color, adjustedWidth * color, 1.0);
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
