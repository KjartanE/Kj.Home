import * as THREE from "three"

export class Chadni {
  public geometry: THREE.PlaneGeometry
  public material: THREE.ShaderMaterial

  constructor() {
    this.geometry = new THREE.PlaneGeometry(
      window.innerHeight,
      window.innerHeight
    )
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: {
          value: new THREE.Vector2(window.innerHeight, window.innerHeight),
        },
        u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
        u_pi: { value: Math.PI },
        u_n: { value: 3 },
        u_m: { value: 4 },
        u_a: { value: -5 },
        u_b: { value: 20 },
        colorOne: { value: new THREE.Color(0x000000) },
        colorTwo: { value: new THREE.Color(0xffffff) },
        opacityOne: { value: 1.0 },
        opacityTwo: { value: 1.0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    return this
  }
}

export const vertexShader = `
          void main() {
            gl_Position = vec4(position, 1.0);
            }
            `

export const fragmentShader = `
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_pi;
        uniform float u_n;
        uniform float u_m;
        uniform float u_a;
        uniform float u_b;
        uniform vec3 colorOne;
        uniform vec3 colorTwo;
        uniform float opacityOne;
        uniform float opacityTwo;
      
        void main() {
          vec2 st = gl_FragCoord.xy/u_resolution.xy;
          
          //a*sin(pi*x*n)*sin(pi*y*m) + b*sin(pi*x*m)*sin(pi*y*n)
          float a = u_a*sin(u_time);
          float b = u_b*cos(u_time);
      
          float n = u_n;
          float m = u_m;
      
          float x = st.x;
          float y = st.y;
      
          float r = a*sin(u_pi*x*n)*sin(u_pi*y*m) + b*sin(u_pi*x*m)*sin(u_pi*y*n);
          
          r = 1.0 - r;
          float color = r;
      
          if (color > 0.0) {
            gl_FragColor = (color-1.0)*vec4(colorOne,opacityOne);
          } else {
            gl_FragColor = (-color-1.0)*vec4(colorTwo,opacityTwo);
          }
        }
          `
