import * as THREE from "three";

export class ThreeCleanup {
  static disposeGeometry(geometry: THREE.BufferGeometry | null) {
    if (geometry) {
      geometry.dispose();
    }
  }

  static disposeMaterial(material: THREE.Material | THREE.Material[] | null) {
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose());
    } else if (material) {
      material.dispose();
    }
  }

  static disposeObject(obj: THREE.Object3D) {
    if (!obj) return;

    // Handle children
    while (obj.children.length > 0) {
      ThreeCleanup.disposeObject(obj.children[0]);
      obj.remove(obj.children[0]);
    }

    // Dispose geometry
    if ((obj as any).geometry) {
      ThreeCleanup.disposeGeometry((obj as any).geometry);
    }

    // Dispose material(s)
    if ((obj as any).material) {
      ThreeCleanup.disposeMaterial((obj as any).material);
    }
  }

  static disposeScene(scene: THREE.Scene) {
    scene.traverse((object) => {
      ThreeCleanup.disposeObject(object);
    });
  }
}
