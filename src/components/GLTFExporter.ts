import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export const exportGLTF = (scene: THREE.Scene) => {
  const exporter = new GLTFExporter();
  exporter.parse(scene, (result) => {
    const link = document.createElement('a');
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'model.glb';
    link.click();
    URL.revokeObjectURL(url);
  }, { binary: true });
};
