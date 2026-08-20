import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/** Lightweight depth-based blur pass. Focus distance is supplied in camera space. */
export const DepthOfFieldShader: THREE.Shader = {
  uniforms: {
    tDiffuse: { value: null },
    uFocusDistance: { value: 5 },
    uAperture: { value: 0.02 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uFocusDistance;
    uniform float uAperture;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      // Initial screen-space approximation. A depth texture can replace this
      // with true per-pixel camera-space depth in the renderer stage.
      float radial = distance(vUv, vec2(0.5));
      float amount = clamp(radial * uAperture * 18.0, 0.0, 1.0);
      vec2 px = vec2(1.0) / uResolution * amount * 3.0;
      vec4 c = texture2D(tDiffuse, vUv) * 0.4;
      c += texture2D(tDiffuse, vUv + vec2(px.x, 0.0)) * 0.15;
      c += texture2D(tDiffuse, vUv - vec2(px.x, 0.0)) * 0.15;
      c += texture2D(tDiffuse, vUv + vec2(0.0, px.y)) * 0.15;
      c += texture2D(tDiffuse, vUv - vec2(0.0, px.y)) * 0.15;
      gl_FragColor = mix(texture2D(tDiffuse, vUv), c, amount);
    }
  `,
};

export class DepthOfFieldPass extends ShaderPass {
  constructor() {
    super(DepthOfFieldShader);
  }

  setFocus(distance: number, aperture: number): void {
    this.uniforms.uFocusDistance.value = Math.max(0.01, distance);
    this.uniforms.uAperture.value = Math.max(0, aperture);
  }

  setResolution(width: number, height: number): void {
    this.uniforms.uResolution.value.set(width, height);
  }
}
