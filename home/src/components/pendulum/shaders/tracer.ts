export const tracerVertexShader = `
  attribute float alpha;
  varying float vAlpha;
  
  void main() {
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const tracerFragmentShader = `
  varying float vAlpha;
  uniform vec3 color;
  
  void main() {
    gl_FragColor = vec4(color, vAlpha);
  }
`;
