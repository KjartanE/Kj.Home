import * as THREE from "three";

export function drawLine(scene, start, end) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.Line(geometry, material);
  
  // Optionally, store the start position for tracking if needed
  line.userData.start = start.clone(); // Store the start position in userData

  scene.add(line);
}