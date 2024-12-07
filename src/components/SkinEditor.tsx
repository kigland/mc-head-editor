import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useCallback, useRef } from 'react'
import MinecraftHead from './MinecraftHead'
import ColorPicker from './ColorPicker'
import PixelGrid from './PixelGrid'
import { exportGLTF } from './GLTFExporter';
import * as THREE from 'three';

type Face = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'

const createEmptyPixelGrid = () => Array(8).fill(0).map(() => Array(8).fill('#ffffff'))

const FACE_LABELS: Record<Face, string> = {
  front: '正面',
  right: '右面',
  back: '背面',
  left: '左面',
  top: '顶面',
  bottom: '底面'
}

// 定义皮肤面部的位置映射
const FACE_POSITIONS = {
  top: { x: 8, y: 0 },
  bottom: { x: 16, y: 0 },
  left: { x: 0, y: 8 },
  front: { x: 8, y: 8 },
  right: { x: 16, y: 8 },
  back: { x: 24, y: 8 }
} as const

export default function SkinEditor() {
  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [textures, setTextures] = useState<Record<Face, string[][]>>({
    front: createEmptyPixelGrid(),
    right: createEmptyPixelGrid(),
    back: createEmptyPixelGrid(),
    left: createEmptyPixelGrid(),
    top: createEmptyPixelGrid(),
    bottom: createEmptyPixelGrid(),
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePixelClick = useCallback((face: Face, x: number, y: number) => {
    setTextures(prev => ({
      ...prev,
      [face]: prev[face].map((row, rowIndex) =>
        rowIndex === y
          ? row.map((color, colIndex) => colIndex === x ? selectedColor : color)
          : row
      )
    }))
  }, [selectedColor])

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // 创建新的纹理对象
      const newTextures: Record<Face, string[][]> = {
        front: createEmptyPixelGrid(),
        right: createEmptyPixelGrid(),
        back: createEmptyPixelGrid(),
        left: createEmptyPixelGrid(),
        top: createEmptyPixelGrid(),
        bottom: createEmptyPixelGrid(),
      }

      // 从皮肤文件中提取每个面的像素
      Object.entries(FACE_POSITIONS).forEach(([face, position]) => {
        const facePixels = newTextures[face as Face]
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const pixelData = ctx.getImageData(position.x + x, position.y + y, 1, 1).data
            const color = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`
            facePixels[y][x] = color
          }
        }
      })

      setTextures(newTextures)
    }

    img.src = URL.createObjectURL(file)

    // 清除文件输入，这样同一个文件可以再次选择
    event.target.value = ''
  }

  const handleExport = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 32
    const ctx = canvas.getContext('2d')!

    // Fill background with transparency
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawFace = (face: Face, offsetX: number, offsetY: number) => {
      textures[face].forEach((row, y) => {
        row.forEach((color, x) => {
          ctx.fillStyle = color
          ctx.fillRect(offsetX + x, offsetY + y, 1, 1)
        })
      })
    }

    // Draw head faces according to Minecraft skin layout
    Object.entries(FACE_POSITIONS).forEach(([face, position]) => {
      drawFace(face as Face, position.x, position.y)
    })

    const link = document.createElement('a')
    link.download = 'minecraft-skin.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleDownloadModel = () => {
    const scene = new THREE.Scene();
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(createCanvasTexture(textures.front)),
      })
    );
    scene.add(headMesh);
    exportGLTF(scene);
  };

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
    return canvas;
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      {/* 3D Viewer - 1/3 width */}
      <div style={{
        width: '33.333%',
        height: '100%',
        backgroundColor: '#fff',
        borderRight: '1px solid #ddd',
        position: 'relative'
      }}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }} style={{ backgroundColor: '#333' }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[5, 5, 5]} intensity={2.0} />
          <pointLight position={[-5, 5, 5]} intensity={1.5} />
          <pointLight position={[5, -5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, 5]} intensity={1.0} />
          <MinecraftHead textures={textures} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Editor Panel - 2/3 width */}
      <div style={{
        width: '66.666%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff'
      }}>
        {/* Top Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
          
        }}>
          <img src="/logo.svg" alt="Minecraft Logo" style={{ width: '32px', marginRight: '8px' }} />
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            我的世界头头编辑器
          </h2>
          <div>By KIG.LAND</div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="file"
              accept=".png"
              onChange={handleImport}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>↑</span>
              导入
            </button>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>↓</span>
              导出
            </button>
            <button
              onClick={handleDownloadModel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              下载 3D 模型
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          gap: '24px'
        }}>
          {/* Color Picker Column */}
          <div style={{
            width: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <h3 style={{
                margin: 0,
                marginBottom: '12px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333'
              }}>
                颜色选择
              </h3>
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />
            </div>
          </div>

          {/* Face Editor Grid */}
          <div style={{
            flex: 1,
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333'
            }}>
              面部编辑
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {(Object.keys(FACE_LABELS) as Face[]).map(face => (
                <div key={face} style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{
                    margin: 0,
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666'
                  }}>
                    {FACE_LABELS[face]}
                  </h4>
                  <PixelGrid
                    width={8}
                    height={8}
                    selectedColor={selectedColor}
                    pixels={textures[face]}
                    onPixelClick={(x, y) => handlePixelClick(face, x, y)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
