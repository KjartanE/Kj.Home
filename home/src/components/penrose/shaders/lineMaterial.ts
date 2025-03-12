export const fadeVertexShader = `
    precision highp float;
    attribute float width;
    varying float vWidth;
    varying vec3 vPosition;
    
    void main() {
      vWidth = width;
      // Explicitly copy the position to make sure it's preserved for distance calculations
      vPosition = vec3(position);
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
      // Make sure to use the absolute values to prevent negative distance issues
      float distanceFromCenter = length(vPosition);
      
      // Adjust width based on distance from center with more aggressive scaling
      // The further from center, the wider the line
      float scaleFactor = max(distanceScale * 3.0, 0.2);
      float adjustedWidth = baseWidth * (distanceFromCenter * scaleFactor);
      
      // Make sure the color value is properly calculated
      float color = mix(0.0, 1.0, themeColor);
      // Apply the width with more consistent calculation
      float intensity = clamp(adjustedWidth, 0.0, 1.0);
      gl_FragColor = vec4(intensity * color, intensity * color, intensity * color, 1.0);
    }
  `;
