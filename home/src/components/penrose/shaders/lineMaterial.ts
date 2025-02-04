import * as THREE from "three";

export function shadeLineMaterial(themeColor: number) {
  return new THREE.LineBasicMaterial({
    color: themeColor === 1.0 ? 0xffffff : 0x000000,
    linewidth: 2
  });
}
