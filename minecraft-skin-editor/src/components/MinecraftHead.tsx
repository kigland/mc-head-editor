import { useRef, useMemo } from 'react'
import * as THREE from 'three'

interface MinecraftHeadProps {
  textures: {
    front: string[][];
    right: string[][];
    back: string[][];
    left: string[][];
    top: string[][];
    bottom: string[][];
  };
}

export default function MinecraftHead({ textures }: MinecraftHeadProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const materials = useMemo(() => {
    const createCanvasTexture = (pixels: string[][]) => {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d')!;
      
      pixels.forEach((row, y) => {
        row.forEach((color, x) => {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        });
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      return texture;
    };

    return [
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.right) }), // right
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.left) }), // left
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.top) }), // top
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.bottom) }), // bottom
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.front) }), // front
      new THREE.MeshStandardMaterial({ map: createCanvasTexture(textures.back) }), // back
    ];
  }, [textures]);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[0].map })} attach="material-0" />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[1].map })} attach="material-1" />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[2].map })} attach="material-2" />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[3].map })} attach="material-3" />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[4].map })} attach="material-4" />
      <primitive object={new THREE.MeshStandardMaterial({ map: materials[5].map })} attach="material-5" />
    </mesh>
  )
}
